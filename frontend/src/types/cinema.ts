// src/types/cinema.ts

export interface CinemaProvince {
  name: string;
  slug: string;
  region?: string | null;
}

export interface CinemaSummary {
  id: string;
  name: string;
  slug: string;
  city: string;
  province_slug: string;
  url: string;
}

export interface MovieInCinemaSummary {
  idf: string;
  title: string;
  original_title?: string | null;
  poster?: string | null;
  genre?: string | null;
  duration?: string | null;
  release_date?: string | null;
  rating?: string | null;
  ticket_search_url?: string | null;
  tmdb_id?: number | null;
}

export interface ProvinceCinemaData {
  province_name: string;
  province_slug: string;
  movies: MovieInCinemaSummary[];
  cinemas: CinemaSummary[];
}

export interface CinemaRoomShowtime {
  sala: string;
  posti?: string | null;
  orari_raw: string;
  showtimes: string[];
}

export interface MovieCinemaShowtimes {
  cinema_id?: string | null;
  cinema_slug?: string | null;
  cinema_name: string;
  cinema_url?: string | null;
  address?: string | null;
  ticket_url?: string | null;
  rooms: CinemaRoomShowtime[];
}

export interface CinemaScheduleMovie {
  idf?: string | null;
  title: string;
  poster?: string | null;
  genre?: string | null;
  duration?: string | null;
  sala?: string | null;
  orari?: string | null;
  showtimes: string[];
  ticket_url?: string | null;
  tmdb_id?: number | null;
}

export interface CinemaSchedule {
  cinema_id: string;
  cinema_slug: string;
  cinema_name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  movies: CinemaScheduleMovie[];
}
