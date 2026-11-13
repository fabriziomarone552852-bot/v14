// frontend/src/api/weatherApi.ts
import { apiClient } from './client';
import type { WeatherForecastResponse, LocationSearchResult } from '@/types/weather';

export const weatherApi = {
  getForecast: async (
    lat: number,
    lon: number,
    cityName?: string
  ): Promise<WeatherForecastResponse> => {
    const params: Record<string, string | number> = {
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
    };
    if (cityName) {
      params.city_name = cityName;
    }
    const response = await apiClient.get<WeatherForecastResponse>('/weather/forecast', {
      params,
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
};
