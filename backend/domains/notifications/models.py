"""
Notifications/Interactions domain models.
Unified model for Ephemeral Messages, Comments, Friend Requests, and System Alerts.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base

if TYPE_CHECKING:
    from backend.domains.users.models import User


class Interaction(Base):
    """Unified interaction entry (Messages, Comments, Notifications)."""

    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    author_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    recipient_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    reference_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    author: Mapped[Optional["User"]] = relationship("User", foreign_keys=[author_id], back_populates="authored_interactions")
    recipient: Mapped[Optional["User"]] = relationship("User", foreign_keys=[recipient_id], back_populates="received_interactions")
