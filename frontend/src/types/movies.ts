// src/types/movies.ts
import type { ReviewComment } from './trackers';

export interface TMDBMovie {
  tmdb_id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: string | null;
  runtime?: number | null;
  release_date?: string | null;
  italy_release_date?: string | null;
  vote_average?: number | null;
  collection_id?: number | null;
  collection_name?: string | null;
  collection_poster_path?: string | null;
  collection_backdrop_path?: string | null;
  last_sync_at?: string;
}

export interface UserMovieLog {
  id: number;
  user_id: number;
  movie_tmdb_id: number;
  rating?: number | null;
  notes?: string | null;
  review_visibility: string;
  viewing_platform_id?: number | null;
  viewing_platform_name?: string | null;
  watched_at?: string | null;
  created_at: string;
  updated_at: string;
  comments: ReviewComment[];
}

export interface MovieQuote {
  id: number;
  user_id: number;
  movie_tmdb_id: number;
  quote_text: string;
  created_at: string;
  movie_title?: string | null;
  movie_poster_path?: string | null;
}

export interface UserMovieTracking {
  id: number;
  movie_tmdb_id: number;
  status: 'to_watch' | 'watched' | string;
  is_rewatching: boolean;
  obtained_at?: string | null;
  is_obtained?: boolean;
  custom_poster_path?: string | null;
  custom_backdrop_path?: string | null;
  added_at?: string | null;
  updated_at?: string | null;
  watch_count: number;
  my_rating?: number | null;
  my_last_watched_at?: string | null;
  logs: UserMovieLog[];
  quotes: MovieQuote[];
}

export type Movie = TMDBMovie & UserMovieTracking;

export interface MovieCastMember {
  id: number;
  name: string;
  character?: string | null;
  profile_path?: string | null;
}

export interface MovieRecommendation {
  id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number | null;
  release_date?: string | null;
}

export interface MovieCollectionPart {
  id: number;
  title: string;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  vote_average?: number | null;
  status?: string | null;
  in_watchlist: boolean;
  is_watched: boolean;
  my_rating?: number | null;
}

export interface MovieCollectionDetail {
  id: number;
  name: string;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  parts: MovieCollectionPart[];
}

export interface MovieExtras {
  cast: MovieCastMember[];
  director?: string | null;
  recommendations: MovieRecommendation[];
  collection?: MovieCollectionDetail | null;
}

export interface FriendMovieLog {
  id: number;
  friend_id: number;
  friend_name: string;
  friend_avatar?: string | null;
  status: string;
  rating?: number | null;
  notes?: string | null;
  review_visibility: string;
  watched_at?: string | null;
  viewing_platform_name?: string | null;
  comments: ReviewComment[];
}

export interface TMDBMovieSearchResult {
  id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  italy_release_date?: string | null;
  vote_average?: number | null;
}

export interface TMDBPaginatedMovieSearch {
  page: number;
  results: TMDBMovieSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface UpcomingMovie {
  movie_tmdb_id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  italy_release_date?: string | null;
  is_recent_release: boolean;
  days_since_release?: number | null;
  is_watched: boolean;
}

export interface MovieDashboardStats {
  movies_watched_this_year: number;
  total_movies_tracked: number;
  movies_in_watchlist: number;
  last_added_movie?: string | null;
  last_watched_movie?: string | null;
}

export interface MovieFullStats {
  total_watch_time: {
    days: number;
    hours: number;
    minutes: number;
    total_minutes: number;
  };
  completion_rate: {
    percentage: number;
    watched: number;
    to_watch: number;
  };
  watchlist_forecast: {
    estimated_date: string | null;
  };
  personal_records: {
    max_movies_in_day: string;
    max_movies_day: string | null;
  };
  general_stats: {
    movies_last_month: number;
    movies_last_year: number;
    hours_last_month: number;
    hours_last_year: number;
    minutes_last_month?: number;
    minutes_last_year?: number;
    movies_watched_total: number;
    movies_to_watch_total: number;
  };
  ratings_distribution: { rating: number; count: number }[];
  ratings_by_genre: { genre: string; average_rating: number }[];
  top_10_movies: { title: string; rating: number }[];
  most_rewatched: { title: string; rewatch_count: number; rating?: number | null }[];
  rewatch_comparison?: {
    first_watch_hours: number;
    rewatch_hours: number;
  };
  guilty_pleasures?: { title: string; rewatch_count: number; rating: number }[];
  platform_distribution: { platform: string; percentage: number }[];
  viewing_habits: {
    by_day: Record<string, number>;
    by_hour: Record<string, number>;
  };
  genres_distribution?: { genre: string; percentage: number; count?: number }[];
  time_trend?: Record<
    string,
    { period: string; hours: number; movies?: number; episodes?: number }[]
  >;
}

export type MovieDetailTarget =
  | Movie
  | TMDBMovie
  | MovieRecommendation
  | TMDBMovieSearchResult
  | MovieCollectionPart
  | Partial<Movie>;

export function extractMovieTmdbId(item: MovieDetailTarget | null | undefined): number | undefined {
  if (!item) return undefined;
  if ('tmdb_id' in item && typeof item.tmdb_id === 'number') {
    return item.tmdb_id;
  }
  if ('movie_tmdb_id' in item && typeof item.movie_tmdb_id === 'number') {
    return item.movie_tmdb_id;
  }
  if ('id' in item && typeof item.id === 'number') {
    return item.id;
  }
  return undefined;
}

export interface MovieFilters {
  keyword: string;
  genre: string;
  platform: string;
  year: string;
  saga: string;
  ratings: string[];
  sortBy: string;
  listId: number | null;
  obtainedFilter?: 'all' | 'obtained' | 'not_obtained';
  globalSearch?: boolean;
}
