"""
Planning domain models.
Daily entries for goals, priorities, notes, and calendar pixels.
"""
from __future__ import annotations


from datetime import date
from typing import TYPE_CHECKING, Optional


from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import text


from backend.core.database import Base


if TYPE_CHECKING:
    from backend.domains.categories.models import UserCategory
    from backend.domains.users.models import User


class DailyEntry(Base):
    """Unified planning entry for daily, weekly, monthly and pixel records."""

    __tablename__ = "daily_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    data_riferimento: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    # Tipi ammessi: PX, OD, PD, N1, N2, N3, N4, OW, PW, OM, PM, EP, EN, EPM, ENM
    # Regole di unicità per user_id + data_riferimento:
    #   OD -> massimo 1 record/giorno (indipendente da PX)
    #   PX -> massimo 1 record/giorno (indipendente da OD)
    #   OW -> massimo 1 record/settimana (stessa data_riferimento usata come ancora settimana)
    #   OM -> massimo 1 record/mese (stessa data_riferimento usata come ancora mese)
    #   altri -> ripetibili senza limite
    tipo: Mapped[str] = mapped_column(String(4), nullable=False)

    testo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completato: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    category_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("user_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="daily_entries",
    )

    category: Mapped[Optional["UserCategory"]] = relationship(
        "UserCategory",
        back_populates="daily_entries",
    )

    __table_args__ = (
        CheckConstraint(
            "tipo IN ('PX','OD','PD','N1','N2','N3','N4','OW','PW','EP','EN')",
            name="ck_daily_entries_tipo_valid",
        ),
        Index(
            "ux_daily_entries_one_od_per_day",
            "user_id", "data_riferimento",
            unique=True,
            postgresql_where=text("tipo = 'OD'"),
        ),
        Index(
            "ux_daily_entries_one_px_per_day",
            "user_id", "data_riferimento",
            unique=True,
            postgresql_where=text("tipo = 'PX'"),
        ),
        Index(
            "ux_daily_entries_one_weekly_goal",
            "user_id", "data_riferimento",
            unique=True,
            postgresql_where=text("tipo = 'OW'"),
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<DailyEntry id={self.id} user_id={self.user_id} "
            f"tipo={self.tipo} data_riferimento={self.data_riferimento}>"
        )