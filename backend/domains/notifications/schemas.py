"""
Interactions domain schemas.
Pydantic models for unified interactions (Messages, Comments, Notifications).
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import Field

from backend.core.schemas import ORMBaseModel, StrictBaseModel


class InteractionCreate(StrictBaseModel):
    """Request model for creating an interaction."""

    interaction_type: str = Field(..., description="e.g. COMMENT, EPHEMERAL_MSG, FRIEND_REQUEST, SYSTEM_ALERT")
    recipient_id: Optional[int] = None
    reference_id: Optional[int] = None
    content: str = Field(..., min_length=1)


class InteractionResponse(ORMBaseModel):
    """Response model for interactions."""

    id: int
    interaction_type: str
    author_id: Optional[int] = None
    recipient_id: Optional[int] = None
    reference_id: Optional[int] = None
    content: str
    created_at: datetime
    read_at: Optional[datetime] = None
