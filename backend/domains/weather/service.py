"""
Weather domain service.
Integrates MET Norway Locationforecast 2.0 API with in-memory RAM caching (30 min)
and OpenStreetMap Nominatim geocoding.
"""
import time
from typing import Dict, List, Optional, Tuple, Any
from collections import defaultdict
import httpx
from fastapi import HTTPException, status

from backend.domains.weather.schemas import (
    CurrentWeather,
    DailyForecast,
    HourlyForecast,
    LocationSearchResult,
    WeatherForecastResponse,
)

MET_NORWAY_URL = "https://api.met.no/weatherapi/locationforecast/2.0/compact"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# MET Norway requires a unique and identifiable User-Agent according to ToS
USER_AGENT = "VitaAgenda/15.2 (https://github.com/fabrizio/vita; support@vitaapp.local)"

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json",
}

# In-memory RAM cache: {cache_key: (timestamp, data)}
_WEATHER_CACHE: Dict[str, Tuple[float, WeatherForecastResponse]] = {}
WEATHER_CACHE_TTL_SECONDS = 1800  # 30 minuti

_SEARCH_CACHE: Dict[str, Tuple[float, List[LocationSearchResult]]] = {}
SEARCH_CACHE_TTL_SECONDS = 86400  # 24 ore


def _get_cache_key(lat: float, lon: float) -> str:
    """Rounds coordinates to 3 decimals to maximize cache reuse across nearby queries."""
    return f"{round(lat, 3)},{round(lon, 3)}"


async def get_weather_forecast(
    lat: float,
    lon: float,
    city_name: Optional[str] = None,
) -> WeatherForecastResponse:
    """
    Fetches weather forecast for given latitude and longitude from MET Norway.
    Results are cached in memory for 30 minutes to respect API quotas and provide 0ms latency.
    """
    cache_key = _get_cache_key(lat, lon)
    now = time.time()

    if cache_key in _WEATHER_CACHE:
        cached_time, cached_data = _WEATHER_CACHE[cache_key]
        if now - cached_time < WEATHER_CACHE_TTL_SECONDS:
            if city_name and cached_data.city_name != city_name:
                # Return copy with updated city name if requested
                return cached_data.model_copy(update={"city_name": city_name})
            return cached_data

    params = {
        "lat": f"{lat:.4f}",
        "lon": f"{lon:.4f}",
    }

    try:
        async with httpx.AsyncClient(timeout=12.0, headers=HEADERS) as client:
            resp = await client.get(MET_NORWAY_URL, params=params)

            if resp.status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Troppe richieste alle API meteo. Riprova più tardi.",
                )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Errore dal servizio meteo MET Norway: {resp.status_code}",
                )

            data = resp.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Impossibile contattare il servizio meteo: {exc}",
        )

    properties = data.get("properties", {})
    timeseries: List[Dict[str, Any]] = properties.get("timeseries", [])
    updated_at: str = properties.get("meta", {}).get("updated_at", "")

    if not timeseries:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Nessun dato di previsione meteorologica disponibile per le coordinate specificate.",
        )

    # 1. Meteo corrente (primo elemento della serie temporale)
    first_point = timeseries[0]
    first_point_time = first_point.get("time", "")
    instant_details = first_point.get("data", {}).get("instant", {}).get("details", {})
    next_1h = first_point.get("data", {}).get("next_1_hours", {})
    next_6h = first_point.get("data", {}).get("next_6_hours", {})

    current_symbol = (
        next_1h.get("summary", {}).get("symbol_code")
        or next_6h.get("summary", {}).get("symbol_code")
        or "cloudy"
    )
    current_precip = (
        next_1h.get("details", {}).get("precipitation_amount")
        or next_6h.get("details", {}).get("precipitation_amount")
        or 0.0
    )

    current_weather = CurrentWeather(
        time=first_point_time,
        temperature=float(instant_details.get("air_temperature", 0.0)),
        symbol_code=current_symbol,
        precipitation_amount=float(current_precip),
        humidity=float(instant_details.get("relative_humidity", 0.0)),
        wind_speed=float(instant_details.get("wind_speed", 0.0)),
        wind_direction=instant_details.get("wind_from_direction"),
        cloud_area_fraction=instant_details.get("cloud_area_fraction"),
    )

    # 2. Previsioni orarie per le prossime 24 ore
    hourly_list: List[HourlyForecast] = []
    for entry in timeseries[:24]:
        e_time = entry.get("time", "")
        e_data = entry.get("data", {})
        e_instant = e_data.get("instant", {}).get("details", {})
        e_n1 = e_data.get("next_1_hours", {})
        e_n6 = e_data.get("next_6_hours", {})

        e_symbol = (
            e_n1.get("summary", {}).get("symbol_code")
            or e_n6.get("summary", {}).get("symbol_code")
            or current_symbol
        )
        e_precip = (
            e_n1.get("details", {}).get("precipitation_amount")
            or e_n6.get("details", {}).get("precipitation_amount")
            or 0.0
        )

        hourly_list.append(
            HourlyForecast(
                time=e_time,
                temperature=float(e_instant.get("air_temperature", 0.0)),
                symbol_code=e_symbol,
                precipitation_amount=float(e_precip),
                humidity=e_instant.get("relative_humidity"),
                wind_speed=e_instant.get("wind_speed"),
            )
        )

    # 3. Aggregazione previsioni giornaliere (fino a 9-10 giorni)
    days_data: Dict[str, Dict[str, Any]] = defaultdict(
        lambda: {
            "temps": [],
            "precip_sum": 0.0,
            "symbols_noon": [],
            "all_symbols": [],
        }
    )

    for entry in timeseries:
        e_time = entry.get("time", "")
        date_str = e_time[:10]
        hour_str = e_time[11:13] if len(e_time) >= 13 else ""

        e_data = entry.get("data", {})
        e_instant = e_data.get("instant", {}).get("details", {})
        e_temp = e_instant.get("air_temperature")
        if e_temp is not None:
            days_data[date_str]["temps"].append(float(e_temp))

        e_n1 = e_data.get("next_1_hours", {})
        e_n6 = e_data.get("next_6_hours", {})

        # Accumula precipitazioni
        p_amount = e_n1.get("details", {}).get("precipitation_amount")
        if p_amount is not None:
            days_data[date_str]["precip_sum"] += float(p_amount)
        elif e_n6.get("details", {}).get("precipitation_amount") is not None:
            # Se siamo oltre le prime ore e abbiamo step da 6h
            days_data[date_str]["precip_sum"] += float(
                e_n6["details"]["precipitation_amount"]
            ) / 6.0

        # Simbolo
        sym = (
            e_n1.get("summary", {}).get("symbol_code")
            or e_n6.get("summary", {}).get("symbol_code")
        )
        if sym:
            days_data[date_str]["all_symbols"].append(sym)
            if hour_str in ("11", "12", "13", "14"):
                days_data[date_str]["symbols_noon"].append(sym)

    daily_list: List[DailyForecast] = []
    for date_str, d_info in sorted(days_data.items()):
        temps = d_info["temps"]
        if not temps:
            continue
        temp_min = min(temps)
        temp_max = max(temps)

        # Simbolo rappresentativo: preferisci ora centrale (mezzogiorno), altrimenti il più frequente
        if d_info["symbols_noon"]:
            rep_symbol = d_info["symbols_noon"][0]
        elif d_info["all_symbols"]:
            # Moda / primo simbolo
            rep_symbol = max(set(d_info["all_symbols"]), key=d_info["all_symbols"].count)
        else:
            rep_symbol = "cloudy"

        daily_list.append(
            DailyForecast(
                date=date_str,
                symbol_code=rep_symbol,
                temp_min=round(temp_min, 1),
                temp_max=round(temp_max, 1),
                precipitation_total=round(d_info["precip_sum"], 1),
            )
        )

    forecast_response = WeatherForecastResponse(
        latitude=lat,
        longitude=lon,
        city_name=city_name,
        updated_at=updated_at,
        current=current_weather,
        daily=daily_list,
        hourly=hourly_list,
    )

    # Salva in cache
    _WEATHER_CACHE[cache_key] = (now, forecast_response)
    return forecast_response


async def search_locations(query: str) -> List[LocationSearchResult]:
    """
    Searches for cities and locations using OpenStreetMap Nominatim geocoding.
    Results are cached in memory for 24h.
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
        "q": query.strip(),
        "format": "json",
        "addressdetails": "1",
        "limit": "5",
        "accept-language": "it",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
            resp = await client.get(NOMINATIM_URL, params=params)
            if resp.status_code != 200:
                return []
            raw_data = resp.json()
    except Exception:
        return []

    results: List[LocationSearchResult] = []
    for item in raw_data:
        try:
            addr = item.get("address", {})
            name = (
                addr.get("city")
                or addr.get("town")
                or addr.get("village")
                or addr.get("municipality")
                or item.get("name")
                or item.get("display_name", "").split(",")[0]
            )
            state = addr.get("state") or addr.get("county") or addr.get("region")
            country = addr.get("country")

            results.append(
                LocationSearchResult(
                    display_name=item.get("display_name", name),
                    name=name,
                    latitude=float(item.get("lat")),
                    longitude=float(item.get("lon")),
                    country=country,
                    state=state,
                )
            )
        except (ValueError, TypeError):
            continue

    _SEARCH_CACHE[clean_query] = (now, results)
    return results
