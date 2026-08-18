from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from app.core.database import Base


class DailyQueue(Base):
    __tablename__ = "daily_queue"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False, index=True)       # "YYYY-MM-DD"
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    queue_type = Column(String, nullable=False)              # "new" | "review"

    __table_args__ = (UniqueConstraint("date", "problem_id", name="uq_daily_queue_date_problem"),)
