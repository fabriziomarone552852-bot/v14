/**
 * Tipi condivisi per persone (attori, registi, creatori), crediti e filmografia TMDB.
 */

export type PeopleFilterMode = 'AND' | 'OR';

export interface MediaCreditMember {
  id: number;
  name: string;
  role?: string | null;
  department?: string | null;
  profile_path?: string | null;
}

export interface MediaCreditPerson {
  id: number;
  name: string;
  profile_path?: string | null;
}

export interface TMDBPersonAlternative {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department?: string | null;
  known_for_titles: string[];
}

export interface ResolvedPersonRef {
  query: string;
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department?: string | null;
  alternatives: TMDBPersonAlternative[];
}

export interface TMDBPersonSearchItem {
  id: number;
  name: string;
  original_name?: string | null;
  profile_path?: string | null;
  known_for_department?: string | null;
  popularity?: number | null;
  known_for_titles: string[];
}

export interface TMDBPaginatedPersonSearch {
  page: number;
  results: TMDBPersonSearchItem[];
  total_pages: number;
  total_results: number;
}

export interface PersonCreditMovieItem {
  id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  vote_average?: number | null;
  popularity?: number | null;
  roles: string[];
}

export interface PersonCreditSeriesItem {
  id: number;
  name: string;
  original_name?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string | null;
  vote_average?: number | null;
  popularity?: number | null;
  roles: string[];
}

export interface PersonDetailResponse {
  id: number;
  name: string;
  profile_path?: string | null;
  biography?: string | null;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  known_for_department?: string | null;
  popularity?: number | null;
  movie_credits: PersonCreditMovieItem[];
  tv_credits: PersonCreditSeriesItem[];
}
