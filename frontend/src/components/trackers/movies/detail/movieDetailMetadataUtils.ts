import type { Movie, MovieDetailTarget } from '@/types/movies';
import { resolveImageUrl } from '@/utils/imageUtils';

export interface ResolvedMovieDetailMetadata {
  title: string;
  originalTitle: string;
  overview: string;
  runtime: number | null;
  releaseDate: string | null;
  posterUrl: string;
  backdropUrl: string | null;
  genres: string[];
}

/**
 * Verifica se l'oggetto target passato al modale possiede già tutti i metadati di base
 * (evitando chiamate extra a `/trackers/movies/:id` quando già completi).
 */
export function hasCompleteMovieDetailMetadata(movie: MovieDetailTarget): boolean {
  return Boolean(
    'title' in movie &&
      movie.title &&
      'poster_path' in movie &&
      movie.poster_path &&
      'runtime' in movie &&
      movie.runtime &&
      'genres' in movie &&
      movie.genres &&
      'overview' in movie &&
      movie.overview
  );
}

/**
 * Unifica i metadati di base di un film combinando prop iniziale, tracking utente in RAM
 * e risposta idratata dal backend (`/trackers/movies/:id`).
 */
export function resolveMovieDetailMetadata(
  movie: MovieDetailTarget,
  userMovie?: Movie,
  movieDetail?: Movie | null
): ResolvedMovieDetailMetadata {
  const title =
    ('title' in movie && movie.title) ||
    userMovie?.title ||
    movieDetail?.title ||
    'Film';

  const originalTitle =
    ('original_title' in movie && movie.original_title) ||
    userMovie?.original_title ||
    movieDetail?.original_title ||
    '';

  const overview =
    ('overview' in movie && movie.overview) ||
    userMovie?.overview ||
    movieDetail?.overview ||
    '';

  const runtime =
    ('runtime' in movie && movie.runtime) ||
    userMovie?.runtime ||
    movieDetail?.runtime ||
    null;

  const releaseDate =
    ('release_date' in movie && movie.release_date) ||
    ('italy_release_date' in movie && movie.italy_release_date) ||
    userMovie?.release_date ||
    userMovie?.italy_release_date ||
    movieDetail?.release_date ||
    movieDetail?.italy_release_date ||
    null;

  const rawPosterPath =
    ('poster_path' in movie && movie.poster_path) ||
    userMovie?.poster_path ||
    movieDetail?.poster_path ||
    null;
  const posterUrl = userMovie?.custom_poster_path
    ? resolveImageUrl(userMovie.custom_poster_path)
    : rawPosterPath
    ? `https://image.tmdb.org/t/p/w500${rawPosterPath}`
    : '/no-poster.png';

  const rawBackdropPath =
    ('backdrop_path' in movie && movie.backdrop_path) ||
    userMovie?.backdrop_path ||
    movieDetail?.backdrop_path ||
    null;
  const backdropUrl = userMovie?.custom_backdrop_path
    ? resolveImageUrl(userMovie.custom_backdrop_path)
    : rawBackdropPath
    ? `https://image.tmdb.org/t/p/original${rawBackdropPath}`
    : null;

  const rawGenres =
    ('genres' in movie && movie.genres) ||
    userMovie?.genres ||
    movieDetail?.genres;
  const genres = rawGenres
    ? rawGenres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];

  return {
    title,
    originalTitle,
    overview,
    runtime,
    releaseDate,
    posterUrl,
    backdropUrl,
    genres,
  };
}
