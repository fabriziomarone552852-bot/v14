"""
Shared parsing utilities and field constants for Open-Meteo Forecast & Historical APIs.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Sequence, Tuple

from backend.domains.weather.schemas import DailyForecast, HourlyForecast
from backend.domains.weather.wmo_codes import wmo_code_to_symbol

CURRENT_FIELDS = ",".join([
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "is_day",
    "precipitation",
    "weather_code",
    "cloud_cover",
    "pressure_msl",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
])

HOURLY_FIELDS_FORECAST = ",".join([
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "precipitation_probability",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
    "uv_index",
    "pressure_msl",
    "cloud_cover",
    "is_day",
])

HOURLY_FIELDS_ARCHIVE = ",".join([
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
    "pressure_msl",
    "cloud_cover",
    "is_day",
])

DAILY_FIELDS_FORECAST = ",".join([
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "wind_gusts_10m_max",
    "wind_direction_10m_dominant",
])

DAILY_FIELDS_ARCHIVE = ",".join([
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "sunrise",
    "sunset",
    "precipitation_sum",
    "wind_speed_10m_max",
    "wind_gusts_10m_max",
    "wind_direction_10m_dominant",
])


def get_coord_key(lat: float, lon: float) -> str:
    """Arrotonda le coordinate a 3 decimali (~110m) per massimizzare il riuso cache."""
    return f"{round(lat, 3)},{round(lon, 3)}"


def at_idx(values: Sequence[Any], idx: int) -> Any:
    """Accesso sicuro per indice a una sequenza Open-Meteo."""
    return values[idx] if idx < len(values) else None


def to_float(val: Any, default: Optional[float] = None, digits: Optional[int] = None) -> Optional[float]:
    if val is None:
        return default
    try:
        num = float(val)
        return round(num, digits) if digits is not None else num
    except (TypeError, ValueError):
        return default


def to_int(val: Any, default: Optional[int] = None) -> Optional[int]:
    if val is None:
        return default
    try:
        return int(round(float(val)))
    except (TypeError, ValueError):
        return default


def _mean_rounded(values: List[float], digits: int = 1) -> Optional[float]:
    if not values:
        return None
    avg = sum(values) / len(values)
    return round(avg, digits) if digits > 0 else float(round(avg))


def parse_hourly_and_current_extras(
    hourly_raw: Dict[str, Any],
    current_time: str = "",
) -> Tuple[List[HourlyForecast], Optional[int], Optional[float]]:
    """Estrae tutte le ore locali disponibili e prob. pioggia / UV dell'ora corrente."""
    times: List[str] = hourly_raw.get("time") or []
    temps = hourly_raw.get("temperature_2m") or []
    apparent_temps = hourly_raw.get("apparent_temperature") or []
    humidities = hourly_raw.get("relative_humidity_2m") or []
    precip_probs = hourly_raw.get("precipitation_probability") or []
    precips = hourly_raw.get("precipitation") or []
    wmo_codes = hourly_raw.get("weather_code") or []
    winds = hourly_raw.get("wind_speed_10m") or []
    uvs = hourly_raw.get("uv_index") or []
    pressures = hourly_raw.get("pressure_msl") or []
    clouds = hourly_raw.get("cloud_cover") or []
    is_days = hourly_raw.get("is_day") or []

    current_hour_prefix = current_time[:13] if len(current_time) >= 13 else ""
    start_idx = 0
    if current_hour_prefix:
        for idx, h_time in enumerate(times):
            if h_time[:13] >= current_hour_prefix:
                start_idx = idx
                break

    current_precip_prob = to_int(at_idx(precip_probs, start_idx)) if current_hour_prefix else None
    current_uv = to_float(at_idx(uvs, start_idx), digits=1) if current_hour_prefix else None

    hourly_list: List[HourlyForecast] = []
    for idx in range(len(times)):
        code = to_int(at_idx(wmo_codes, idx), default=3) or 3
        is_day_val = at_idx(is_days, idx)
        is_day_bool = bool(is_day_val) if is_day_val is not None else True

        hourly_list.append(
            HourlyForecast(
                time=times[idx],
                temperature=to_float(at_idx(temps, idx), default=0.0, digits=1) or 0.0,
                apparent_temperature=to_float(at_idx(apparent_temps, idx), digits=1),
                weather_code=code,
                is_day=is_day_bool,
                symbol_code=wmo_code_to_symbol(code, is_day_bool),
                precipitation_amount=to_float(at_idx(precips, idx), default=0.0, digits=1) or 0.0,
                precipitation_probability=to_int(at_idx(precip_probs, idx)),
                humidity=to_float(at_idx(humidities, idx), digits=0),
                wind_speed=to_float(at_idx(winds, idx), digits=1),
                uv_index=to_float(at_idx(uvs, idx), digits=1),
                pressure_msl=to_float(at_idx(pressures, idx), digits=1),
                cloud_area_fraction=to_float(at_idx(clouds, idx), digits=0),
            )
        )

    return hourly_list, current_precip_prob, current_uv


def parse_daily(daily_raw: Dict[str, Any], hourly_raw: Dict[str, Any]) -> List[DailyForecast]:
    """Costruisce la lista giornaliera arricchita con medie di pressione, nuvolosità e umidità."""
    dates: List[str] = daily_raw.get("time") or []
    wmo_codes = daily_raw.get("weather_code") or []
    temp_mins = daily_raw.get("temperature_2m_min") or []
    temp_maxs = daily_raw.get("temperature_2m_max") or []
    app_mins = daily_raw.get("apparent_temperature_min") or []
    app_maxs = daily_raw.get("apparent_temperature_max") or []
    precip_sums = daily_raw.get("precipitation_sum") or []
    precip_probs = daily_raw.get("precipitation_probability_max") or []
    wind_maxs = daily_raw.get("wind_speed_10m_max") or []
    wind_gusts_maxs = daily_raw.get("wind_gusts_10m_max") or []
    wind_dirs = daily_raw.get("wind_direction_10m_dominant") or []
    uv_maxs = daily_raw.get("uv_index_max") or []
    sunrises = daily_raw.get("sunrise") or []
    sunsets = daily_raw.get("sunset") or []

    h_times: List[str] = hourly_raw.get("time") or []
    h_pressures = hourly_raw.get("pressure_msl") or []
    h_clouds = hourly_raw.get("cloud_cover") or []
    h_humidities = hourly_raw.get("relative_humidity_2m") or []

    pressure_by_day: Dict[str, List[float]] = {}
    cloud_by_day: Dict[str, List[float]] = {}
    humidity_by_day: Dict[str, List[float]] = {}

    for h_idx, h_time in enumerate(h_times):
        day_key = h_time[:10]
        p_val = to_float(at_idx(h_pressures, h_idx))
        if p_val is not None:
            pressure_by_day.setdefault(day_key, []).append(p_val)
        c_val = to_float(at_idx(h_clouds, h_idx))
        if c_val is not None:
            cloud_by_day.setdefault(day_key, []).append(c_val)
        hum_val = to_float(at_idx(h_humidities, h_idx))
        if hum_val is not None:
            humidity_by_day.setdefault(day_key, []).append(hum_val)

    daily_list: List[DailyForecast] = []
    for idx, date_str in enumerate(dates):
        code = to_int(at_idx(wmo_codes, idx), default=3) or 3
        daily_list.append(
            DailyForecast(
                date=date_str,
                weather_code=code,
                symbol_code=wmo_code_to_symbol(code, is_day=True),
                temp_min=to_float(at_idx(temp_mins, idx), default=0.0, digits=1) or 0.0,
                temp_max=to_float(at_idx(temp_maxs, idx), default=0.0, digits=1) or 0.0,
                apparent_temp_min=to_float(at_idx(app_mins, idx), digits=1),
                apparent_temp_max=to_float(at_idx(app_maxs, idx), digits=1),
                precipitation_total=to_float(at_idx(precip_sums, idx), default=0.0, digits=1) or 0.0,
                precipitation_probability_max=to_int(at_idx(precip_probs, idx)),
                wind_speed_max=to_float(at_idx(wind_maxs, idx), digits=1),
                wind_gusts_max=to_float(at_idx(wind_gusts_maxs, idx), digits=1),
                wind_direction_dominant=to_float(at_idx(wind_dirs, idx), digits=0),
                uv_index_max=to_float(at_idx(uv_maxs, idx), digits=1),
                pressure_msl_mean=_mean_rounded(pressure_by_day.get(date_str, []), digits=1),
                cloud_area_fraction_mean=_mean_rounded(cloud_by_day.get(date_str, []), digits=0),
                humidity_mean=_mean_rounded(humidity_by_day.get(date_str, []), digits=0),
                sunrise=at_idx(sunrises, idx),
                sunset=at_idx(sunsets, idx),
            )
        )
    return daily_list
