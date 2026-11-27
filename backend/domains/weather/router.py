"""
API router for the Weather domain.
Provides weather forecasts, historical archive on demand, city search and GPS reverse geocoding.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query

from backend.core.deps import get_current_app_user
from backend.domains.users.models import User
from backend.domains.weather import service
from backend.domains.weather.schemas import (
    LocationSearchResult,
    ReverseLocationResult,
    WeatherForecastResponse,
    WeatherHistoryResponse,
)

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get(
    "/forecast",
    response_model=WeatherForecastResponse,
    summary="Recupera le previsioni meteo per coordinate (Open-Meteo con cache in RAM, pubblico)",
)
async def get_forecast(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitudine (-90 a 90)"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitudine (-180 a 180)"),
    city_name: Optional[str] = Query(None, description="Nome opzionale della città/località"),
    days: int = Query(16, ge=1, le=16, description="Numero di giorni di previsione (1-16)"),
    past_days: int = Query(7, ge=0, le=14, description="Numero di giorni passati da includere (0-14)"),
) -> WeatherForecastResponse:
    return await service.get_weather_forecast(
        lat=lat,
        lon=lon,
        city_name=city_name,
        forecast_days=days,
        past_days=past_days,
    )


@router.get(
    "/history",
    response_model=WeatherHistoryResponse,
    summary="Recupera i dati meteo storici on-demand per un intervallo di date passate",
)
async def get_history(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitudine (-90 a 90)"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitudine (-180 a 180)"),
    start_date: str = Query(..., min_length=10, max_length=10, description="Data inizio YYYY-MM-DD"),
    end_date: str = Query(..., min_length=10, max_length=10, description="Data fine YYYY-MM-DD"),
) -> WeatherHistoryResponse:
    return await service.get_weather_history(
        lat=lat,
        lon=lon,
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/search",
    response_model=List[LocationSearchResult],
    summary="Cerca città o località tramite Open-Meteo Geocoding API",
)
async def search_locations(
    q: str = Query(..., min_length=2, description="Nome della città o comune da cercare"),
    current_user: User = Depends(get_current_app_user),
) -> List[LocationSearchResult]:
    return await service.search_locations(query=q)


@router.get(
    "/reverse",
    response_model=ReverseLocationResult,
    summary="Ricava il nome del comune/città da coordinate GPS",
)
async def reverse_location(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitudine (-90 a 90)"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitudine (-180 a 180)"),
    current_user: User = Depends(get_current_app_user),
) -> ReverseLocationResult:
    return await service.reverse_geocode(lat=lat, lon=lon)
