"""Feedback and Bug Reporting domain package."""
from backend.domains.feedback.models import FeedbackReport
from backend.domains.feedback.router import router

__all__ = ["FeedbackReport", "router"]
