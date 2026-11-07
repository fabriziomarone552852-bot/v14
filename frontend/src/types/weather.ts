// frontend/src/types/weather.ts

export interface HourlyForecast {
  time: string;
  temperature: number;
  symbol_code: string;
  precipitation_amount: number;
  humidity?: number | null;
  wind_speed?: number | null;
}

export interface DailyForecast {
  date: string;
  symbol_code: string;
  temp_min: number;
  temp_max: number;
  precipitation_total: number;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  symbol_code: string;
  precipitation_amount: number;
  humidity: number;
  wind_speed: number;
  wind_direction?: number | null;
  cloud_area_fraction?: number | null;
}

export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  city_name?: string | null;
  updated_at: string;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

export interface LocationSearchResult {
  display_name: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  state?: string | null;
}

export interface WeatherLocationPreference {
  enabled: boolean;
  cityName: string;
  latitude: number;
  longitude: number;
  isAutoGeolocation: boolean;
}
