import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type {
  Movie,
  TMDBPaginatedMovieSearch,
  UpcomingMovie,
  MovieDashboardStats,
  MovieFullStats,
  MovieExtras,
  FriendMovieLog,
  MovieQuote,
} from '@/types/movies';

export const useMyMovies = () => {
  return useQuery<Movie[]>({
    queryKey: ['trackers', 'movies'],
    queryFn: async () => {
      const data = await api.get<Movie[]>('/trackers/movies');
      return (data || []) as Movie[];
    },
  });
};

export const useSearchTMDBMovies = (query: string, page: number = 1, enabled: boolean = false) => {
  return useQuery<TMDBPaginatedMovieSearch>({
    queryKey: ['trackers', 'movies', 'search', query, page],
    queryFn: async () => {
      const data = await api.get<TMDBPaginatedMovieSearch>('/trackers/movies/search', {
        params: { query, page },
      });
      return data as TMDBPaginatedMovieSearch;
    },
    enabled: enabled && query.trim().length > 0,
  });
};

export interface TMDBMovieQueryFilterParams {
  with_genres?: string;
  without_genres?: string;
  with_watch_providers?: string;
  primary_release_year?: string;
  sort_by?: string;
}

export const useInfiniteSearchTMDBMovies = (
  query: string,
  enabled: boolean = false,
  filterParams?: TMDBMovieQueryFilterParams
) => {
  return useInfiniteQuery<TMDBPaginatedMovieSearch>({
    queryKey: [
      'trackers',
      'movies',
      'search',
      'infinite',
      query,
      filterParams?.with_genres || '',
      filterParams?.without_genres || '',
      filterParams?.with_watch_providers || '',
      filterParams?.primary_release_year || '',
      filterParams?.sort_by || '',
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string | number> = {
        query,
        page: pageParam as number,
      };
      if (filterParams?.with_genres) params.with_genres = filterParams.with_genres;
      if (filterParams?.without_genres) params.without_genres = filterParams.without_genres;
      if (filterParams?.with_watch_providers) {
        params.with_watch_providers = filterParams.with_watch_providers;
      }
      if (filterParams?.primary_release_year) {
        params.primary_release_year = filterParams.primary_release_year;
      }
      if (filterParams?.sort_by) params.sort_by = filterParams.sort_by;

      const data = await api.get<TMDBPaginatedMovieSearch>('/trackers/movies/search', {
        params,
      });
      return data as TMDBPaginatedMovieSearch;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: enabled && query.trim().length > 0,
  });
};

export const useInfiniteDiscoverTMDBMovies = (
  filterParams: TMDBMovieQueryFilterParams,
  enabled: boolean = false
) => {
  return useInfiniteQuery<TMDBPaginatedMovieSearch>({
    queryKey: [
      'trackers',
      'movies',
      'discover',
      'infinite',
      filterParams.with_genres || '',
      filterParams.without_genres || '',
      filterParams.with_watch_providers || '',
      filterParams.primary_release_year || '',
      filterParams.sort_by || '',
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string | number> = { page: pageParam as number };
      if (filterParams.with_genres) params.with_genres = filterParams.with_genres;
      if (filterParams.without_genres) params.without_genres = filterParams.without_genres;
      if (filterParams.with_watch_providers) {
        params.with_watch_providers = filterParams.with_watch_providers;
      }
      if (filterParams.primary_release_year) {
        params.primary_release_year = filterParams.primary_release_year;
      }
      if (filterParams.sort_by) params.sort_by = filterParams.sort_by;

      const data = await api.get<TMDBPaginatedMovieSearch>('/trackers/movies/discover', { params });
      return data as TMDBPaginatedMovieSearch;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled,
  });
};


export const useTMDBMovieGenres = () => {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: ['trackers', 'movies', 'genres'],
    queryFn: async () => {
      const data = await api.get<{ id: number; name: string }[]>('/trackers/movies/genres');
      return data || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 ore
  });
};

export interface TMDBCatalogProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
  display_priority?: number;
  display_priorities?: Record<string, number>;
}

export const useTMDBMovieProviders = () => {
  return useQuery<TMDBCatalogProviderItem[]>({
    queryKey: ['trackers', 'movies', 'providers'],
    queryFn: async () => {
      const data = await api.get<TMDBCatalogProviderItem[]>('/trackers/movies/providers');
      return data || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 ore
  });
};

export interface MovieProvidersResponse {
  flatrate?: { provider_id: number; provider_name: string; logo_path?: string | null }[];
  buy?: { provider_id: number; provider_name: string; logo_path?: string | null }[];
  rent?: { provider_id: number; provider_name: string; logo_path?: string | null }[];
}

export const useMovieProviders = (tmdbId?: number, enabled: boolean = true) => {
  return useQuery<MovieProvidersResponse | null>({
    queryKey: ['trackers', 'movies', tmdbId, 'single-providers'],
    queryFn: async () => {
      if (!tmdbId) return null;
      try {
        const data = await api.get<MovieProvidersResponse>(`/trackers/movies/${tmdbId}/providers`);
        return data || null;
      } catch {
        return null;
      }
    },
    enabled: enabled && !!tmdbId,
    staleTime: 1000 * 60 * 60 * 24, // 24 ore
  });
};

export const useUpcomingMovies = (startDate?: string, endDate?: string) => {
  return useQuery<UpcomingMovie[]>({
    queryKey: ['trackers', 'movies', 'upcoming', startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const data = await api.get<UpcomingMovie[]>('/trackers/movies/upcoming', { params });
      return data || [];
    },
  });
};

export const useMovieDashboardStats = () => {
  return useQuery<MovieDashboardStats>({
    queryKey: ['trackers', 'movies', 'stats'],
    queryFn: async () => {
      const data = await api.get<MovieDashboardStats>('/trackers/movies/stats');
      return data as MovieDashboardStats;
    },
  });
};

export const useMovieFullStats = () => {
  return useQuery<MovieFullStats>({
    queryKey: ['trackers', 'movies', 'full-stats'],
    queryFn: async () => {
      const data = await api.get<MovieFullStats>('/trackers/movies/full-stats');
      return data as MovieFullStats;
    },
  });
};

export const useMovieExtras = (tmdbId?: number, enabled: boolean = true) => {
  return useQuery<MovieExtras>({
    queryKey: ['trackers', 'movies', tmdbId, 'extras'],
    queryFn: async () => {
      if (!tmdbId) {
        return { cast: [], recommendations: [], collection: null };
      }
      const data = await api.get<MovieExtras>(`/trackers/movies/${tmdbId}/extras`);
      return data as MovieExtras;
    },
    enabled: enabled && !!tmdbId,
    staleTime: 1000 * 60 * 60 * 12, // 12 ore
  });
};

export const useFriendsMovieReviews = (tmdbId?: number, enabled: boolean = true) => {
  return useQuery<FriendMovieLog[]>({
    queryKey: ['trackers', 'movies', tmdbId, 'friends-reviews'],
    queryFn: async () => {
      if (!tmdbId) return [];
      const data = await api.get<FriendMovieLog[]>(`/trackers/movies/${tmdbId}/friends-reviews`);
      return (data || []) as FriendMovieLog[];
    },
    enabled: enabled && !!tmdbId,
  });
};

export const useMovieQuotes = () => {
  return useQuery<MovieQuote[]>({
    queryKey: ['trackers', 'movies', 'quotes'],
    queryFn: async () => {
      const data = await api.get<MovieQuote[]>('/trackers/movies/quotes');
      return data || [];
    },
  });
};
