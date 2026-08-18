from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.problem import Problem
from app.models.solve_log import SolveLog
from app.models.vault_entry import VaultEntry
from app.models.whiteboard_message import WhiteboardMessage
from app.schemas.whiteboard import WhiteboardMessageCreate, WhiteboardMessageResponse
from app.services.claude import analyze, chat

router = APIRouter(prefix="/whiteboard", tags=["whiteboard"])


def _get_problem_or_404(problem_id: int, db: Session) -> Problem:
    p = db.query(Problem).filter(Problem.id == problem_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return p


def _latest_code(problem_id: int, db: Session) -> str | None:
    """Return the code from the most recent solve log, if any."""
    log = (
        db.query(SolveLog)
        .filter(SolveLog.problem_id == problem_id, SolveLog.code.isnot(None))
        .order_by(SolveLog.created_at.desc())
        .first()
    )
    return log.code if log else None


def _vault_content(pattern: str, db: Session) -> str | None:
    """Return the vault markdown for a given pattern, if it exists and is non-empty."""
    entry = db.query(VaultEntry).filter(VaultEntry.pattern == pattern).first()
    return entry.content if entry and entry.content else None


@router.get("/{problem_id}/messages", response_model=list[WhiteboardMessageResponse])
def get_messages(problem_id: int, db: Session = Depends(get_db)):
    return (
        db.query(WhiteboardMessage)
        .filter(WhiteboardMessage.problem_id == problem_id)
        .order_by(WhiteboardMessage.created_at)
        .all()
    )


@router.post("/{problem_id}/message", response_model=WhiteboardMessageResponse)
def send_message(
    problem_id: int,
    payload: WhiteboardMessageCreate,
    db: Session = Depends(get_db),
):
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")

    problem = _get_problem_or_404(problem_id, db)

    # Persist the user message
    user_msg = WhiteboardMessage(
        problem_id=problem_id,
        role="user",
        content=payload.content,
        mode=payload.mode,
        created_at=datetime.utcnow(),
    )
    db.add(user_msg)
    db.commit()

    # Build history for Claude (only content + role, ordered)
    history_rows = (
        db.query(WhiteboardMessage)
        .filter(WhiteboardMessage.problem_id == problem_id)
        .order_by(WhiteboardMessage.created_at)
        .all()
    )
    # Exclude the message we just saved (it gets appended inside chat())
    history = [
        {"role": r.role, "content": r.content}
        for r in history_rows[:-1]
    ]

    reply_text = chat(
        problem=problem,
        history=history,
        user_message=payload.content,
        mode=payload.mode,
        latest_code=_latest_code(problem_id, db),
        vault_content=_vault_content(problem.pattern, db),
    )

    assistant_msg = WhiteboardMessage(
        problem_id=problem_id,
        role="assistant",
        content=reply_text,
        mode=payload.mode,
        created_at=datetime.utcnow(),
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg


@router.post("/{problem_id}/analyze", response_model=WhiteboardMessageResponse)
def analyze_code(problem_id: int, db: Session = Depends(get_db)):
    """Run a one-shot code gap analysis on the latest solve log for this problem."""
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")

    problem = _get_problem_or_404(problem_id, db)

    code = _latest_code(problem_id, db)
    if not code:
        raise HTTPException(status_code=400, detail="No code found — log a solve attempt with code first")

    analysis = analyze(
        problem=problem,
        code=code,
        vault_content=_vault_content(problem.pattern, db),
    )

    # Persist as an assistant message so it appears inline in the conversation
    msg = WhiteboardMessage(
        problem_id=problem_id,
        role="assistant",
        content=analysis,
        mode="explain",
        created_at=datetime.utcnow(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{problem_id}/messages")
def clear_messages(problem_id: int, db: Session = Depends(get_db)):
    db.query(WhiteboardMessage).filter(WhiteboardMessage.problem_id == problem_id).delete()
    db.commit()
    return {"message": "Conversation cleared"}
