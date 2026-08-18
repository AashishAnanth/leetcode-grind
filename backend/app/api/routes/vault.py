from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.problem import Problem
from app.models.solve_log import SolveLog
from app.models.vault_entry import VaultEntry
from app.schemas.problem import ProblemResponse
from app.schemas.vault_entry import VaultEntryResponse, VaultEntryUpdate
from app.services.claude import draft_vault_entry

router = APIRouter(prefix="/vault", tags=["vault"])


@router.get("", response_model=list[VaultEntryResponse])
def list_vault_entries(db: Session = Depends(get_db)):
    return db.query(VaultEntry).order_by(VaultEntry.pattern).all()


@router.get("/{pattern}", response_model=VaultEntryResponse)
def get_vault_entry(pattern: str, db: Session = Depends(get_db)):
    entry = db.query(VaultEntry).filter(VaultEntry.pattern == pattern).first()
    if not entry:
        # Auto-create empty entry
        entry = VaultEntry(pattern=pattern, content="", updated_at=datetime.utcnow())
        db.add(entry)
        db.commit()
        db.refresh(entry)
    return entry


@router.put("/{pattern}", response_model=VaultEntryResponse)
def update_vault_entry(
    pattern: str,
    payload: VaultEntryUpdate,
    db: Session = Depends(get_db),
):
    entry = db.query(VaultEntry).filter(VaultEntry.pattern == pattern).first()
    if not entry:
        entry = VaultEntry(pattern=pattern, content=payload.content, updated_at=datetime.utcnow())
        db.add(entry)
    else:
        entry.content = payload.content
        entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{pattern}/problems", response_model=list[ProblemResponse])
def get_linked_problems(pattern: str, db: Session = Depends(get_db)):
    """Return problems in this pattern that the user has attempted or solved."""
    return (
        db.query(Problem)
        .filter(
            Problem.pattern == pattern,
            Problem.status != "todo",
        )
        .order_by(Problem.neetcode_order)
        .all()
    )


@router.post("/{pattern}/draft")
def draft_entry(pattern: str, db: Session = Depends(get_db)):
    """Ask Claude to draft a vault entry for this pattern, informed by solved problems."""
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")

    # Gather the user's solved problems for this pattern as context
    solved = (
        db.query(Problem, SolveLog)
        .join(SolveLog, SolveLog.problem_id == Problem.id)
        .filter(Problem.pattern == pattern, Problem.status != "todo")
        .order_by(SolveLog.created_at.desc())
        .all()
    )

    # Deduplicate to one entry per problem (most recent log)
    seen: set[int] = set()
    summaries = []
    for problem, log in solved:
        if problem.id not in seen:
            seen.add(problem.id)
            summaries.append({
                "title": problem.title,
                "difficulty": problem.difficulty,
                "perceived_difficulty": log.perceived_difficulty,
                "notes": log.notes,
            })

    content = draft_vault_entry(pattern=pattern, solved_summaries=summaries)
    return {"pattern": pattern, "content": content}
