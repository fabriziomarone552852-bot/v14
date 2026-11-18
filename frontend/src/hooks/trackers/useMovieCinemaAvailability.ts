import { useMemo } from 'react';
import { useMovieShowtimes } from '@/hooks/queries/useCinemaQueries';
import { useCinemaProvinceSelection } from '@/hooks/trackers/useCinemaProvinceSelection';
import { findMatchingCinemaMovie } from '@/utils/cinemaUtils';

/**
 * Verifica in sicurezza se un film ha spettacoli attualmente attivi nei cinema
 * della provincia selezionata, condividendo la cache React Query delle sale.
 */
export function useMovieCinemaAvailability(
  tmdbId?: number,
  movieTitle?: string | null,
  enabled: boolean = true
) {
  const {
    provinces,
    selectedProvinceSlug,
    provinceData,
    isLoadingCinema,
    currentProvince,
    handleSelectProvince,
  } = useCinemaProvinceSelection(undefined, enabled);

  const matchedCinemaMovie = useMemo(
    () => findMatchingCinemaMovie(provinceData?.movies, tmdbId, movieTitle),
    [provinceData?.movies, tmdbId, movieTitle]
  );

  const { data: showtimes = [], isLoading: isLoadingShowtimes } = useMovieShowtimes(
    selectedProvinceSlug,
    matchedCinemaMovie?.idf || '',
    enabled && Boolean(matchedCinemaMovie?.idf)
  );

  const hasCinemaShowtimes = Boolean(matchedCinemaMovie?.idf) && showtimes.length > 0;
  const isCinemaCheckSettled =
    !isLoadingCinema && (!matchedCinemaMovie?.idf || !isLoadingShowtimes);

  return {
    cinemaProvinces: provinces,
    selectedProvinceSlug,
    currentProvinceName: currentProvince.name,
    matchedCinemaIdf: matchedCinemaMovie?.idf,
    hasCinemaShowtimes,
    isCinemaCheckSettled,
    handleSelectCinemaProvince: handleSelectProvince,
  };
}
