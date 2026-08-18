from sqlalchemy import Boolean, Column, Integer, String

from app.core.database import Base


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    neetcode_order = Column(Integer, nullable=False, unique=True)
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True, index=True)
    difficulty = Column(String, nullable=False)         # easy | medium | hard
    pattern = Column(String, nullable=False, index=True)

    leetcode_number = Column(Integer, nullable=True)
    concepts = Column(String, nullable=True)            # JSON array, e.g. '["hash map","prefix sum"]'

    # Denormalized from SolveLog — updated on every log submission for fast filtering
    status = Column(String, nullable=False, default="todo")  # todo | attempted | solved | needs-review
