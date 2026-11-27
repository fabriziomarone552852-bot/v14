"""
Historical weather service ("Freddo" / Lazy-Loaded on demand).
Queries Open-Meteo Historical Forecast API (2021-04+) with fallback to Reanalysis Archive API (1940+).
"""
from __future__ import annotations

from datetime import date, timedelta
import time
from typing import Any, Dict, Tuple
import httpx
from fastapi import HTTPException, status

from backend.domains.weather.geocoding import HEADERS
from backend.domains.weather.parser import (
    DAILY_FIELDS_ARCHIVE,
    DAILY_FIELDS_FORECAST,
    HOURLY_FIELDS_ARCHIVE,
    HOURLY_FIELDS_FORECAST,
    get_coord_key,
    parse_daily,
    parse_hourly_and_current_extras,
)
from backend.domains.weather.schemas import WeatherHistoryResponse

OPEN_METEO_HIST_FORECAST_URL = "https://historical-forecast-api.open-meteo.com/v1/forecast"
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
HIST_FORECAST_MIN_DATE = date(2021, 4, 1)
MAX_RANGE_DAYS = 95

_HISTORY_CACHE: Dict[str, Tuple[float, WeatherHistoryResponse]] = {}
HISTORY_CACHE_TTL_SECONDS = 43200  # 12 ore (i dati storici consolidati non variano)


def _parse_iso_date(raw: str, label: str) -> date:
    try:
        return date.fromisoformat(raw[:10])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato {label} non valido (atteso YYYY-MM-DD): {raw}",
        )


async def get_weather_history(
    lat: float,
    lon: float,
    start_date: str,
    end_date: str,
) -> WeatherHistoryResponse:
    """Recupera meteo giornaliero e orario storico per un intervallo di date passate."""
    start_dt = _parse_iso_date(start_date, "start_date")
    end_dt = _parse_iso_date(end_date, "end_date")

    yesterday_dt = date.today() - timedelta(days=1)
    if end_dt > yesterday_dt:
        end_dt = yesterday_dt

    if start_dt > end_dt:
        return WeatherHistoryResponse(
            latitude=lat,
            longitude=lon,
            start_date=start_dt.isoformat(),
            end_date=end_dt.isoformat(),
            daily=[],
            hourly=[],
        )

    if (end_dt - start_dt).days > MAX_RANGE_DAYS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Intervallo storico troppo ampio (max {MAX_RANGE_DAYS} giorni per richiesta).",
        )

    start_iso = start_dt.isoformat()
    end_iso = end_dt.isoformat()
    cache_key = f"{get_coord_key(lat, lon)}:{start_iso}:{end_iso}"
    now = time.time()

    if cache_key in _HISTORY_CACHE:
        cached_time, cached_data = _HISTORY_CACHE[cache_key]
        if now - cached_time < HISTORY_CACHE_TTL_SECONDS:
            return cached_data

    use_hist_forecast = start_dt >= HIST_FORECAST_MIN_DATE
    target_url = OPEN_METEO_HIST_FORECAST_URL if use_hist_forecast else OPEN_METEO_ARCHIVE_URL
    hourly_fields = HOURLY_FIELDS_FORECAST if use_hist_forecast else HOURLY_FIELDS_ARCHIVE
    daily_fields = DAILY_FIELDS_FORECAST if use_hist_forecast else DAILY_FIELDS_ARCHIVE

    params: Dict[str, str] = {
        "latitude": f"{lat:.4f}",
        "longitude": f"{lon:.4f}",
        "start_date": start_iso,
        "end_date": end_iso,
        "hourly": hourly_fields,
        "daily": daily_fields,
        "timezone": "auto",
        "wind_speed_unit": "kmh",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, headers=HEADERS) as client:
            resp = await client.get(target_url, params=params)
            if resp.status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Troppe richieste alle API meteo storiche Open-Meteo. Riprova più tardi.",
                )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Errore dal servizio storico Open-Meteo: {resp.status_code}",
                )
            data: Dict[str, Any] = resp.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Impossibile contattare l'archivio storico Open-Meteo: {exc}",
        )

    hourly_raw: Dict[str, Any] = data.get("hourly") or {}
    daily_raw: Dict[str, Any] = data.get("daily") or {}

    hourly_list, _, _ = parse_hourly_and_current_extras(hourly_raw=hourly_raw, current_time="")
    daily_list = parse_daily(daily_raw=daily_raw, hourly_raw=hourly_raw)

    result = WeatherHistoryResponse(
        provider="open-meteo",
        latitude=lat,
        longitude=lon,
        start_date=start_iso,
        end_date=end_iso,
        daily=daily_list,
        hourly=hourly_list,
    )

    _HISTORY_CACHE[cache_key] = (now, result)
    return result
