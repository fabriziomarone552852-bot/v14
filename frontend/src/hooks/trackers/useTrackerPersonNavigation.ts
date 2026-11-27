import { useCallback } from 'react';
import type { MediaCreditPerson } from '@/types/people';
import {
  useTrackerModalStack,
  type TrackerModalSurface,
} from '@/context/TrackerModalStackContext';

export interface UseTrackerPersonNavigationOptions {
  surface: TrackerModalSurface;
}

/**
 * Hook leggero per aprire una scheda persona (o un titolo correlato/saga)
 * impilandola nello stack di navigazione dei modali tracker, così che la chiusura ("X")
 * torni passo dopo passo alla scheda precedente senza perdere il contesto.
 */
export function useTrackerPersonNavigation({ surface }: UseTrackerPersonNavigationOptions) {
  const { pushPerson, pushMovie, pushSeries } = useTrackerModalStack();

  const openPersonDetail = useCallback(
    (person: MediaCreditPerson) => {
      pushPerson(person, surface);
    },
    [pushPerson, surface]
  );

  const openMovieInStack = useCallback(
    (movieTmdbId: number) => {
      pushMovie(movieTmdbId, surface);
    },
    [pushMovie, surface]
  );

  const openSeriesInStack = useCallback(
    (seriesTmdbId: number) => {
      pushSeries(seriesTmdbId, surface);
    },
    [pushSeries, surface]
  );

  return {
    openPersonDetail,
    openMovieInStack,
    openSeriesInStack,
  };
}
