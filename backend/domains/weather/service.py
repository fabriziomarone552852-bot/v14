"""
Weather domain forecast service ("Caldo" / Active Forecast).
Integrates Open-Meteo Forecast API with in-memory RAM caching (30 min).
"""
from __future__ import annotations

from datetime import datetime, timezone
import time
from typing import Any, Dict, Optional, Tuple
import httpx
from fastapi import HTTPException, status

from backend.domains.weather.geocoding import HEADERS, reverse_geocode, search_locations
from backend.domains.weather.history import get_weather_history
from backend.domains.weather.parser import (
    CURRENT_FIELDS,
    DAILY_FIELDS_FORECAST,
    HOURLY_FIELDS_FORECAST,
    get_coord_key,
    parse_daily,
    parse_hourly_and_current_extras,
    to_float,
    to_int,
)
from backend.domains.weather.schemas import CurrentWeather, WeatherForecastResponse
from backend.domains.weather.wmo_codes import wmo_code_to_symbol

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# Cache in-memory RAM: {cache_key: (timestamp, data)}
_WEATHER_CACHE: Dict[str, Tuple[float, WeatherForecastResponse]] = {}
WEATHER_CACHE_TTL_SECONDS = 1800  # 30 minuti

__all__ = [
    "get_weather_forecast",
    "get_weather_history",
    "search_locations",
    "reverse_geocode",
]


async def get_weather_forecast(
    lat: float,
    lon: float,
    city_name: Optional[str] = None,
    forecast_days: int = 16,
    past_days: int = 7,
) -> WeatherForecastResponse:
    """
    Recupera le previsioni meteo (fino a 16 giorni futuri + ultimi past_days giorni) da Open-Meteo.
    I risultati vengono salvati in RAM per 30 minuti per latenza 0ms e rispetto delle quote.
    """
    safe_days = max(1, min(forecast_days, 16))
    safe_past = max(0, min(past_days, 14))
    cache_key = f"{get_coord_key(lat, lon)}:{safe_days}:p{safe_past}"
    now = time.time()

    if cache_key in _WEATHER_CACHE:
        cached_time, cached_data = _WEATHER_CACHE[cache_key]
        if now - cached_time < WEATHER_CACHE_TTL_SECONDS:
            if city_name and cached_data.city_name != city_name:
                return cached_data.model_copy(update={"city_name": city_name})
            return cached_data

    params: Dict[str, str] = {
        "latitude": f"{lat:.4f}",
        "longitude": f"{lon:.4f}",
        "current": CURRENT_FIELDS,
        "hourly": HOURLY_FIELDS_FORECAST,
        "daily": DAILY_FIELDS_FORECAST,
        "timezone": "auto",
        "wind_speed_unit": "kmh",
        "forecast_days": str(safe_days),
    }
    if safe_past > 0:
        params["past_days"] = str(safe_past)

    try:
        async with httpx.AsyncClient(timeout=12.0, headers=HEADERS) as client:
            resp = await client.get(OPEN_METEO_FORECAST_URL, params=params)

            if resp.status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Troppe richieste alle API meteo Open-Meteo. Riprova più tardi.",
                )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Errore dal servizio meteo Open-Meteo: {resp.status_code}",
                )

            data = resp.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Impossibile contattare il servizio meteo Open-Meteo: {exc}",
        )

    current_raw: Dict[str, Any] = data.get("current") or {}
    hourly_raw: Dict[str, Any] = data.get("hourly") or {}
    daily_raw: Dict[str, Any] = data.get("daily") or {}

    if not current_raw:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Nessun dato meteorologico disponibile da Open-Meteo per le coordinate specificate.",
        )

    current_time = str(current_raw.get("time") or "")
    current_code = to_int(current_raw.get("weather_code"), default=3) or 3
    current_is_day = bool(current_raw.get("is_day", 1))

    hourly_list, current_precip_prob, current_uv = parse_hourly_and_current_extras(
        hourly_raw=hourly_raw,
        current_time=current_time,
    )
    daily_list = parse_daily(daily_raw=daily_raw, hourly_raw=hourly_raw)

    current_weather = CurrentWeather(
        time=current_time,
        temperature=to_float(current_raw.get("temperature_2m"), default=0.0, digits=1) or 0.0,
        apparent_temperature=to_float(current_raw.get("apparent_temperature"), digits=1),
        weather_code=current_code,
        is_day=current_is_day,
        symbol_code=wmo_code_to_symbol(current_code, current_is_day),
        precipitation_amount=to_float(current_raw.get("precipitation"), default=0.0, digits=1) or 0.0,
        precipitation_probability=current_precip_prob,
        humidity=to_float(current_raw.get("relative_humidity_2m"), default=0.0, digits=0) or 0.0,
        wind_speed=to_float(current_raw.get("wind_speed_10m"), default=0.0, digits=1) or 0.0,
        wind_gusts=to_float(current_raw.get("wind_gusts_10m"), digits=1),
        wind_direction=to_float(current_raw.get("wind_direction_10m"), digits=0),
        cloud_area_fraction=to_float(current_raw.get("cloud_cover"), digits=0),
        pressure_msl=to_float(current_raw.get("pressure_msl"), digits=1),
        uv_index=current_uv,
    )

    forecast_response = WeatherForecastResponse(
        provider="open-meteo",
        latitude=lat,
        longitude=lon,
        city_name=city_name,
        timezone=data.get("timezone"),
        timezone_abbreviation=data.get("timezone_abbreviation"),
        elevation=to_float(data.get("elevation"), digits=0),
        updated_at=datetime.now(timezone.utc).isoformat(),
        current=current_weather,
        daily=daily_list,
        hourly=hourly_list,
    )

    _WEATHER_CACHE[cache_key] = (now, forecast_response)
    return forecast_response
