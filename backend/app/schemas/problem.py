import json

from pydantic import BaseModel, field_validator

from app.schemas.solve_log import SolveLogResponse


class ProblemResponse(BaseModel):
    id: int
    neetcode_order: int
    title: str
    slug: str
    difficulty: str
    pattern: str
    leetcode_number: int | None
    status: str
    concepts: list[str] = []

    @field_validator("concepts", mode="before")
    @classmethod
    def parse_concepts(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v or []

    model_config = {"from_attributes": True}


class ProblemDetailResponse(ProblemResponse):
    solve_history: list[SolveLogResponse] = []
