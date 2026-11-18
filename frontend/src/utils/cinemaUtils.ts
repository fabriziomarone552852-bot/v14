import type { MovieInCinemaSummary } from '@/types/cinema';

/**
 * Normalizza il titolo di un film per confrontare in sicurezza risultati TMDB e ComingSoon.
 */
export function normalizeCinemaTitle(title?: string | null): string {
  return (title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Individua un film in programmazione nella provincia selezionata tramite `tmdb_id` o titolo normalizzato.
 */
export function findMatchingCinemaMovie(
  cinemaMovies: MovieInCinemaSummary[] | undefined,
  tmdbId?: number,
  movieTitle?: string | null
): MovieInCinemaSummary | undefined {
  if (!cinemaMovies || cinemaMovies.length === 0) return undefined;

  const cleanTarget = (movieTitle || '').trim().toLowerCase();
  const normTarget = normalizeCinemaTitle(cleanTarget);

  return cinemaMovies.find((m) => {
    if (tmdbId && m.tmdb_id && m.tmdb_id === tmdbId) return true;
    if (!cleanTarget) return false;

    const mClean = (m.title || '').trim().toLowerCase();
    if (mClean === cleanTarget) return true;

    const normM = normalizeCinemaTitle(mClean);
    if (!normM || !normTarget) return false;
    return normM === normTarget || normM.includes(normTarget) || normTarget.includes(normM);
  });
}
