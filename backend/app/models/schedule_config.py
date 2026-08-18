from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base


class ScheduleConfig(Base):
    __tablename__ = "schedule_config"

    id = Column(Integer, primary_key=True, default=1)  # singleton — always id=1
    problems_per_week = Column(Integer, nullable=False, default=10)
    easy_pct = Column(Integer, nullable=False, default=20)
    medium_pct = Column(Integer, nullable=False, default=60)
    hard_pct = Column(Integer, nullable=False, default=20)
    active_days = Column(String, nullable=False, default="mon,tue,wed,thu,fri")  # CSV
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
