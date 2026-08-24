from __future__ import annotations
from typing import Optional
from sqlalchemy import Integer, String, Text, Boolean, ForeignKey, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import text
from backend.core.database import Base

VALID_YEARLY_TYPES = {
    'OY', 'P1', 'P2', 'P3',
    'PR',
    'MJ', 'MS', 'MA', 'MD', 'MT',
    'SC', 'SF', 'SA', 'SH', 'SS', 'SD', 'SM', 'SW',
    'EP', 'EN',
    'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6',
    'TG',
}

NUMERIC_YEARLY_TYPES = {'MJ', 'MS', 'MA', 'MD', 'MT', 'SC', 'SF', 'SA', 'SH', 'SS', 'SD', 'SM', 'SW'}
MULTI_RECORD_YEARLY_TYPES = {'PR', 'EP', 'EN', 'TG'}

class YearlyEntry(Base):
    """Modello per le registrazioni annuali."""
    __tablename__ = "yearly_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    yearly_type: Mapped[str] = mapped_column(String(2), nullable=False)
    yearly_field: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "yearly_type IN ('OY','P1','P2','P3','PR','MJ','MS','MA','MD','MT','SC','SF','SA','SH','SS','SD','SM','SW','EP','EN','Q1','Q2','Q3','Q4','Q5','Q6','TG')",
            name="ck_yearly_entries_type_valid",
        ),
        Index(
            "ix_yearly_entries_unique",
            "user_id", "year", "yearly_type",
            unique=True,
            postgresql_where=text("yearly_type NOT IN ('PR', 'EP', 'EN', 'TG')")
        ),
        Index("ix_yearly_entries_user_year", "user_id", "year"),
        Index("ix_yearly_entries_yearly_type", "yearly_type"),
    )
