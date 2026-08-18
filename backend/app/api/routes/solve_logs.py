from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.problem import Problem
from app.models.solve_log import SolveLog
from app.schemas.solve_log import SolveLogCreate, SolveLogResponse
from app.services.sm2 import calculate_next_review

router = APIRouter(prefix="/problems", tags=["solve-logs"])


@router.post("/{problem_id}/log", response_model=SolveLogResponse, status_code=201)
def submit_solve_log(
    problem_id: int,
    payload: SolveLogCreate,
    db: Session = Depends(get_db),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    attempt_number = (
        db.query(SolveLog).filter(SolveLog.problem_id == problem_id).count() + 1
    )

    last_log = (
        db.query(SolveLog)
        .filter(SolveLog.problem_id == problem_id)
        .order_by(SolveLog.created_at.desc())
        .first()
    )
    prior_interval = last_log.review_interval_days if last_log else 1

    next_review_at = None
    new_interval = prior_interval

    if payload.status in ("solved", "needs-review") and payload.perceived_difficulty:
        next_review_at, new_interval = calculate_next_review(
            perceived_difficulty=payload.perceived_difficulty,
            interval_days=prior_interval,
            attempt_number=attempt_number,
        )

    log = SolveLog(
        problem_id=problem_id,
        status=payload.status,
        time_minutes=payload.time_minutes,
        perceived_difficulty=payload.perceived_difficulty,
        code=payload.code,
        language=payload.language,
        notes=payload.notes,
        attempt_number=attempt_number,
        next_review_at=next_review_at,
        review_interval_days=new_interval,
    )
    db.add(log)

    # Sync denormalized status on Problem
    problem.status = payload.status

    db.commit()
    db.refresh(log)
    return log


@router.get("/{problem_id}/history", response_model=list[SolveLogResponse])
def get_solve_history(problem_id: int, db: Session = Depends(get_db)):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    return (
        db.query(SolveLog)
        .filter(SolveLog.problem_id == problem_id)
        .order_by(SolveLog.created_at.desc())
        .all()
    )


@router.delete("/log/{log_id}", status_code=204)
def delete_solve_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(SolveLog).filter(SolveLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    problem_id = log.problem_id
    db.delete(log)

    # Recompute denormalized status from remaining logs
    latest = (
        db.query(SolveLog)
        .filter(SolveLog.problem_id == problem_id)
        .order_by(SolveLog.created_at.desc())
        .first()
    )
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if problem:
        problem.status = latest.status if latest else "todo"

    db.commit()
