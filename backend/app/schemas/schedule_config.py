from datetime import datetime

from pydantic import BaseModel, field_validator


class ScheduleConfigUpdate(BaseModel):
    problems_per_week: int | None = None
    easy_pct: int | None = None
    medium_pct: int | None = None
    hard_pct: int | None = None
    active_days: list[str] | None = None  # ["mon", "tue", ...]

    @field_validator("active_days")
    @classmethod
    def validate_days(cls, v):
        valid = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"}
        if v is not None:
            for d in v:
                if d not in valid:
                    raise ValueError(f"Invalid day: {d}")
        return v


class ScheduleConfigResponse(BaseModel):
    id: int
    problems_per_week: int
    easy_pct: int
    medium_pct: int
    hard_pct: int
    active_days: list[str]
    updated_at: datetime

    @field_validator("active_days", mode="before")
    @classmethod
    def parse_active_days(cls, v):
        if isinstance(v, str):
            return [d.strip() for d in v.split(",") if d.strip()]
        return v or []

    model_config = {"from_attributes": True}
