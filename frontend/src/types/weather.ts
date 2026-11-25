// frontend/src/types/weather.ts

export interface HourlyForecast {
  time: string;
  temperature: number;
  apparent_temperature?: number | null;
  weather_code: number;
  is_day: boolean;
  symbol_code: string;
  precipitation_amount: number;
  precipitation_probability?: number | null;
  humidity?: number | null;
  wind_speed?: number | null;
  uv_index?: number | null;
  pressure_msl?: number | null;
  cloud_area_fraction?: number | null;
}

export interface DailyForecast {
  date: string;
  weather_code: number;
  symbol_code: string;
  temp_min: number;
  temp_max: number;
  apparent_temp_min?: number | null;
  apparent_temp_max?: number | null;
  precipitation_total: number;
  precipitation_probability_max?: number | null;
  wind_speed_max?: number | null;
  wind_gusts_max?: number | null;
  wind_direction_dominant?: number | null;
  uv_index_max?: number | null;
  pressure_msl_mean?: number | null;
  cloud_area_fraction_mean?: number | null;
  humidity_mean?: number | null;
  sunrise?: string | null;
  sunset?: string | null;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparent_temperature?: number | null;
  weather_code: number;
  is_day: boolean;
  symbol_code: string;
  precipitation_amount: number;
  precipitation_probability?: number | null;
  humidity: number;
  wind_speed: number;
  wind_gusts?: number | null;
  wind_direction?: number | null;
  cloud_area_fraction?: number | null;
  pressure_msl?: number | null;
  uv_index?: number | null;
}

export interface WeatherForecastResponse {
  provider: string;
  latitude: number;
  longitude: number;
  city_name?: string | null;
  timezone?: string | null;
  timezone_abbreviation?: string | null;
  elevation?: number | null;
  updated_at: string;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

export interface WeatherHistoryResponse {
  provider: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

export interface LocationSearchResult {
  display_name: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  country_code?: string | null;
  state?: string | null;
  province?: string | null;
  population?: number | null;
}

export interface ReverseLocationResult {
  name: string;
  display_name: string;
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
