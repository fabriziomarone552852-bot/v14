export interface TMDBEpisode {
  id: number;
  series_tmdb_id: number;
  season_number: number;
  episode_number: number;
  title?: string | null;
  overview?: string | null;
  air_date?: string | null;
  still_path?: string | null;
  vote_average?: number | null;
  is_watched?: boolean;
  watch_count?: number;
  logs?: UserEpisodeLog[];
  quotes?: SeriesQuote[];
}

export interface ReviewComment {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  text: string;
  created_at: string;
}

export interface UserEpisodeLog {
  id: number;
  user_id: number;
  episode_id: number;
  tmdb_id: number;
  season_number: number;
  episode_number: number;
  watched_at: string;
  notes?: string;
  review_visibility?: string;
  rating?: number;
  comments?: ReviewComment[];
}

export interface SeriesCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

export interface SeriesRecommendation {
  id: number;
  name?: string;
  title?: string;
  tmdb_id?: number;
  backdrop_path?: string | null;
  poster_path?: string | null;
}

export interface TMDBSeries {
  tmdb_id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  tmdb_status?: string | null;
  genres?: string | null;
  networks?: string | null;
  creators?: string | null;
  total_seasons?: number | null;
  total_episodes?: number | null;
  first_air_date?: string | null;
  last_air_date?: string | null;
  last_sync_at?: string;
  episodes?: TMDBEpisode[];
  cast?: SeriesCastMember[];
  recommendations?: SeriesRecommendation[];
  vote_average?: number | null;
  vote_count?: number | null;
}

export interface UserSeriesLog {
  id: number;
  user_id: number;
  series_tmdb_id: number;
  rating?: number | null;
  notes?: string | null;
  review_visibility: string;
  viewing_platform_name?: string | null;
  watched_at: string;
  updated_at?: string | null;
  comments: ReviewComment[];
}

export interface UserSeriesTracking {
  id: number;
  series_tmdb_id: number;
  status: string;
  rating?: number | null;
  created_at: string;
  updated_at?: string | null;
  tmdb_series?: TMDBSeries;
  logs?: UserSeriesLog[];
  notes?: string;
  review_visibility?: string;
  custom_poster_path?: string | null;
}

export interface TVEpisode {
  id: number;
  tmdb_id?: number | null;
  season_number: number;
  episode_number: number;
  title?: string | null;
  air_date?: string | null;
  watched: boolean;
  watched_at?: string | null;
}

export type TVSeries = TMDBSeries & UserSeriesTracking;

export type SeriesDetailTarget = TVSeries | TMDBSeries | SeriesRecommendation | TMDBSeriesSearchResult | Partial<TVSeries>;

export function extractSeriesTmdbId(item: SeriesDetailTarget | null | undefined): number | undefined {
  if (!item) return undefined;
  if ('tmdb_id' in item && typeof item.tmdb_id === 'number') {
    return item.tmdb_id;
  }
  if ('series_tmdb_id' in item && typeof item.series_tmdb_id === 'number') {
    return item.series_tmdb_id;
  }
  if ('tmdb_series' in item && item.tmdb_series && typeof item.tmdb_series.tmdb_id === 'number') {
    return item.tmdb_series.tmdb_id;
  }
  if ('id' in item && typeof item.id === 'number') {
    return item.id;
  }
  return undefined;
}

export interface TMDBSeriesSearchResult {
  id: number;
  name: string;
  original_name?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string | null;
  vote_average?: number | null;
}

export interface TMDBPaginatedSearch {
  page: number;
  results: TMDBSeriesSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface FriendSeriesLog {
  id: number;
  friend_id: number;
  friend_name: string;
  friend_avatar?: string | null;
  status: string;
  rating?: number | null;
  notes?: string | null;
  review_visibility: string;
  updated_at: string;
  watched_at?: string | null;
  viewing_platform_name?: string | null;
  comments: ReviewComment[];
}

export interface FriendEpisodeLog {
  rating?: number | null;
  id: number;
  friend_id: number;
  friend_name: string;
  friend_avatar?: string | null;
  notes?: string | null;
  review_visibility: string;
  watched_at: string;
  comments: ReviewComment[];
}

export interface TVDashboardStats {
  episodes_watched_this_year: number;
  series_completed_this_year: number;
  total_series_tracked: number;
  last_added_series?: string;
  last_watched_episode?: string;
  last_completed_series?: string;
}

export interface UpcomingEpisode {
  episode_id: number;
  series_tmdb_id: number;
  series_title: string;
  series_poster_path?: string | null;
  season_number: number;
  episode_number: number;
  episode_title?: string | null;
  air_date: string;
}

export interface SeriesQuote {
  id: number;
  episode_id: number;
  quote_text: string;
  created_at: string;
  series_title: string;
  season_number: number;
  episode_number: number;
  series_poster_path?: string | null;
}

export interface TMDBSeriesSimple {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  first_air_date?: string | null;
  genres?: string | null;
  status?: string;
}

export interface MediaListItem {
  id: number;
  list_id: number;
  series_tmdb_id?: number | null;
  sort_order: number;
  added_at: string;
  series?: TMDBSeriesSimple | null;
}

export interface MediaList {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
  visibility: string;
  created_at: string;
  updated_at?: string | null;
  items: MediaListItem[];
}

export interface GenreDistribution {
  genre: string;
  percentage: number;
}

export interface TimeTrendPeriod {
  period: string;
  hours: number;
  episodes: number;
}

export interface PlatformDistribution {
  platform: string;
  percentage: number;
}

export interface GraveyardSeries {
  title: string;
  abandoned_date: string | null;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface GenreRating {
  genre: string;
  average_rating: number;
}

export interface TopSeries {
  title: string;
  rating: number;
}

export interface RewatchedItem {
  title: string;
  rating?: number | null;
  rewatch_count: number;
}

export interface TVFullStats {
  genres_distribution: GenreDistribution[];
  time_trend: Record<string, TimeTrendPeriod[]>;
  total_watch_time: { days: number; hours: number };
  completion_rate: { percentage: number; completed: number; dropped: number };
  watchlist_forecast: { estimated_date: string | null };
  platform_distribution: PlatformDistribution[];
  viewing_habits: { by_day: Record<string, number> };
  graveyard: GraveyardSeries[];
  satisfaction_index: { period: string; index: number }[];
  personal_records: { max_episodes_in_day: number; max_episodes_day: string | null };
  series_ratings_distribution: RatingDistribution[];
  episode_ratings_distribution: RatingDistribution[];
  general_stats: {
    episodes_last_month: number;
    episodes_last_year: number;
    series_completed_last_month: number;
    series_completed_last_year: number;
    series_watching_last_month: number;
    series_watching_last_year: number;
    series_to_watch_last_month: number;
    series_to_watch_last_year: number;
    series_dropped_last_month: number;
    series_dropped_last_year: number;
  };
  ratings_by_genre: GenreRating[];
  top_10_series: TopSeries[];
  most_rewatched: RewatchedItem[];
  most_rewatched_episodes: RewatchedItem[];
  rewatch_comparison: { first_watch_hours: number; rewatch_hours: number };
  guilty_pleasures: RewatchedItem[];
}

export interface GenericSuccessResponse {
  success: boolean;
  message?: string;
}

export interface ToggleEpisodeWatchedResponse {
  watched: boolean;
  watch_count: number;
}

export interface MarkAllWatchedResponse {
  success: boolean;
  watched_count?: number;
}

export interface SeriesLogMutationPayload {
  rating?: number | null;
  notes?: string;
  review_visibility?: string;
  watched_at?: string;
  viewing_platform_name?: string | null;
}

export type AnyReviewLog = UserSeriesLog | UserEpisodeLog | FriendSeriesLog | FriendEpisodeLog;

export interface UnifiedReviewData<TLog extends AnyReviewLog = AnyReviewLog> {
  id: string | number;
  author_id: string | number;
  author_name: string;
  author_avatar?: string | null;
  rating: number;
  notes: string;
  updated_at: string;
  review_visibility?: 'private' | 'friends_only' | 'public' | string;
  viewing_platform_name?: string | null;
  comments: ReviewComment[];
  is_mine: boolean;
  original_log?: TLog | null;
}

export interface SeriesFriendDisplayItem {
  id: number;
  name: string;
  avatar: string;
  status: string;
}

export interface EpisodeQuotePayload {
  episode_id: number;
  quote_text: string;
}



