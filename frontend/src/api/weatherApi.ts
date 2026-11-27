// frontend/src/api/weatherApi.ts
import { apiClient } from './client';
import type {
  LocationSearchResult,
  ReverseLocationResult,
  WeatherForecastResponse,
  WeatherHistoryResponse,
} from '@/types/weather';

export const weatherApi = {
  getForecast: async (
    lat: number,
    lon: number,
    cityName?: string,
    days = 16
  ): Promise<WeatherForecastResponse> => {
    const params: Record<string, string | number> = {
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
      days,
    };
    if (cityName) {
      params.city_name = cityName;
    }
    const response = await apiClient.get<WeatherForecastResponse>('/weather/forecast', {
      params,
    });
    return response.data;
  },

  getHistory: async (
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Promise<WeatherHistoryResponse> => {
    const response = await apiClient.get<WeatherHistoryResponse>('/weather/history', {
      params: {
        lat: Number(lat.toFixed(4)),
        lon: Number(lon.toFixed(4)),
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  searchLocations: async (query: string): Promise<LocationSearchResult[]> => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    const response = await apiClient.get<LocationSearchResult[]>('/weather/search', {
      params: { q: trimmed },
    });
    return response.data;
  },

  reverseGeocode: async (lat: number, lon: number): Promise<ReverseLocationResult> => {
    const response = await apiClient.get<ReverseLocationResult>('/weather/reverse', {
      params: {
        lat: Number(lat.toFixed(4)),
        lon: Number(lon.toFixed(4)),
      },
    });
    return response.data;
  },
};
