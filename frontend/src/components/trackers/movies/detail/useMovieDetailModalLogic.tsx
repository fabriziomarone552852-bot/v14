import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  useMyMovies,
  useMovieExtras,
  useFriendsMovieReviews,
  useMovieProviders,
  type MovieProvidersResponse,
} from '@/hooks/queries/useMovieQueries';
import { useMediaLists } from '@/hooks/queries/useTrackersQueries';
import { useMovieMutations } from '@/hooks/mutations/useMovieMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { resolveImageUrl } from '@/utils/imageUtils';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';
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
  const [activeTab, setActiveTab] = useState<MovieDetailTabType>(initialTab);
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

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const tmdbId = extractMovieTmdbId(movie);

  const { data: myMovies } = useMyMovies();
  const userMovie: Movie | undefined = useMemo(() => {
    if (!tmdbId || !myMovies) return undefined;
    return myMovies.find((m) => m.tmdb_id === tmdbId);
  }, [myMovies, tmdbId]);

  const { data: extras, isLoading: isExtrasLoading } = useMovieExtras(tmdbId, isOpen);

  // Fallback se la scheda attiva è 'saga' ma il film non ha una collezione/saga
  useEffect(() => {
    if (
      activeTab === 'saga' &&
      extras &&
      (!extras.collection?.parts || extras.collection.parts.length === 0)
    ) {
      setActiveTab('overview');
    }
  }, [activeTab, extras]);
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

  // Titolo, Locandina, Backdrop
  const title = ('title' in movie && movie.title) || userMovie?.title || 'Film';
  const originalTitle =
    ('original_title' in movie && movie.original_title) || userMovie?.original_title || '';
  const overview = ('overview' in movie && movie.overview) || userMovie?.overview || '';
  const runtime = ('runtime' in movie && movie.runtime) || userMovie?.runtime || null;
  const releaseDate =
    ('release_date' in movie && movie.release_date) ||
    ('italy_release_date' in movie && movie.italy_release_date) ||
    userMovie?.release_date ||
    userMovie?.italy_release_date ||
    null;

  const posterUrl = userMovie?.custom_poster_path
    ? resolveImageUrl(userMovie.custom_poster_path)
    : ('poster_path' in movie && movie.poster_path)
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : userMovie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${userMovie.poster_path}`
    : '/no-poster.png';

  const backdropUrl = userMovie?.custom_backdrop_path
    ? resolveImageUrl(userMovie.custom_backdrop_path)
    : ('backdrop_path' in movie && movie.backdrop_path)
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : userMovie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${userMovie.backdrop_path}`
    : null;

  const genres = useMemo(() => {
    const raw = ('genres' in movie && movie.genres) || userMovie?.genres;
    if (!raw) return [];
    return raw.split(',').map((g) => g.trim()).filter(Boolean);
  }, [movie, userMovie]);

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

  // Status icon, colore e testo per il badge circolare
  let StatusIcon: React.ReactNode = null;
  let statusColor = 'bg-gray-400';
  let statusText = 'Non in lista';

  if (isWatched) {
    statusColor = 'bg-green-500';
    statusText = 'Guardato (Clicca per segnare da vedere)';
    StatusIcon = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    );
  } else if (isTracked) {
    statusColor = 'bg-blue-500';
    statusText = 'In lista / Da vedere (Clicca per segnare come visto)';
    StatusIcon = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    );
  } else {
    statusColor = 'bg-gray-400';
    statusText = 'Non in lista (Clicca per aggiungere alla lista)';
    StatusIcon = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
    );
  }

  const logs: UserMovieLog[] = userMovie?.logs || [];
  const quotes: MovieQuote[] = userMovie?.quotes || [];

  return {
    tmdbId,
    userMovie,
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
  };
};
