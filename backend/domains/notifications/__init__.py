"""
Interactions domain - Unified messages, comments, and notifications.
"""
from backend.domains.notifications.models import Interaction
from backend.domains.notifications.schemas import InteractionCreate, InteractionResponse
from backend.domains.notifications.router import router

__all__ = [
    "Interaction",
    "InteractionCreate",
    "InteractionResponse",
    "router",
]
