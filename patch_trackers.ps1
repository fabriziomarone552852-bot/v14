$content = @"
export interface TMDBEpisode {
  id: number;
  series_tmdb_id: number;
  season_number: number;
  episode_number: number;
  title?: string | null;
  overview?: string | null;
  air_date?: string | null;
  still_path?: string | null;
}

export interface UserEpisodeLog {
  id: number;
  user_id: number;
  episode_id: number;
  tmdb_id: number;
  season_number: number;
  episode_number: number;
  watched_at: string;
}

export interface SeriesCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

export interface SeriesRecommendation {
  id: number;
  name: string;
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
  last_sync_at: string;
  episodes?: TMDBEpisode[];
  cast?: SeriesCastMember[];
  recommendations?: SeriesRecommendation[];
}

export interface UserSeriesTracking {
  id: number;
  series_tmdb_id: number;
  status: string;
  rating?: number | null;
  created_at: string;
  updated_at?: string | null;
  tmdb_series?: TMDBSeries;
  logs?: UserEpisodeLog[];
}
"@
Add-Content c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\types\trackers.ts -Value $content -Encoding UTF8
