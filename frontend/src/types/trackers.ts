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
  logs?: any[];
  quotes?: any[];
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
}

export interface UserSeriesLog {
  id: number;
  user_id: number;
  series_tmdb_id: number;
  rating?: number | null;
  notes?: string | null;
  review_visibility: string;
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
