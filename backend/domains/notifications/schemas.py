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
    
    # Extra fields populated dynamically
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    context_title: Optional[str] = None
    series_tmdb_id: Optional[int] = None
    season_number: Optional[int] = None
    episode_id: Optional[int] = None
    movie_tmdb_id: Optional[int] = None


class SystemBroadcastCreate(StrictBaseModel):
    """Request model for creating a system-wide broadcast announcement."""

    title: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=2)
    level: str = Field("WARNING", description="INFO, WARNING, CRITICAL")
    show_popup: bool = True
    send_inbox: bool = True
    expires_at: Optional[datetime] = None


class SystemBroadcastResponse(ORMBaseModel):
    """Response model for system broadcast announcements."""

    id: int
    title: str
    message: str
    level: str
    show_popup: bool
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None
    created_by_id: Optional[int] = None
    created_by_name: Optional[str] = None

