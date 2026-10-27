// src/hooks/queries/useCinemaQueries.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type {
  CinemaProvince,
  ProvinceCinemaData,
  MovieCinemaShowtimes,
  CinemaSchedule,
} from '@/types/cinema';

export const useCinemaProvinces = () => {
  return useQuery<CinemaProvince[]>({
    queryKey: ['trackers', 'movies', 'cinema', 'provinces'],
    queryFn: async () => {
      const data = await api.get<CinemaProvince[]>('/trackers/movies/cinema/provinces');
      return (data || []) as CinemaProvince[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 ore
  });
};

export const useProvinceCinemaData = (provinceSlug: string) => {
  return useQuery<ProvinceCinemaData>({
    queryKey: ['trackers', 'movies', 'cinema', 'province', provinceSlug],
    queryFn: async () => {
      const data = await api.get<ProvinceCinemaData>(
        `/trackers/movies/cinema/province/${encodeURIComponent(provinceSlug)}`
      );
      return data as ProvinceCinemaData;
    },
    enabled: Boolean(provinceSlug),
    staleTime: 1000 * 60 * 30, // 30 minuti
  });
};

export const useMovieShowtimes = (
  provinceSlug: string,
  idf: string,
  enabled: boolean = true
) => {
  return useQuery<MovieCinemaShowtimes[]>({
    queryKey: ['trackers', 'movies', 'cinema', 'showtimes', provinceSlug, idf],
    queryFn: async () => {
      const data = await api.get<MovieCinemaShowtimes[]>(
        `/trackers/movies/cinema/province/${encodeURIComponent(provinceSlug)}/movie/${encodeURIComponent(idf)}`
      );
      return (data || []) as MovieCinemaShowtimes[];
    },
    enabled: enabled && Boolean(provinceSlug) && Boolean(idf),
    staleTime: 1000 * 60 * 30,
  });
};

export const useCinemaSchedule = (
  provinceSlug: string,
  cinemaSlug: string,
  cinemaId: string,
  enabled: boolean = true
) => {
  return useQuery<CinemaSchedule>({
    queryKey: ['trackers', 'movies', 'cinema', 'schedule', provinceSlug, cinemaSlug, cinemaId],
    queryFn: async () => {
      const data = await api.get<CinemaSchedule>(
        `/trackers/movies/cinema/province/${encodeURIComponent(provinceSlug)}/theater/${encodeURIComponent(cinemaSlug)}/${encodeURIComponent(cinemaId)}`
      );
      return data as CinemaSchedule;
    },
    enabled: enabled && Boolean(provinceSlug) && Boolean(cinemaSlug) && Boolean(cinemaId),
    staleTime: 1000 * 60 * 30,
  });
};
