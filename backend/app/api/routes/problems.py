import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.problem import Problem
from app.models.solve_log import SolveLog
from app.schemas.problem import ProblemDetailResponse, ProblemResponse
from app.schemas.solve_log import SolveLogResponse

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("", response_model=list[ProblemResponse])
def list_problems(
    pattern: str | None = Query(None),
    difficulty: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Problem)

    if pattern:
        query = query.filter(Problem.pattern == pattern)
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    if status:
        query = query.filter(Problem.status == status)
    if search:
        query = query.filter(Problem.title.ilike(f"%{search}%"))

    return query.order_by(Problem.neetcode_order).all()


@router.get("/patterns", response_model=list[str])
def list_patterns(db: Session = Depends(get_db)):
    rows = db.query(Problem.pattern).distinct().order_by(Problem.pattern).all()
    return [r[0] for r in rows]


@router.get("/{problem_id}", response_model=ProblemDetailResponse)
def get_problem(problem_id: int, db: Session = Depends(get_db)):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    logs = (
        db.query(SolveLog)
        .filter(SolveLog.problem_id == problem_id)
        .order_by(SolveLog.created_at.desc())
        .all()
    )

    return ProblemDetailResponse(
        **{c.name: getattr(problem, c.name) for c in problem.__table__.columns},
        solve_history=[SolveLogResponse.model_validate(log) for log in logs],
    )
