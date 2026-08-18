from datetime import datetime

from pydantic import BaseModel


class SolveLogCreate(BaseModel):
    status: str             # attempted | solved | needs-review
    time_minutes: int | None = None
    perceived_difficulty: str | None = None  # easy | medium | hard
    code: str | None = None
    language: str | None = None
    notes: str | None = None


class SolveLogResponse(BaseModel):
    id: int
    problem_id: int
    status: str
    time_minutes: int | None
    perceived_difficulty: str | None
    code: str | None
    language: str | None
    notes: str | None
    attempt_number: int
    next_review_at: datetime | None
    review_interval_days: int
    created_at: datetime

    model_config = {"from_attributes": True}
