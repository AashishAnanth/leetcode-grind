from datetime import datetime

from pydantic import BaseModel


class WhiteboardMessageCreate(BaseModel):
    content: str
    mode: str  # hint | explain


class WhiteboardMessageResponse(BaseModel):
    id: int
    problem_id: int
    role: str
    content: str
    mode: str
    created_at: datetime

    model_config = {"from_attributes": True}
