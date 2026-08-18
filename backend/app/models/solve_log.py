from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.core.database import Base


class SolveLog(Base):
    __tablename__ = "solve_logs"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False, index=True)

    status = Column(String, nullable=False)           # attempted | solved | needs-review
    time_minutes = Column(Integer, nullable=True)
    perceived_difficulty = Column(String, nullable=True)  # easy | medium | hard
    code = Column(Text, nullable=True)
    language = Column(String, nullable=True)          # python | java | cpp | js | etc.
    notes = Column(Text, nullable=True)
    attempt_number = Column(Integer, nullable=False, default=1)

    # SM-2 spaced repetition
    next_review_at = Column(DateTime, nullable=True)
    review_interval_days = Column(Integer, nullable=False, default=1)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
