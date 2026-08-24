from __future__ import annotations
from typing import Optional
from sqlalchemy import Integer, Text, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from backend.core.database import Base

class BingoEntry(Base):
    """Cella della bingo card annuale."""
    __tablename__ = "bingo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    testo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    posizione: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rotazione: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    __table_args__ = (
        Index("ix_bingo_user_year", "user_id", "year"),
    )
