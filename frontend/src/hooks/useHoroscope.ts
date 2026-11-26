// frontend/src/hooks/useHoroscope.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { horoscopeApi } from '@/api/horoscopeApi';
import type {
  DailyHoroscopeCollectionResponse,
  HoroscopeSignEntry,
  ZodiacSignSlug,
} from '@/types/horoscope';
import { getZodiacSignMeta } from '@/types/horoscope';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { useHoroscopePreference } from './useHoroscopePreference';

export const useHoroscope = (overrideSign?: ZodiacSignSlug) => {
  const { preference, toggleEnabled, setSign } = useHoroscopePreference();
  const todayStr = useMemo(() => getLocalTodayStr(), []);
  const activeSign: ZodiacSignSlug = overrideSign ?? preference.sign;
  const activeSignMeta = useMemo(() => getZodiacSignMeta(activeSign), [activeSign]);

  // Mazzo di Carte in RAM: carica tutti i 12 segni del giorno in un colpo solo
  const query = useQuery<DailyHoroscopeCollectionResponse>({
    queryKey: ['horoscope', 'daily', todayStr],
    queryFn: () => horoscopeApi.getDailyCollection(),
    enabled: preference.enabled,
    staleTime: 2 * 60 * 60 * 1000, // 2 ore in RAM
    gcTime: 6 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const currentEntry = useMemo<HoroscopeSignEntry | undefined>(() => {
    return query.data?.signs?.[activeSign];
  }, [query.data?.signs, activeSign]);

  return {
    ...query,
    collection: query.data,
    signsMap: query.data?.signs ?? {},
    currentEntry,
    activeSign,
    activeSignMeta,
    isHoroscopeEnabled: preference.enabled,
    toggleHoroscopeEnabled: toggleEnabled,
    setHoroscopeSign: setSign,
  };
};
