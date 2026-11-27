"""API router for the Daily Horoscope domain."""
from fastapi import APIRouter, Depends, Path

from backend.core.deps import get_current_app_user
from backend.domains.users.models import User
from backend.domains.horoscope import service
from backend.domains.horoscope.schemas import (
    DailyHoroscopeCollectionResponse,
    HoroscopeSignEntry,
)

router = APIRouter(prefix="/horoscope", tags=["horoscope"])


@router.get(
    "/daily",
    response_model=DailyHoroscopeCollectionResponse,
    summary="Recupera l'oroscopo del giorno in italiano per tutti i 12 segni (cache RAM giornaliera)",
)
async def get_all_daily_horoscopes(
    current_user: User = Depends(get_current_app_user),
) -> DailyHoroscopeCollectionResponse:
    return await service.get_daily_horoscopes()


@router.get(
    "/daily/{sign}",
    response_model=HoroscopeSignEntry,
    summary="Recupera l'oroscopo del giorno per un singolo segno zodiacale",
)
async def get_single_sign_horoscope(
    sign: str = Path(..., description="Slug italiano del segno (es. ariete, leone, pesci)"),
    current_user: User = Depends(get_current_app_user),
) -> HoroscopeSignEntry:
    return await service.get_sign_horoscope(sign)
