"""
Social domain schemas.
"""
from datetime import datetime
from typing import Literal

from pydantic import Field

from backend.core.schemas import ORMBaseModel
from backend.domains.users.schemas import UserPublicResponse


class FriendshipResponse(ORMBaseModel):
    """Response model for a friendship."""
    id: int
    requester_id: int
    addressee_id: int
    status: Literal["pending", "accepted", "rejected", "blocked"]
    created_at: datetime
    updated_at: datetime | None = None
    
    requester: UserPublicResponse | None = None
    addressee: UserPublicResponse | None = None


class FriendStatusResponse(ORMBaseModel):
    """Simplified response to indicate friendship status with a user."""
    user: UserPublicResponse
    status: Literal["none", "pending_sent", "pending_received", "accepted", "blocked"] = "none"
