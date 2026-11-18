import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MediaCreditPerson } from '@/types/people';

interface UseTrackerPersonNavigationOptions {
  mediaType: 'movie' | 'tv';
  onSelectSameMedia: (tmdbId: number) => void;
  onCloseParentModal: () => void;
}

/**
 * Gestisce apertura della scheda persona (attore/regista/creatore) dai modali dettaglio
 * e navigazione verso il film o la serie selezionati dalla sua filmografia.
 */
export function useTrackerPersonNavigation({
  mediaType,
  onSelectSameMedia,
  onCloseParentModal,
}: UseTrackerPersonNavigationOptions) {
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<MediaCreditPerson | null>(null);

  const openPersonDetail = useCallback((person: MediaCreditPerson) => {
    setSelectedPerson(person);
  }, []);

  const closePersonDetail = useCallback(() => {
    setSelectedPerson(null);
  }, []);

  const handleSelectMovie = useCallback(
    (movieTmdbId: number) => {
      setSelectedPerson(null);
      if (mediaType === 'movie') {
        onSelectSameMedia(movieTmdbId);
      } else {
        onCloseParentModal();
        navigate(`/trackers/film?tmdb_id=${movieTmdbId}`);
      }
    },
    [mediaType, navigate, onCloseParentModal, onSelectSameMedia]
  );

  const handleSelectSeries = useCallback(
    (seriesTmdbId: number) => {
      setSelectedPerson(null);
      if (mediaType === 'tv') {
        onSelectSameMedia(seriesTmdbId);
      } else {
        onCloseParentModal();
        navigate(`/trackers/serie-tv?tmdb_id=${seriesTmdbId}`);
      }
    },
    [mediaType, navigate, onCloseParentModal, onSelectSameMedia]
  );

  return {
    selectedPerson,
    openPersonDetail,
    closePersonDetail,
    handleSelectMovie,
    handleSelectSeries,
  };
}
