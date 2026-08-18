from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.core.database import Base


class WhiteboardMessage(Base):
    __tablename__ = "whiteboard_messages"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False, index=True)
    role = Column(String, nullable=False)   # user | assistant
    content = Column(Text, nullable=False)
    mode = Column(String, nullable=False)   # hint | explain
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
