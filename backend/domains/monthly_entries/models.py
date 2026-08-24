from __future__ import annotations
from typing import Optional
from sqlalchemy import Integer, String, Text, ForeignKey, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import text
from backend.core.database import Base

VALID_MONTHLY_TYPES = {
    'MJ', 'MS', 'MA', 'MD', 'MT',
    'SC', 'SF', 'SA', 'SH', 'SS', 'SD', 'SM', 'SW',
    'EP', 'EN', 'OM', 'PM',
    'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'TG',
}

NUMERIC_MONTHLY_TYPES = {'MJ', 'MS', 'MA', 'MD', 'MT', 'SC', 'SF', 'SA', 'SH', 'SS', 'SD', 'SM', 'SW'}
MULTI_RECORD_TYPES = {'EP', 'EN', 'PM', 'TG'}

class MonthlyEntry(Base):
    """
    Modello per le registrazioni mensili.
    """
    __tablename__ = "monthly_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    monthly_type: Mapped[str] = mapped_column(String(2), nullable=False)
    monthly_field: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "monthly_type IN ('MJ','MS','MA','MD','MT','SC','SF','SA','SH','SS','SD','SM','SW','EP','EN','OM','PM','Q1','Q2','Q3','Q4','Q5','Q6','TG')",
            name="ck_monthly_entries_type_valid",
        ),
        Index(
            "ix_monthly_entries_unique",
            "user_id", "year", "month", "monthly_type",
            unique=True,
            postgresql_where=text("monthly_type NOT IN ('EP', 'EN', 'PM', 'TG')")
        ),
        Index("ix_monthly_entries_user_year_month", "user_id", "year", "month"),
        Index("ix_monthly_entries_monthly_type", "monthly_type"),
    )
