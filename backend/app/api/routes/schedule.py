from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.daily_queue import DailyQueue
from app.models.problem import Problem
from app.models.solve_log import SolveLog
from app.schemas.problem import ProblemResponse
from app.schemas.schedule_config import ScheduleConfigResponse, ScheduleConfigUpdate
from app.services.scheduler import (
    get_daily_target,
    get_due_reviews,
    get_new_problems,
    get_or_create_config,
    is_active_today,
)

router = APIRouter(prefix="/schedule", tags=["schedule"])


# ── helpers ──────────────────────────────────────────────────────────────────

def _lock_queue(db: Session, today: str) -> None:
    """Generate and persist today's queue on first call of the day."""
    config = get_or_create_config(db)
    reviews = get_due_reviews(db)

    new_problems = []
    if is_active_today(config):
        daily_target = get_daily_target(config)
        remaining = max(0, daily_target - len(reviews))
        new_problems = get_new_problems(db, config, remaining)

    for p in reviews:
        db.merge(DailyQueue(date=today, problem_id=p.id, queue_type="review"))
    for p in new_problems:
        db.merge(DailyQueue(date=today, problem_id=p.id, queue_type="new"))
    db.commit()


def _get_locked_queue(db: Session, today: str):
    """Return today's queue rows, creating them if this is the first call today."""
    existing = db.query(DailyQueue).filter(DailyQueue.date == today).all()
    if not existing:
        _lock_queue(db, today)
        existing = db.query(DailyQueue).filter(DailyQueue.date == today).all()
    return existing


def _solved_today(db: Session, today: str) -> set[int]:
    """Problem IDs that have a solve_log created today."""
    rows = (
        db.query(SolveLog.problem_id)
        .filter(func.date(SolveLog.created_at) == today)
        .all()
    )
    return {r[0] for r in rows}


# ── routes ───────────────────────────────────────────────────────────────────

@router.get("/config", response_model=ScheduleConfigResponse)
def get_config(db: Session = Depends(get_db)):
    return get_or_create_config(db)


@router.put("/config", response_model=ScheduleConfigResponse)
def update_config(payload: ScheduleConfigUpdate, db: Session = Depends(get_db)):
    config = get_or_create_config(db)
    if payload.problems_per_week is not None:
        config.problems_per_week = payload.problems_per_week
    if payload.easy_pct is not None:
        config.easy_pct = payload.easy_pct
    if payload.medium_pct is not None:
        config.medium_pct = payload.medium_pct
    if payload.hard_pct is not None:
        config.hard_pct = payload.hard_pct
    if payload.active_days is not None:
        config.active_days = ",".join(payload.active_days)
    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config


@router.get("/today")
def get_today_queue(db: Session = Depends(get_db)):
    today = str(date.today())
    config = get_or_create_config(db)
    queue_rows = _get_locked_queue(db, today)
    done_ids = _solved_today(db, today)

    problem_ids = [row.problem_id for row in queue_rows]
    problems_by_id: dict[int, Problem] = {
        p.id: p
        for p in db.query(Problem).filter(Problem.id.in_(problem_ids)).all()
    } if problem_ids else {}

    reviews, new_problems, completed = [], [], []
    for row in queue_rows:
        p = problems_by_id.get(row.problem_id)
        if not p:
            continue
        entry = {**ProblemResponse.model_validate(p).model_dump(), "completed": row.problem_id in done_ids}
        if row.problem_id in done_ids:
            completed.append(entry)
        elif row.queue_type == "review":
            reviews.append(entry)
        else:
            new_problems.append(entry)

    return {
        "date": today,
        "is_active_day": is_active_today(config),
        "daily_target": get_daily_target(config),
        "reviews": reviews,
        "new_problems": new_problems,
        "completed": completed,
    }


@router.delete("/today")
def reset_today_queue(db: Session = Depends(get_db)):
    """Force-regenerate today's queue (e.g. after changing config)."""
    today = str(date.today())
    db.query(DailyQueue).filter(DailyQueue.date == today).delete()
    db.commit()
    _lock_queue(db, today)
    return {"message": "Queue reset for today"}


@router.get("/stats")
def get_stats(days: int = 90, db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=days)

    rows = (
        db.query(
            func.date(SolveLog.created_at).label("day"),
            func.count(SolveLog.id).label("count"),
        )
        .filter(SolveLog.created_at >= cutoff)
        .group_by(func.date(SolveLog.created_at))
        .all()
    )

    activity: dict[str, int] = {str(r.day): r.count for r in rows}

    streak = 0
    check = date.today()
    while True:
        if activity.get(str(check), 0) > 0:
            streak += 1
            check -= timedelta(days=1)
        else:
            break

    return {"activity": activity, "streak": streak}
