"""
Notifications domain - User notification management.
"""
from backend.domains.notifications.models import Notification
from backend.domains.notifications.schemas import NotificationCreate, NotificationResponse
from backend.domains.notifications.router import router

__all__ = [
    "Notification",
    "NotificationCreate",
    "NotificationResponse",
    "router",
]
