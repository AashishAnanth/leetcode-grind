from datetime import datetime

from pydantic import BaseModel


class VaultEntryUpdate(BaseModel):
    content: str


class VaultEntryResponse(BaseModel):
    pattern: str
    content: str
    updated_at: datetime

    model_config = {"from_attributes": True}
