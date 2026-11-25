"""
WMO Weather Interpretation Codes (WW) mapping for Open-Meteo.
Maps numeric WMO codes (0-99) and day/night state into normalized semantic symbol codes
consumed by frontend icons and atmospheric backgrounds.
"""
from __future__ import annotations


def wmo_code_to_symbol(weather_code: int, is_day: bool = True) -> str:
    """Converte un codice WMO Open-Meteo (0-99) nel relativo symbol_code semantico."""
    suffix = "day" if is_day else "night"

    if weather_code == 0:
        return f"clearsky_{suffix}"
    if weather_code == 1:
        return f"fair_{suffix}"
    if weather_code == 2:
        return f"partlycloudy_{suffix}"
    if weather_code == 3:
        return "cloudy"
    if weather_code in (45, 48):
        return "fog"
    if weather_code in (51, 53, 61):
        return "lightrain"
    if weather_code in (55, 63):
        return "rain"
    if weather_code in (65, 82):
        return "heavyrain"
    if weather_code in (56, 57, 66, 67):
        return "sleet"
    if weather_code in (71, 77):
        return "lightsnow"
    if weather_code in (73, 85):
        return "snow"
    if weather_code in (75, 86):
        return "heavysnow"
    if weather_code in (80, 81):
        return f"rainshowers_{suffix}"
    if weather_code in (95, 96, 99):
        return "thunderstorm"

    return "cloudy"
