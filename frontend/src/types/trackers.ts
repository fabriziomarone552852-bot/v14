// src/types/trackers.ts

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

export interface TVSeries {
  id: number;
  tmdb_id?: number | null;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  status: string; // "to_watch", "watching", "watched", "dropped"
  tmdb_status?: string | null;
  total_seasons?: number | null;
  total_episodes?: number | null;
  first_air_date?: string | null;
  last_air_date?: string | null;
  rating?: number | null;
  created_at: string;
  updated_at?: string | null;
  
  episodes: TVEpisode[];
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
