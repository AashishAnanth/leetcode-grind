from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text

from app.core.database import Base


class VaultEntry(Base):
    __tablename__ = "vault_entries"

    pattern = Column(String, primary_key=True, index=True)
    content = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
