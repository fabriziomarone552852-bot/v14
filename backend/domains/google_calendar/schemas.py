"""
Google Calendar domain schemas.
Pydantic models for Google Calendar OAuth and sync operations.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from backend.core.schemas import ORMBaseModel, StrictBaseModel


class GoogleAuthUrlResponse(StrictBaseModel):
    """Response model containing the OAuth URL."""
    url: str


class GoogleCalendarStatusResponse(ORMBaseModel):
    """Status of Google Calendar connection for current user."""
    is_connected: bool
    google_email: Optional[str] = None
    sync_enabled: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class GoogleSyncToggleRequest(StrictBaseModel):
    """Payload to enable or disable automatic sync."""
    sync_enabled: bool


class GoogleSyncSummaryResponse(StrictBaseModel):
    """Summary of manual / bulk sync operation."""
    synced_count: int
    failed_count: int
    message: str


class GoogleBidirectionalSyncResponse(StrictBaseModel):
    """Summary of bidirectional synchronization (Google <-> App)."""
    success: bool
    imported_count: int
    updated_count: int
    deleted_count: int
    pushed_count: int
    message: str
