// src/hooks/queries/useTrackersQueries.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { TVSeries, TMDBPaginatedSearch } from '@/types/trackers';

export const useMySeries = () => {
  return useQuery<TVSeries[]>({
    queryKey: ['trackers', 'series'],
    queryFn: async () => {
      const data = await api.get<TVSeries[]>('/trackers/series');
      return data as TVSeries[];
    },
  });
};

export const useSearchTMDBSeries = (query: string, page: number = 1, enabled: boolean = false) => {
  return useQuery<TMDBPaginatedSearch>({
    queryKey: ['trackers', 'series', 'search', query, page],
    queryFn: async () => {
      const data = await api.get<TMDBPaginatedSearch>(`/trackers/series/search`, { params: { query, page } });
      return data as TMDBPaginatedSearch;
    },
    enabled: enabled && query.length > 0,
  });
};
