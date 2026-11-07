// frontend/src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '@/api/weatherApi';
import type { WeatherForecastResponse, DailyForecast } from '@/types/weather';
import { useWeatherLocation } from './useWeatherLocation';

export const useWeather = (overrideLat?: number, overrideLon?: number, overrideCity?: string) => {
  const { preference } = useWeatherLocation();

  const lat = overrideLat ?? preference.latitude;
  const lon = overrideLon ?? preference.longitude;
  const cityName = overrideCity ?? preference.cityName;
  const isEnabled = preference.enabled && typeof lat === 'number' && typeof lon === 'number';

  const query = useQuery<WeatherForecastResponse>({
    queryKey: ['weather', Math.round(lat * 1000) / 1000, Math.round(lon * 1000) / 1000, cityName],
    queryFn: () => weatherApi.getForecast(lat, lon, cityName),
    enabled: isEnabled,
    staleTime: 30 * 60 * 1000, // 30 minuti in RAM (mazzo di carte & ToS MET Norway)
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const getDailyForecastForDate = (dateStr: string): DailyForecast | undefined => {
    if (!query.data?.daily) return undefined;
    return query.data.daily.find((d) => d.date === dateStr);
  };

  return {
    ...query,
    forecast: query.data,
    current: query.data?.current,
    daily: query.data?.daily ?? [],
    hourly: query.data?.hourly ?? [],
    cityName: query.data?.city_name || cityName,
    getDailyForecastForDate,
    isWeatherEnabled: preference.enabled,
  };
};
