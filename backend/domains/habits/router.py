"""
Router principale del dominio Habits.

Include sia il router delle abitudini (/habits) sia il router dei log (/habit-log).
"""
from fastapi import APIRouter

from backend.domains.habits.habit_log_router import router as habit_log_router
from backend.domains.habits.habits_router import router as habits_router

router = APIRouter()
router.include_router(habits_router)
router.include_router(habit_log_router)

__all__ = ["router", "habits_router", "habit_log_router"]
