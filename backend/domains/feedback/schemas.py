"""
Feedback domain schemas.
Pydantic models for feedback report requests and responses.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import Field, field_validator

from backend.core.schemas import ORMBaseModel, StrictBaseModel

FeedbackType = Literal["bug", "visual", "feature_request", "other"]
FeedbackSeverity = Literal["low", "medium", "high", "critical"]
FeedbackStatus = Literal["new", "in_progress", "resolved", "dismissed"]


class FeedbackReportCreate(StrictBaseModel):
    """Request schema for submitting a feedback or bug report."""

    report_type: FeedbackType = "bug"
    severity: FeedbackSeverity = "medium"
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5)
    steps_to_reproduce: Optional[str] = None
    app_version: str = Field(..., min_length=1, max_length=30)
    platform: str = Field(..., min_length=1, max_length=50)
    current_route: str = Field(..., min_length=1, max_length=255)
    error_context: Optional[str] = None
    screenshot_url: Optional[str] = Field(None, max_length=500)

    @field_validator("title", "description", "app_version", "platform", "current_route")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Il campo non può essere vuoto.")
        return value


class FeedbackReportUpdate(StrictBaseModel):
    """Request schema for updating status or administrator notes (SuperUser)."""

    status: Optional[FeedbackStatus] = None
    admin_notes: Optional[str] = None


class FeedbackReportResponse(ORMBaseModel):
    """Response schema for feedback reports."""

    id: int
    user_id: int
    report_type: str
    severity: str
    title: str
    description: str
    steps_to_reproduce: Optional[str] = None
    app_version: str
    platform: str
    current_route: str
    error_context: Optional[str] = None
    screenshot_url: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    # Campi calcolati / arricchiti
    user_username: Optional[str] = None
    user_email: Optional[str] = None
