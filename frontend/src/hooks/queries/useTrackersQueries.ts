import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { TVSeries, TMDBPaginatedSearch, FriendSeriesLog, FriendEpisodeLog, SeriesCastMember, SeriesRecommendation, MediaList, TVDashboardStats, TVFullStats, SeriesQuote, UpcomingEpisode } from '@/types/trackers';

export const useMySeries = () => {
  return useQuery<TVSeries[]>({
    queryKey: ['trackers', 'series'],
    queryFn: async () => {
      const data = await api.get<TVSeries[]>('/trackers/series');
      return data as TVSeries[];
    },
  });
};

export const useTVPlatforms = () => {
  return useQuery<{id: number, name: string}[]>({
    queryKey: ['trackers', 'platforms'],
    queryFn: async () => {
      const data = await api.get<{id: number, name: string}[]>('/trackers/platforms');
      return data as {id: number, name: string}[];
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


export const useFriendsSeriesReviews = (tmdbId?: number, enabled: boolean = true) => {
  return useQuery<FriendSeriesLog[]>({
    queryKey: ['trackers', 'series', tmdbId, 'friends-reviews'],
    queryFn: async () => {
      if (!tmdbId) return [];
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
  return useQuery<MediaList[]>({
    queryKey: ['trackers', 'lists'],
    queryFn: async () => {
      const data = await api.get<MediaList[]>('/trackers/lists');
      return data || [];
    },
  });
};
export const useSeriesStats = () => {
  return useQuery<TVDashboardStats>({
    queryKey: ['trackers', 'series', 'stats'],
    queryFn: async () => {
      const data = await api.get<TVDashboardStats>('/trackers/series/stats');
      return data as TVDashboardStats;
    },
  });
};

export const useFullSeriesStats = () => {
  return useQuery<TVFullStats>({
    queryKey: ['trackers', 'series', 'full-stats'],
    queryFn: async () => {
      const data = await api.get<TVFullStats>('/trackers/series/full-stats');
      return data as TVFullStats;
    },
  });
};

export const useMyQuotes = () => {
  return useQuery<SeriesQuote[]>({
    queryKey: ['trackers', 'quotes'],
    queryFn: async () => {
      const data = await api.get<SeriesQuote[]>('/trackers/quotes');
      return data || [];
    },
  });
};

export const useUpcomingEpisodes = (startDate?: string, endDate?: string) => {
  return useQuery<UpcomingEpisode[]>({
    queryKey: ['trackers', 'upcoming', startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const data = await api.get<UpcomingEpisode[]>('/trackers/series/upcoming', { params });
      return data || [];
    },
  });
};



export const useTMDBGenres = () => {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: ['tmdb', 'genres'],
    queryFn: async () => {
      const data = await api.get<{ genres: { id: number; name: string }[] }>('/trackers/tmdb/genres');
      return data?.genres || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useTMDBProviders = () => {
  return useQuery<{ provider_id: number; provider_name: string }[]>({
    queryKey: ['tmdb', 'providers'],
    queryFn: async () => {
      const data = await api.get<{ results: { provider_id: number; provider_name: string }[] }>('/trackers/tmdb/providers');
      return data?.results || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export interface TMDBDiscoverFilters {
  genre?: string;
  network?: string;
  year?: string;
  globalSearch?: boolean;
}

export interface TMDBDiscoverParams {
  with_genres?: string;
  with_networks?: string;
  first_air_date_year?: string;
}

export const useTMDBDiscover = (filters: TMDBDiscoverFilters) => {
  return useQuery({
    queryKey: ['tmdb', 'discover', filters.genre, filters.network, filters.year],
    queryFn: async () => {
      const params: TMDBDiscoverParams = {};
      if (filters.genre && filters.genre !== 'all') params.with_genres = filters.genre;
      if (filters.network && filters.network !== 'all') params.with_networks = filters.network;
      if (filters.year && filters.year !== 'all') params.first_air_date_year = filters.year;
      
      const data = await api.get<TMDBPaginatedSearch>('/trackers/tmdb/discover', { params });
      return data;
    },
    enabled: !!filters.globalSearch && (filters.genre !== 'all' || filters.network !== 'all' || filters.year !== 'all'),
  });
};
