"""
Weather domain schemas.
Pydantic models for Open-Meteo weather forecasts and location geocoding responses.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class HourlyForecast(BaseModel):
    time: str = Field(..., description="Timestamp ISO locale della previsione (es. 2026-11-24T20:00)")
    temperature: float = Field(..., description="Temperatura in gradi Celsius")
    apparent_temperature: Optional[float] = Field(None, description="Temperatura percepita in gradi Celsius")
    weather_code: int = Field(3, description="Codice meteo WMO Open-Meteo (0-99)")
    is_day: bool = Field(True, description="True se giorno, False se notte")
    symbol_code: str = Field(..., description="Codice simbolo meteo normalizzato (es. clearsky_day, rain)")
    precipitation_amount: float = Field(0.0, description="Precipitazioni previste in mm")
    precipitation_probability: Optional[int] = Field(None, description="Probabilità di precipitazioni in %")
    humidity: Optional[float] = Field(None, description="Umidità relativa in percentuale")
    wind_speed: Optional[float] = Field(None, description="Velocità del vento in km/h")
    uv_index: Optional[float] = Field(None, description="Indice UV orario")
    pressure_msl: Optional[float] = Field(None, description="Pressione atmosferica oraria al livello del mare in hPa")
    cloud_area_fraction: Optional[float] = Field(None, description="Copertura nuvolosa oraria in percentuale")


class DailyForecast(BaseModel):
    date: str = Field(..., description="Data del giorno nel formato YYYY-MM-DD (ora locale)")
    weather_code: int = Field(3, description="Codice meteo WMO prevalente del giorno")
    symbol_code: str = Field(..., description="Simbolo meteo rappresentativo del giorno")
    temp_min: float = Field(..., description="Temperatura minima prevista in Celsius")
    temp_max: float = Field(..., description="Temperatura massima prevista in Celsius")
    apparent_temp_min: Optional[float] = Field(None, description="Temperatura percepita minima in Celsius")
    apparent_temp_max: Optional[float] = Field(None, description="Temperatura percepita massima in Celsius")
    precipitation_total: float = Field(0.0, description="Precipitazioni totali cumulate nel giorno in mm")
    precipitation_probability_max: Optional[int] = Field(None, description="Probabilità massima di pioggia nel giorno in %")
    wind_speed_max: Optional[float] = Field(None, description="Velocità massima del vento nel giorno in km/h")
    wind_gusts_max: Optional[float] = Field(None, description="Raffiche massime di vento nel giorno in km/h")
    wind_direction_dominant: Optional[float] = Field(None, description="Direzione prevalente del vento nel giorno in gradi (0-360)")
    uv_index_max: Optional[float] = Field(None, description="Indice UV massimo del giorno")
    pressure_msl_mean: Optional[float] = Field(None, description="Pressione atmosferica media giornaliera in hPa")
    cloud_area_fraction_mean: Optional[float] = Field(None, description="Copertura nuvolosa media giornaliera in percentuale")
    humidity_mean: Optional[float] = Field(None, description="Umidità relativa media giornaliera in percentuale")
    sunrise: Optional[str] = Field(None, description="Orario alba in formato ISO locale")
    sunset: Optional[str] = Field(None, description="Orario tramonto in formato ISO locale")


class CurrentWeather(BaseModel):
    time: str = Field(..., description="Timestamp ISO locale dell'ora corrente")
    temperature: float = Field(..., description="Temperatura attuale in Celsius")
    apparent_temperature: Optional[float] = Field(None, description="Temperatura percepita attuale in Celsius")
    weather_code: int = Field(3, description="Codice meteo WMO attuale (0-99)")
    is_day: bool = Field(True, description="True se giorno, False se notte")
    symbol_code: str = Field(..., description="Simbolo meteo attuale normalizzato")
    precipitation_amount: float = Field(0.0, description="Precipitazioni attuali in mm")
    precipitation_probability: Optional[int] = Field(None, description="Probabilità di pioggia nell'ora corrente in %")
    humidity: float = Field(..., description="Umidità relativa percentuale")
    wind_speed: float = Field(..., description="Velocità del vento in km/h")
    wind_gusts: Optional[float] = Field(None, description="Raffiche di vento in km/h")
    wind_direction: Optional[float] = Field(None, description="Direzione del vento in gradi (0-360)")
    cloud_area_fraction: Optional[float] = Field(None, description="Copertura nuvolosa in percentuale")
    pressure_msl: Optional[float] = Field(None, description="Pressione atmosferica al livello del mare in hPa")
    uv_index: Optional[float] = Field(None, description="Indice UV dell'ora corrente")


class WeatherForecastResponse(BaseModel):
    provider: str = Field("open-meteo", description="Provider meteo utilizzato")
    latitude: float
    longitude: float
    city_name: Optional[str] = None
    timezone: Optional[str] = None
    timezone_abbreviation: Optional[str] = None
    elevation: Optional[float] = None
    updated_at: str
    current: CurrentWeather
    daily: List[DailyForecast]
    hourly: List[HourlyForecast]


class WeatherHistoryResponse(BaseModel):
    provider: str = Field("open-meteo", description="Provider meteo storico utilizzato")
    latitude: float
    longitude: float
    start_date: str
    end_date: str
    daily: List[DailyForecast]
    hourly: List[HourlyForecast]


class LocationSearchResult(BaseModel):
    display_name: str
    name: str
    latitude: float
    longitude: float
    country: Optional[str] = None
    country_code: Optional[str] = None
    state: Optional[str] = None
    province: Optional[str] = None
    population: Optional[int] = None


class ReverseLocationResult(BaseModel):
    name: str
    display_name: str
    latitude: float
    longitude: float
    country: Optional[str] = None
    state: Optional[str] = None
