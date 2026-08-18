"""
Queue generation and schedule helpers.
"""
from datetime import date, datetime, timedelta
from math import ceil

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.problem import Problem
from app.models.schedule_config import ScheduleConfig
from app.models.solve_log import SolveLog

DAY_MAP = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}


def get_or_create_config(db: Session) -> ScheduleConfig:
    config = db.query(ScheduleConfig).filter(ScheduleConfig.id == 1).first()
    if not config:
        config = ScheduleConfig(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def parse_active_days(config: ScheduleConfig) -> list[str]:
    return [d.strip() for d in config.active_days.split(",") if d.strip()]


def is_active_today(config: ScheduleConfig) -> bool:
    active = parse_active_days(config)
    today_dow = date.today().weekday()  # 0 = Monday
    return any(DAY_MAP.get(d) == today_dow for d in active)


def get_daily_target(config: ScheduleConfig) -> int:
    active = parse_active_days(config)
    n_active = len(active) or 5
    return ceil(config.problems_per_week / n_active)


def get_due_reviews(db: Session) -> list[Problem]:
    """Problems whose latest SolveLog has next_review_at <= now."""
    now = datetime.utcnow()

    latest_subq = (
        db.query(
            SolveLog.problem_id,
            func.max(SolveLog.created_at).label("max_created_at"),
        )
        .group_by(SolveLog.problem_id)
        .subquery()
    )

    due_ids = (
        db.query(SolveLog.problem_id)
        .join(
            latest_subq,
            (SolveLog.problem_id == latest_subq.c.problem_id)
            & (SolveLog.created_at == latest_subq.c.max_created_at),
        )
        .filter(SolveLog.next_review_at.isnot(None))
        .filter(SolveLog.next_review_at <= now)
        .all()
    )

    ids = [row[0] for row in due_ids]
    if not ids:
        return []
    return (
        db.query(Problem)
        .filter(Problem.id.in_(ids))
        .order_by(Problem.neetcode_order)
        .all()
    )


def _hard_solve_rate(db: Session, lookback: int = 10) -> float:
    """
    Fraction of the last `lookback` solved logs on hard problems that were
    perceived as easy or medium (i.e. the student handled them).
    Returns 1.0 (no softening) if there aren't enough hard attempts yet.
    """
    recent_hard = (
        db.query(SolveLog)
        .join(Problem, Problem.id == SolveLog.problem_id)
        .filter(
            Problem.difficulty == "hard",
            SolveLog.status.in_(["solved", "needs-review"]),
            SolveLog.perceived_difficulty.isnot(None),
        )
        .order_by(SolveLog.created_at.desc())
        .limit(lookback)
        .all()
    )

    if len(recent_hard) < 3:  # not enough data — don't adjust yet
        return 1.0

    comfortable = sum(1 for log in recent_hard if log.perceived_difficulty in ("easy", "medium"))
    return comfortable / len(recent_hard)


def get_new_problems(db: Session, config: ScheduleConfig, n: int) -> list[Problem]:
    """Pick n new problems from todo pool, respecting difficulty ratios.

    If the student is struggling with hard problems (comfortable rate < 40%),
    reallocate hard slots to medium until their rate recovers.
    """
    if n <= 0:
        return []

    easy_pct = config.easy_pct
    medium_pct = config.medium_pct
    hard_pct = config.hard_pct

    if hard_pct > 0 and _hard_solve_rate(db) < 0.4:
        # Shift hard allocation to medium
        medium_pct += hard_pct
        hard_pct = 0

    easy_n = round(n * easy_pct / 100)
    medium_n = round(n * medium_pct / 100)
    hard_n = n - easy_n - medium_n  # absorb rounding error (0 when hard_pct==0)

    results: list[Problem] = []
    for diff, count in [("easy", easy_n), ("medium", medium_n), ("hard", hard_n)]:
        if count <= 0:
            continue
        batch = (
            db.query(Problem)
            .filter(Problem.status == "todo", Problem.difficulty == diff)
            .order_by(Problem.neetcode_order)
            .limit(count)
            .all()
        )
        results.extend(batch)

    results.sort(key=lambda p: p.neetcode_order)
    return results
