"""
API router for the Weather domain.
Provides weather forecasts via MET Norway and city search via OpenStreetMap Nominatim.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status

from backend.core.deps import get_current_app_user
from backend.domains.users.models import User
from backend.domains.weather import service
from backend.domains.weather.schemas import (
    LocationSearchResult,
    WeatherForecastResponse,
)

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get(
    "/forecast",
    response_model=WeatherForecastResponse,
    summary="Recupera le previsioni meteo per coordinate (MET Norway con cache in RAM, pubblico)",
)
async def get_forecast(
    lat: float = Query(..., description="Latitudine (-90 a 90)"),
    lon: float = Query(..., description="Longitudine (-180 a 180)"),
    city_name: Optional[str] = Query(None, description="Nome opzionale della città/località"),
) -> WeatherForecastResponse:
    return await service.get_weather_forecast(lat=lat, lon=lon, city_name=city_name)


@router.get(
    "/search",
    response_model=List[LocationSearchResult],
    summary="Cerca città o località tramite geocoding OpenStreetMap",
)
async def search_locations(
    q: str = Query(..., min_length=2, description="Nome della città o comune da cercare"),
    current_user: User = Depends(get_current_app_user),
) -> List[LocationSearchResult]:
    return await service.search_locations(query=q)
