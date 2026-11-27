"""
Geocoding & reverse geocoding helpers for the Weather domain.
Uses Open-Meteo Geocoding API for city search and OpenStreetMap Nominatim for GPS reverse lookup.
"""
from __future__ import annotations

import time
from typing import Any, Dict, List, Optional, Tuple
import httpx

from backend.domains.weather.schemas import LocationSearchResult, ReverseLocationResult

OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"

USER_AGENT = "VitaAgenda/15.5 (https://github.com/fabrizio/vita; support@vitaapp.local)"
HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json",
}

_SEARCH_CACHE: Dict[str, Tuple[float, List[LocationSearchResult]]] = {}
SEARCH_CACHE_TTL_SECONDS = 86400  # 24 ore

_REVERSE_CACHE: Dict[str, Tuple[float, ReverseLocationResult]] = {}
REVERSE_CACHE_TTL_SECONDS = 86400  # 24 ore


def _to_int(val: Any) -> Optional[int]:
    if val is None:
        return None
    try:
        return int(round(float(val)))
    except (TypeError, ValueError):
        return None


async def search_locations(query: str) -> List[LocationSearchResult]:
    """
    Cerca città e località tramite Open-Meteo Geocoding API (in italiano, ordinate per rilevanza).
    I risultati vengono mantenuti in cache RAM per 24 ore.
    """
    clean_query = query.strip().lower()
    if not clean_query or len(clean_query) < 2:
        return []

    now = time.time()
    if clean_query in _SEARCH_CACHE:
        cached_time, cached_results = _SEARCH_CACHE[clean_query]
        if now - cached_time < SEARCH_CACHE_TTL_SECONDS:
            return cached_results

    params = {
        "name": query.strip(),
        "count": "8",
        "language": "it",
        "format": "json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
            resp = await client.get(OPEN_METEO_GEOCODING_URL, params=params)
            if resp.status_code != 200:
                return []
            raw_payload = resp.json()
    except Exception:
        return []

    raw_results = raw_payload.get("results") or []
    results: List[LocationSearchResult] = []
    for item in raw_results:
        try:
            name = str(item.get("name") or "").strip()
            if not name:
                continue
            province = item.get("admin2")
            state = item.get("admin1")
            country = item.get("country")

            parts: List[str] = [name]
            for extra in (province, state, country):
                if extra and str(extra) not in parts:
                    parts.append(str(extra))

            results.append(
                LocationSearchResult(
                    display_name=", ".join(parts),
                    name=name,
                    latitude=float(item["latitude"]),
                    longitude=float(item["longitude"]),
                    country=country,
                    country_code=item.get("country_code"),
                    state=state,
                    province=province,
                    population=_to_int(item.get("population")),
                )
            )
        except (KeyError, TypeError, ValueError):
            continue

    _SEARCH_CACHE[clean_query] = (now, results)
    return results


async def reverse_geocode(lat: float, lon: float) -> ReverseLocationResult:
    """
    Risolve coordinate GPS (lat, lon) nel nome del comune/città tramite OpenStreetMap Nominatim.
    Fallback sicuro a 'Posizione attuale' se il servizio non risponde.
    """
    cache_key = f"{round(lat, 3)},{round(lon, 3)}"
    now = time.time()

    if cache_key in _REVERSE_CACHE:
        cached_time, cached_result = _REVERSE_CACHE[cache_key]
        if now - cached_time < REVERSE_CACHE_TTL_SECONDS:
            return cached_result

    fallback = ReverseLocationResult(
        name="Posizione attuale",
        display_name="Posizione attuale",
        latitude=lat,
        longitude=lon,
    )

    params = {
        "lat": f"{lat:.4f}",
        "lon": f"{lon:.4f}",
        "format": "json",
        "addressdetails": "1",
        "zoom": "10",
        "accept-language": "it",
    }

    try:
        async with httpx.AsyncClient(timeout=8.0, headers=HEADERS) as client:
            resp = await client.get(NOMINATIM_REVERSE_URL, params=params)
            if resp.status_code != 200:
                return fallback
            data = resp.json()
    except Exception:
        return fallback

    addr = data.get("address") or {}
    name = (
        addr.get("city")
        or addr.get("town")
        or addr.get("village")
        or addr.get("municipality")
        or addr.get("hamlet")
        or data.get("name")
        or "Posizione attuale"
    )
    state = addr.get("state") or addr.get("region") or addr.get("county")
    country = addr.get("country")

    parts: List[str] = [str(name)]
    for extra in (state, country):
        if extra and str(extra) not in parts:
            parts.append(str(extra))

    result = ReverseLocationResult(
        name=str(name),
        display_name=", ".join(parts),
        latitude=lat,
        longitude=lon,
        country=country,
        state=state,
    )
    _REVERSE_CACHE[cache_key] = (now, result)
    return result
