// frontend/src/hooks/useWeather.ts
import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '@/api/weatherApi';
import type {
  DailyForecast,
  HourlyForecast,
  WeatherForecastResponse,
  WeatherHistoryResponse,
} from '@/types/weather';
import { formatDateString, getLocalTodayStr, pad } from '@/utils/dateUtils';
import { useWeatherLocation } from './useWeatherLocation';

interface HistoricalMonthBounds {
  monthKey: string;
  startDate: string;
  endDate: string;
}

const computeHistoricalMonthBounds = (
  targetDateStr: string | undefined,
  todayStr: string
): HistoricalMonthBounds | null => {
  if (!targetDateStr || targetDateStr >= todayStr) return null;
  const parts = targetDateStr.split('-').map(Number);
  const todayParts = todayStr.split('-').map(Number);
  if (parts.length !== 3 || todayParts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [y, m] = parts;
  const [ty, tm, td] = todayParts;
  const monthKey = `${y}-${pad(m)}`;
  const startDate = `${monthKey}-01`;

  const lastDayNum = new Date(y, m, 0).getDate();
  const monthLastStr = `${monthKey}-${pad(lastDayNum)}`;

  const yesterdayDate = new Date(ty, tm - 1, td - 1);
  const yesterdayStr = formatDateString(yesterdayDate);

  const endDate = monthLastStr < yesterdayStr ? monthLastStr : yesterdayStr;
  if (startDate > endDate) return null;

  return { monthKey, startDate, endDate };
};

export const useWeather = (
  overrideLat?: number,
  overrideLon?: number,
  overrideCity?: string,
  targetDateStr?: string
) => {
  const { preference } = useWeatherLocation();

  const lat = overrideLat ?? preference.latitude;
  const lon = overrideLon ?? preference.longitude;
  const cityName = overrideCity ?? preference.cityName;
  const isEnabled = preference.enabled && typeof lat === 'number' && typeof lon === 'number';
  const latKey = Math.round(lat * 1000) / 1000;
  const lonKey = Math.round(lon * 1000) / 1000;

  // 1. Dati "Caldi": Oggi + ultimi 7 giorni + prossimi 16 giorni
  const query = useQuery<WeatherForecastResponse>({
    queryKey: ['weather', 'open-meteo', 'v3', latKey, lonKey, cityName],
    queryFn: () => weatherApi.getForecast(lat, lon, cityName, 16),
    enabled: isEnabled,
    staleTime: 30 * 60 * 1000, // 30 minuti in RAM (mazzo di carte)
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const dailyData = query.data?.daily;
  const hourlyData = query.data?.hourly;
  const todayStr = query.data?.current?.time?.substring(0, 10) || getLocalTodayStr();

  const isInHotForecast = useMemo(
    () => Boolean(targetDateStr && dailyData?.some((d) => d.date === targetDateStr)),
    [targetDateStr, dailyData]
  );

  const historyBounds = useMemo(
    () => (isInHotForecast ? null : computeHistoricalMonthBounds(targetDateStr, todayStr)),
    [isInHotForecast, targetDateStr, todayStr]
  );

  // 2. Dati "Freddi" (Lazy Loading a blocchi mensili per mesi/settimane/giorni passati)
  const historyQuery = useQuery<WeatherHistoryResponse>({
    queryKey: [
      'weather',
      'history-month',
      latKey,
      lonKey,
      historyBounds?.monthKey ?? '',
      historyBounds?.endDate ?? '',
    ],
    queryFn: () =>
      weatherApi.getHistory(lat, lon, historyBounds!.startDate, historyBounds!.endDate),
    enabled: isEnabled && !query.isLoading && Boolean(historyBounds),
    staleTime: 12 * 60 * 60 * 1000, // 12 ore in RAM: il meteo passato non cambia
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const historyDaily = historyQuery.data?.daily;
  const historyHourly = historyQuery.data?.hourly;

  const todayForecast = useMemo(
    () => dailyData?.find((d) => d.date === todayStr),
    [dailyData, todayStr]
  );

  const upcomingDaily = useMemo(
    () => (dailyData ?? []).filter((d) => d.date >= todayStr),
    [dailyData, todayStr]
  );

  const getDailyForecastForDate = useCallback(
    (dateStr: string): DailyForecast | undefined => {
      return (
        dailyData?.find((d) => d.date === dateStr) ??
        historyDaily?.find((d) => d.date === dateStr)
      );
    },
    [dailyData, historyDaily]
  );

  const getHourlyForecastForDate = useCallback(
    (dateStr: string): HourlyForecast[] => {
      const fromHot = hourlyData?.filter((h) => h.time.startsWith(dateStr)) ?? [];
      if (fromHot.length > 0) return fromHot;
      return historyHourly?.filter((h) => h.time.startsWith(dateStr)) ?? [];
    },
    [hourlyData, historyHourly]
  );

  return {
    ...query,
    isLoading: query.isLoading || (Boolean(historyBounds) && historyQuery.isLoading),
    forecast: query.data,
    current: query.data?.current,
    todayForecast,
    daily: dailyData ?? [],
    upcomingDaily,
    hourly: hourlyData ?? [],
    timezone: query.data?.timezone ?? null,
    cityName: query.data?.city_name || cityName,
    getDailyForecastForDate,
    getHourlyForecastForDate,
    isWeatherEnabled: preference.enabled,
  };
};
