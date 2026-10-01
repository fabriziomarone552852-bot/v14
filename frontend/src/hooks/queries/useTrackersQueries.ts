// src/hooks/queries/useTrackersQueries.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { TVSeries, TMDBPaginatedSearch, FriendSeriesLog, FriendEpisodeLog, SeriesCastMember, SeriesRecommendation } from '@/types/trackers';

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


export const useFriendsSeriesReviews = (tmdbId: number, enabled: boolean = true) => {
  return useQuery<FriendSeriesLog[]>({
    queryKey: ['trackers', 'series', tmdbId, 'friends-reviews'],
    queryFn: async () => {
      const data = await api.get<FriendSeriesLog[]>(`/trackers/series/${tmdbId}/friends-reviews`);
      return data as FriendSeriesLog[];
    },
    enabled: enabled && !!tmdbId,
  });
};

export const useFriendsEpisodeReviews = (episodeId: number, enabled: boolean = true) => {
  return useQuery<FriendEpisodeLog[]>({
    queryKey: ['trackers', 'episodes', episodeId, 'friends-reviews'],
    queryFn: async () => {
      const data = await api.get<FriendEpisodeLog[]>(`/trackers/episodes/${episodeId}/friends-reviews`);
      return data as FriendEpisodeLog[];
    },
    enabled: enabled && !!episodeId,
  });
};



export const useSeriesExtras = (tmdbId: number, enabled: boolean = true) => {
  return useQuery<{ cast: SeriesCastMember[], recommendations: SeriesRecommendation[] }>({
    queryKey: ['trackers', 'series', tmdbId, 'extras'],
    queryFn: async () => {
      const data = await api.get<{ cast: SeriesCastMember[], recommendations: SeriesRecommendation[] }>(`/trackers/series/${tmdbId}/extras`);
      return data as { cast: SeriesCastMember[], recommendations: SeriesRecommendation[] };
    },
    enabled: enabled && !!tmdbId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useMediaLists = () => {
  return useQuery<any[]>({
    queryKey: ['trackers', 'lists'],
    queryFn: async () => {
      const data = await api.get<any[]>('/trackers/lists');
      return data || [];
    },
  });
};
export const useSeriesStats = () => {
  return useQuery<any>({
    queryKey: ['trackers', 'series', 'stats'],
    queryFn: async () => {
      const data = await api.get<any>('/trackers/series/stats');
      return data;
    },
  });
};

export const useMyQuotes = () => {
  return useQuery<any[]>({
    queryKey: ['trackers', 'quotes'],
    queryFn: async () => {
      const data = await api.get<any[]>('/trackers/quotes');
      return data || [];
    },
  });
};
