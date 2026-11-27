import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  useMyMovies,
  useMovieDetail,
  useMovieExtras,
  useFriendsMovieReviews,
  useMovieProviders,
  type MovieProvidersResponse,
} from '@/hooks/queries/useMovieQueries';
import { useMovieCinemaAvailability } from '@/hooks/trackers/useMovieCinemaAvailability';
import { useMediaLists } from '@/hooks/queries/useTrackersQueries';
import { useMovieMutations } from '@/hooks/mutations/useMovieMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { resolveImageUrl } from '@/utils/imageUtils';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';
import {
  hasCompleteMovieDetailMetadata,
  resolveMovieDetailMetadata,
} from './movieDetailMetadataUtils';
import type {
  Movie,
  MovieDetailTarget,
  UserMovieLog,
  MovieQuote,
} from '@/types/movies';
import { extractMovieTmdbId } from '@/types/movies';
import type { SeriesFriendDisplayItem } from '@/types/trackers';
import type { MovieDetailTabType } from '@/hooks/trackers/useMovieUrlParams';

interface UseMovieDetailModalLogicProps {
  isOpen: boolean;
  movie: MovieDetailTarget;
  initialTab?: MovieDetailTabType;
  initialReviewLogId?: number;
  onToggleTrack?: (tmdbId: number, isTracked: boolean) => void;
}

export const useMovieDetailModalLogic = ({
  isOpen,
  movie,
  initialTab = 'overview',
  initialReviewLogId,
  onToggleTrack,
}: UseMovieDetailModalLogicProps) => {
  const { confirm } = useConfirm();
  const tmdbId = extractMovieTmdbId(movie);
  const movieKey = `${isOpen ? 'open' : 'closed'}-${tmdbId ?? 0}-${initialTab}`;
  const [tabSelection, setTabSelection] = useState<{
    key: string;
    tab: MovieDetailTabType;
  }>({ key: movieKey, tab: initialTab });
  const setActiveTab = useCallback(
    (nextTab: MovieDetailTabType) => {
      setTabSelection({ key: movieKey, tab: nextTab });
    },
    [movieKey]
  );

  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [showListsPanel, setShowListsPanel] = useState(false);
  const [isListManagerOpen, setIsListManagerOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [listDetailId, setListDetailId] = useState<number | null>(null);
  const [isHistoricMode, setIsHistoricMode] = useState(false);

  // Gestione Pressione Lunga / Click Rapido sulla Locandina
  const [isPressing, setIsPressing] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const { data: myMovies } = useMyMovies();
  const userMovie: Movie | undefined = useMemo(() => {
    if (!tmdbId || !myMovies) return undefined;
    return myMovies.find((m) => m.tmdb_id === tmdbId);
  }, [myMovies, tmdbId]);

  const hasCompleteMetadataInProp = hasCompleteMovieDetailMetadata(movie);

  const { data: movieDetail, isLoading: isMovieDetailLoading } = useMovieDetail(
    tmdbId,
    isOpen && Boolean(tmdbId) && !userMovie && !hasCompleteMetadataInProp
  );

  const { data: extras, isLoading: isExtrasLoading } = useMovieExtras(tmdbId, isOpen);
  const { data: friendsReviews = [], isLoading: isFriendsLoading } = useFriendsMovieReviews(
    tmdbId,
    isOpen
  );
  const { data: providersData } = useMovieProviders(tmdbId, isOpen);
  const { data: mediaLists = [] } = useMediaLists();

  const {
    addMovieMutation,
    updateMovieMutation,
    markMovieWatchedMutation,
    deleteMovieMutation,
  } = useMovieMutations();

  const isTracked = Boolean(userMovie);
  const isWatched = userMovie?.status === 'watched';
  const isObtained = Boolean(userMovie?.obtained_at);
  const obtainedAt = userMovie?.obtained_at || null;

  // Liste che contengono questo film
  const listsWithMovie = useMemo(() => {
    if (!tmdbId) return [];
    return mediaLists.filter((l) =>
      l.items?.some((it) => it.movie_tmdb_id === tmdbId)
    );
  }, [mediaLists, tmdbId]);

  // Amici con avatar e status border per l'header e il drawer
  const MOVIE_FRIENDS = useMemo(() => {
    return (friendsReviews || []).reduce((acc: SeriesFriendDisplayItem[], f) => {
      if (!acc.find((x) => x.id === f.friend_id)) {
        acc.push({
          id: f.friend_id,
          name: f.friend_name,
          avatar: f.friend_avatar ? resolveImageUrl(f.friend_avatar) : '/default_avatar.png',
          status: f.status === 'watched' ? 'completed' : 'to_watch',
        });
      }
      return acc;
    }, []);
  }, [friendsReviews]);

  const getStatusBorderColor = (status: string) => {
    return getMediaBorderClass(status);
  };

  // Metadati unificati (prop + tracking utente + /trackers/movies/:id se mancante)
  const {
    title,
    originalTitle,
    overview,
    runtime,
    releaseDate,
    posterUrl,
    backdropUrl,
    genres,
  } = useMemo(
    () => resolveMovieDetailMetadata(movie, userMovie, movieDetail),
    [movie, userMovie, movieDetail]
  );

  // Verifica se il film ha spettacoli attivi nelle sale della provincia selezionata
  const {
    cinemaProvinces,
    selectedProvinceSlug,
    currentProvinceName,
    matchedCinemaIdf,
    hasCinemaShowtimes,
    isCinemaCheckSettled,
    handleSelectCinemaProvince,
  } = useMovieCinemaAvailability(tmdbId, title, isOpen);

  const rawSelectedTab = tabSelection.key === movieKey ? tabSelection.tab : initialTab;
  const activeTab: MovieDetailTabType =
    rawSelectedTab === 'saga' &&
    extras &&
    (!extras.collection?.parts || extras.collection.parts.length === 0)
      ? 'overview'
      : rawSelectedTab === 'cinema' &&
        isCinemaCheckSettled &&
        !hasCinemaShowtimes &&
        tabSelection.key !== movieKey
      ? 'overview'
      : rawSelectedTab;

  const resolvedMovie = useMemo<MovieDetailTarget>(
    () => userMovie || movieDetail || movie,
    [userMovie, movieDetail, movie]
  );

  // Click per aggiungere o rimuovere dalla libreria
  const handleToggleLibrary = () => {
    if (!tmdbId) return;
    if (onToggleTrack) {
      onToggleTrack(tmdbId, isTracked);
    } else if (!isTracked) {
      addMovieMutation.mutate({ tmdb_id: tmdbId, status: 'to_watch' });
    } else {
      confirm({
        title: 'Rimuovi film',
        message: 'Vuoi rimuovere questo film dalla tua libreria?',
        confirmText: 'Rimuovi',
        cancelText: 'Annulla',
        isDestructive: true,
        onConfirm: () => deleteMovieMutation.mutate(tmdbId),
      });
    }
  };

  // Toggle stato visto
  const handleToggleWatched = () => {
    if (!tmdbId) return;
    if (!isTracked) {
      addMovieMutation.mutate(
        { tmdb_id: tmdbId, status: 'watched' },
        {
          onSuccess: () => {
            markMovieWatchedMutation.mutate(tmdbId);
          },
        }
      );
    } else if (isWatched) {
      updateMovieMutation.mutate({
        tmdb_id: tmdbId,
        updates: { status: 'to_watch' },
      });
    } else {
      markMovieWatchedMutation.mutate(tmdbId);
    }
  };

  // Rewatch
  const handleRewatch = () => {
    if (!tmdbId || !isTracked) return;
    markMovieWatchedMutation.mutate(tmdbId);
  };

  // Toggle ottenuto (comprato/scaricato)
  const handleToggleObtained = () => {
    if (!tmdbId) return;
    if (!isTracked) {
      addMovieMutation.mutate(
        { tmdb_id: tmdbId, status: 'to_watch' },
        {
          onSuccess: () => {
            updateMovieMutation.mutate({
              tmdb_id: tmdbId,
              updates: { obtained_at: new Date().toISOString() },
            });
          },
        }
      );
    } else {
      updateMovieMutation.mutate({
        tmdb_id: tmdbId,
        updates: { obtained_at: isObtained ? null : new Date().toISOString() },
      });
    }
  };

  // Salvataggio custom poster
  const handleSaveCustomPoster = (newUrl: string) => {
    if (!tmdbId) return;
    if (!isTracked) {
      addMovieMutation.mutate(
        { tmdb_id: tmdbId, status: 'to_watch' },
        {
          onSuccess: () => {
            updateMovieMutation.mutate({
              tmdb_id: tmdbId,
              updates: { custom_poster_path: newUrl },
            });
          },
        }
      );
    } else {
      updateMovieMutation.mutate({
        tmdb_id: tmdbId,
        updates: { custom_poster_path: newUrl },
      });
    }
  };

  // Long press sulla locandina per segnare come visto rapido
  const handleTouchStart = () => {
    isLongPressRef.current = false;
    setIsPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (tmdbId) markMovieWatchedMutation.mutate(tmdbId);
    }, 700);
  };

  const handleTouchEnd = () => {
    setIsPressing(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseDown = () => {
    isLongPressRef.current = false;
    setIsPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (tmdbId) markMovieWatchedMutation.mutate(tmdbId);
    }, 700);
  };

  const handleMouseUp = () => {
    setIsPressing(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClickTrack = () => {
    if (isLongPressRef.current) return;
    handleToggleLibrary();
  };

  // Status icon, colore e testo per il badge circolare dello stato visto (nel banner accanto al titolo)
  const statusColor = isWatched
    ? 'bg-blue-600 text-white border-white shadow-md'
    : 'bg-black/40 text-gray-300 border-white/60 backdrop-blur-xs hover:border-white hover:text-white';
  const statusText = isWatched
    ? 'Visto (Tocca per segnare come da vedere)'
    : 'Non visto (Tocca per segnare come visto)';
  const StatusIcon: React.ReactNode = isWatched ? (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  const logs: UserMovieLog[] = userMovie?.logs || [];
  const quotes: MovieQuote[] = userMovie?.quotes || [];

  return {
    tmdbId,
    userMovie,
    resolvedMovie,
    isMovieDetailLoading,
    extras,
    isExtrasLoading,
    friendsReviews,
    isFriendsLoading,
    providersData: providersData as MovieProvidersResponse | null,
    listsWithMovie,
    MOVIE_FRIENDS,
    getStatusBorderColor,
    title,
    originalTitle,
    overview,
    runtime,
    releaseDate,
    posterUrl,
    backdropUrl,
    genres,
    isTracked,
    isWatched,
    isObtained,
    obtainedAt,
    watchCount: userMovie?.watch_count || (isWatched ? 1 : 0),
    logs,
    quotes,
    activeTab,
    setActiveTab,
    showFriendsPanel,
    setShowFriendsPanel,
    showListsPanel,
    setShowListsPanel,
    isListManagerOpen,
    setIsListManagerOpen,
    isImageModalOpen,
    setIsImageModalOpen,
    listDetailId,
    setListDetailId,
    isHistoricMode,
    setIsHistoricMode,
    isPressing,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleClickTrack,
    handleToggleLibrary,
    handleToggleWatched,
    handleToggleObtained,
    handleRewatch,
    handleSaveCustomPoster,
    StatusIcon,
    statusColor,
    statusText,
    initialReviewLogId,
    hasCinemaShowtimes,
    cinemaProvinces,
    selectedProvinceSlug,
    currentProvinceName,
    matchedCinemaIdf,
    handleSelectCinemaProvince,
  };
};
