"""
Weather domain schemas.
Pydantic models for MET Norway weather forecast and geocoding responses.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class HourlyForecast(BaseModel):
    time: str = Field(..., description="Timestamp ISO della rilevazione/previsione")
    temperature: float = Field(..., description="Temperatura in gradi Celsius")
    symbol_code: str = Field(..., description="Codice simbolo meteo MET Norway (es. clearsky_day, rain)")
    precipitation_amount: float = Field(0.0, description="Precipitazioni previste in mm")
    humidity: Optional[float] = Field(None, description="Umidità relativa in percentuale")
    wind_speed: Optional[float] = Field(None, description="Velocità del vento in m/s")


class DailyForecast(BaseModel):
    date: str = Field(..., description="Data del giorno nel formato YYYY-MM-DD")
    symbol_code: str = Field(..., description="Simbolo meteo rappresentativo del giorno")
    temp_min: float = Field(..., description="Temperatura minima prevista in Celsius")
    temp_max: float = Field(..., description="Temperatura massima prevista in Celsius")
    precipitation_total: float = Field(0.0, description="Precipitazioni totali cumulate nel giorno in mm")


class CurrentWeather(BaseModel):
    time: str = Field(..., description="Timestamp ISO dell'ora corrente")
    temperature: float = Field(..., description="Temperatura attuale in Celsius")
    symbol_code: str = Field(..., description="Simbolo meteo attuale")
    precipitation_amount: float = Field(0.0, description="Precipitazioni dell'ultima/prossima ora in mm")
    humidity: float = Field(..., description="Umidità relativa percentuale")
    wind_speed: float = Field(..., description="Velocità del vento in m/s")
    wind_direction: Optional[float] = Field(None, description="Direzione del vento in gradi (0-360)")
    cloud_area_fraction: Optional[float] = Field(None, description="Copertura nuvolosa in percentuale")


class WeatherForecastResponse(BaseModel):
    latitude: float
    longitude: float
    city_name: Optional[str] = None
    updated_at: str
    current: CurrentWeather
    daily: List[DailyForecast]
    hourly: List[HourlyForecast]


class LocationSearchResult(BaseModel):
    display_name: str
    name: str
    latitude: float
    longitude: float
    country: Optional[str] = None
    state: Optional[str] = None
