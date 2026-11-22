import React, { Suspense, useCallback } from 'react';
import {
  useTrackerModalStack,
  type TrackerModalStackEntry,
} from '@/context/TrackerModalStackContext';
import { useMyMovies } from '@/hooks/queries/useMovieQueries';
import { useMySeries } from '@/hooks/queries/useTrackersQueries';
import { useMovieMutations } from '@/hooks/mutations/useMovieMutations';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { extractMovieTmdbId } from '@/types/movies';

const IS_MOBILE_BUILD = import.meta.env.VITE_APP_TARGET === 'mobile';

const LazyMobilePersonDetailModal = React.lazy(() =>
  import('@/mobile/components/trackers/shared/detail/MobilePersonDetailModal').then((m) => ({
    default: m.MobilePersonDetailModal,
  }))
);
const LazyMobileMovieDetailModal = React.lazy(() =>
  import('@/mobile/components/trackers/movies/detail/MobileMovieDetailModal').then((m) => ({
    default: m.MobileMovieDetailModal,
  }))
);
const LazyMobileTVSeriesDetailModal = React.lazy(() =>
  import('@/mobile/components/trackers/series/detail/MobileTVSeriesDetailModal').then((m) => ({
    default: m.MobileTVSeriesDetailModal,
  }))
);

const LazyDesktopPersonDetailModal = !IS_MOBILE_BUILD
  ? React.lazy(() =>
      import('@/components/trackers/shared/detail/PersonDetailModal').then((m) => ({
        default: m.PersonDetailModal,
      }))
    )
  : null;

const LazyDesktopMovieDetailModal = !IS_MOBILE_BUILD
  ? React.lazy(() =>
      import('@/components/trackers/movies/detail/MovieDetailModal').then((m) => ({
        default: m.MovieDetailModal,
      }))
    )
  : null;

const LazyDesktopSeriesDetailModal = !IS_MOBILE_BUILD
  ? React.lazy(() =>
      import('@/components/trackers/series/detail/SeriesDetailModal').then((m) => ({
        default: m.SeriesDetailModal,
      }))
    )
  : null;

const STACK_Z_INDEX_CLASS = 'z-[10038]';
const STACK_BACK_HANDLER_PRIORITY = 32;

interface ActiveTrackerStackRendererProps {
  entry: TrackerModalStackEntry;
}

/**
 * Montato solo quando lo stack ha almeno un elemento, così non sottoscrive
 * query né mutazioni quando l'utente naviga in altre aree dell'app.
 */
const ActiveTrackerStackRenderer: React.FC<ActiveTrackerStackRendererProps> = ({ entry }) => {
  const { pop, pushMovie, pushSeries, updateTopPersonUiState } = useTrackerModalStack();
  const { confirm } = useConfirm();
  const { data: myMovies = [] } = useMyMovies();
  const { data: mySeries = [] } = useMySeries();
  const { addMovieMutation, deleteMovieMutation } = useMovieMutations();
  const { addSeries, deleteSeries } = useTrackersMutations();

  const handleToggleMovieTrack = useCallback(
    (tmdbId: number, isTracked: boolean) => {
      if (!isTracked) {
        addMovieMutation.mutate({ tmdb_id: tmdbId, status: 'to_watch' });
        return;
      }
      confirm({
        title: 'Rimuovi film',
        message: 'Vuoi rimuovere questo film dalla tua libreria?',
        confirmText: 'Rimuovi',
        cancelText: 'Annulla',
        isDestructive: true,
        onConfirm: () => deleteMovieMutation.mutate(tmdbId),
      });
    },
    [addMovieMutation, confirm, deleteMovieMutation]
  );

  const handleToggleSeriesTrack = useCallback(
    (tmdbId: number, isTracked: boolean) => {
      if (!isTracked) {
        addSeries(tmdbId);
        return;
      }
      confirm({
        title: 'Rimuovi serie TV',
        message: 'Vuoi rimuovere questa serie TV dalla tua libreria?',
        confirmText: 'Rimuovi',
        cancelText: 'Annulla',
        isDestructive: true,
        onConfirm: () => deleteSeries(tmdbId),
      });
    },
    [addSeries, confirm, deleteSeries]
  );

  const isMobileSurface = entry.surface === 'mobile' || IS_MOBILE_BUILD;

  if (entry.type === 'person') {
    if (isMobileSurface || !LazyDesktopPersonDetailModal) {
      return (
        <LazyMobilePersonDetailModal
          key={entry.uid}
          isOpen={true}
          person={entry.person}
          onClose={pop}
          onSelectMovie={(id) => pushMovie(id, entry.surface)}
          onSelectSeries={(id) => pushSeries(id, entry.surface)}
          zIndexClass={STACK_Z_INDEX_CLASS}
          initialUiState={entry.uiState}
          onUiStateChange={updateTopPersonUiState}
        />
      );
    }

    return (
      <LazyDesktopPersonDetailModal
        key={entry.uid}
        isOpen={true}
        person={entry.person}
        onClose={pop}
        onSelectMovie={(id) => pushMovie(id, entry.surface)}
        onSelectSeries={(id) => pushSeries(id, entry.surface)}
        zIndexClass={STACK_Z_INDEX_CLASS}
        initialUiState={entry.uiState}
        onUiStateChange={updateTopPersonUiState}
      />
    );
  }

  if (entry.type === 'movie') {
    const trackedMovie = myMovies.find((m) => m.tmdb_id === entry.tmdbId);
    const targetMovie = trackedMovie || { tmdb_id: entry.tmdbId };

    if (isMobileSurface || !LazyDesktopMovieDetailModal) {
      return (
        <LazyMobileMovieDetailModal
          key={entry.uid}
          isOpen={true}
          onClose={pop}
          movie={targetMovie}
          onToggleTrack={handleToggleMovieTrack}
          onSelectRecommendation={(rec) => {
            const targetId = extractMovieTmdbId(rec);
            if (targetId && targetId !== entry.tmdbId) {
              pushMovie(targetId, entry.surface);
            }
          }}
          zIndexClass={STACK_Z_INDEX_CLASS}
          backHandlerPriority={STACK_BACK_HANDLER_PRIORITY}
        />
      );
    }

    return (
      <LazyDesktopMovieDetailModal
        key={entry.uid}
        isOpen={true}
        onClose={pop}
        movie={targetMovie}
        onToggleTrack={handleToggleMovieTrack}
        onSelectRecommendation={(rec) => {
          const targetId = extractMovieTmdbId(rec);
          if (targetId && targetId !== entry.tmdbId) {
            pushMovie(targetId, entry.surface);
          }
        }}
        zIndexClass={STACK_Z_INDEX_CLASS}
      />
    );
  }

  // entry.type === 'series'
  const trackedSeries = mySeries.find((s) => s.tmdb_id === entry.tmdbId);
  const targetSeries = trackedSeries || { tmdb_id: entry.tmdbId };

  if (isMobileSurface || !LazyDesktopSeriesDetailModal) {
    return (
      <LazyMobileTVSeriesDetailModal
        key={entry.uid}
        isOpen={true}
        onClose={pop}
        series={targetSeries}
        onToggleTrack={handleToggleSeriesTrack}
        onSelectRecommendation={(rec) => {
          const targetId = rec.tmdb_id ?? rec.id;
          if (targetId && targetId !== entry.tmdbId) {
            pushSeries(targetId, entry.surface);
          }
        }}
        zIndexClass={STACK_Z_INDEX_CLASS}
        backHandlerPriority={STACK_BACK_HANDLER_PRIORITY}
      />
    );
  }

  return (
    <LazyDesktopSeriesDetailModal
      key={entry.uid}
      isOpen={true}
      onClose={pop}
      series={targetSeries}
      onToggleTrack={handleToggleSeriesTrack}
      onSelectRecommendation={(rec) => {
        const targetId = rec.tmdb_id ?? rec.id;
        if (targetId && targetId !== entry.tmdbId) {
          pushSeries(targetId, entry.surface);
        }
      }}
      zIndexClass={STACK_Z_INDEX_CLASS}
    />
  );
};

/**
 * Host globale dello stack di navigazione tra schede Persona, Film e Serie TV.
 * Mostra sempre l'elemento in cima allo stack così che chiudere ("X" o tasto Indietro)
 * riporti al modale precedente invece di chiudere tutto o cambiare pagina.
 */
export const TrackerModalStackHost: React.FC = () => {
  const { stack } = useTrackerModalStack();

  if (stack.length === 0) return null;

  const activeEntry = stack[stack.length - 1];

  return (
    <Suspense fallback={null}>
      <ActiveTrackerStackRenderer entry={activeEntry} />
    </Suspense>
  );
};

export default TrackerModalStackHost;
