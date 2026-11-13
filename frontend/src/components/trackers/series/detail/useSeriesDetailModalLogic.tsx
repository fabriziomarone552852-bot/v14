import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { resolveImageUrl } from '@/utils/imageUtils';
import {
  type TMDBSeries,
  type UserSeriesTracking,
  type TMDBEpisode,
  type SeriesDetailTarget,
  type SeriesFriendDisplayItem,
  extractSeriesTmdbId,
} from '@/types/trackers';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useMediaLists, useFriendsSeriesReviews } from '@/hooks/queries/useTrackersQueries';

export type TabType = 'overview' | 'seasons' | 'review';

export interface TMDBProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
}

export interface TMDBProvidersResponse {
  flatrate?: TMDBProvider[];
  buy?: TMDBProvider[];
  rent?: TMDBProvider[];
}

interface UseSeriesDetailModalLogicProps {
  isOpen: boolean;
  series: SeriesDetailTarget | UserSeriesTracking;
  initialTab?: TabType;
  initialEpisode?: TMDBEpisode | null;
  initialReviewLogId?: number;
  onToggleTrack?: (tmdbId: number, isTracked: boolean) => void;
}

export const useSeriesDetailModalLogic = ({
  isOpen,
  series,
  initialTab = 'overview',
  initialEpisode = null,
  initialReviewLogId,
  onToggleTrack,
}: UseSeriesDetailModalLogicProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [internalEpisode, setInternalEpisode] = useState<TMDBEpisode | null>(initialEpisode);
  const [internalReviewLogId, setInternalReviewLogId] = useState<number | undefined>(initialReviewLogId);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [showListsPanel, setShowListsPanel] = useState(false);
  const [isListManagerOpen, setIsListManagerOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [listDetailId, setListDetailId] = useState<number | null>(null);

  const [isPressing, setIsPressing] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const { markAllEpisodesWatched, updateSeries } = useTrackersMutations();
  const { data: mediaLists } = useMediaLists();

  const tmdbIdToFetch = extractSeriesTmdbId(series);

  // Reset states when opened with new series/tab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setInternalEpisode(initialEpisode);
      setInternalReviewLogId(initialReviewLogId);
    }
  }, [isOpen, initialTab, initialEpisode, initialReviewLogId, tmdbIdToFetch]);

  // Fetch sempre i dettagli aggiornati per avere la lista episodi completa (lazy sync dal backend)
  const { data: detailData } = useQuery<TMDBSeries | null>({
    queryKey: ['trackers', 'series', 'detail', tmdbIdToFetch],
    queryFn: async () => {
      if (!tmdbIdToFetch) return null;
      try {
        const res = await api.get<TMDBSeries>(`/trackers/series/${tmdbIdToFetch}/preview`);
        return res || null;
      } catch {
        return null;
      }
    },
    enabled: isOpen && !!tmdbIdToFetch,
    staleTime: 5 * 60 * 1000,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (!data.episodes || data.episodes.length === 0) && (data.total_episodes ?? 0) > 0) {
        return 2000;
      }
      return false;
    },
  });

  const { data: providersData } = useQuery<TMDBProvidersResponse | null>({
    queryKey: ['trackers', 'series', 'providers', tmdbIdToFetch],
    queryFn: async () => {
      if (!tmdbIdToFetch) return null;
      try {
        const res = await api.get<TMDBProvidersResponse>(`/trackers/series/${tmdbIdToFetch}/providers`);
        return res || null;
      } catch {
        return null;
      }
    },
    enabled: isOpen && !!tmdbIdToFetch,
    staleTime: 24 * 60 * 60 * 1000,
  });

  // Normalizziamo i dati
  const isUserTracked = 'status' in series && typeof series.status === 'string';
  const userTracking = isUserTracked ? (series as UserSeriesTracking) : null;

  // Type Guard rigoroso per identificare oggetti compatibili con TMDBSeries (Zero casting forzato)
  const isTMDBSeriesLike = (
    s: SeriesDetailTarget | UserSeriesTracking
  ): s is TMDBSeries => 'tmdb_id' in s && typeof s.tmdb_id === 'number';

  const baseTmdb: Partial<TMDBSeries> =
    'tmdb_series' in series && series.tmdb_series
      ? series.tmdb_series
      : isTMDBSeriesLike(series)
      ? series
      : {};

  let tmdbSeries: TMDBSeries = useMemo(() => {
    const titleVal =
      ('title' in series && typeof series.title === 'string' ? series.title : '') ||
      ('name' in series && typeof (series as { name?: string }).name === 'string'
        ? (series as { name?: string }).name
        : '') ||
      '';

    let s: TMDBSeries = {
      tmdb_id: tmdbIdToFetch ?? 0,
      title: titleVal,
      ...baseTmdb,
    };

    if (isUserTracked && 'episodes' in series && Array.isArray(series.episodes)) {
      s.episodes = series.episodes;
    }

    if (detailData) {
      s = { ...s, ...detailData };
      s.episodes = detailData.episodes || [];
    }

    return s;
  }, [baseTmdb, detailData, isUserTracked, series, tmdbIdToFetch]);

  const title = tmdbSeries.title || 'Dettaglio Serie';
  const posterUrl = userTracking?.custom_poster_path
    ? resolveImageUrl(userTracking.custom_poster_path)
    : tmdbSeries.poster_path
    ? `https://image.tmdb.org/t/p/w500${tmdbSeries.poster_path}`
    : 'https://placehold.co/500x750/e2e8f0/64748b?text=No+Poster';

  const backdropUrl = tmdbSeries.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${tmdbSeries.backdrop_path}`
    : 'https://placehold.co/1280x720/e2e8f0/64748b?text=No+Backdrop';

  const genres = useMemo(
    () => (tmdbSeries.genres ? tmdbSeries.genres.split(',').map((g) => g.trim()) : []),
    [tmdbSeries.genres]
  );

  const listsWithSeries = useMemo(() => {
    if (!mediaLists || !tmdbSeries.tmdb_id) return [];
    return mediaLists.filter((list) =>
      list.items?.some((item) => item.series_tmdb_id === tmdbSeries.tmdb_id)
    );
  }, [mediaLists, tmdbSeries.tmdb_id]);

  const tmdbStatusMap: Record<string, string> = {
    'Returning Series': 'In produzione',
    Ended: 'Conclusa',
    Canceled: 'Cancellata',
    Miniseries: 'Miniserie',
    'In Production': 'In produzione',
    Planned: 'Annunciata',
    Pilot: 'Pilot',
  };
  const rawStatus = tmdbSeries.tmdb_status || 'Sconosciuto';
  const statusLabel = tmdbStatusMap[rawStatus] || rawStatus;

  let StatusIcon: React.ReactNode = null;
  let statusColor = 'bg-gray-500';
  let statusText = statusLabel;

  if (rawStatus === 'Canceled') {
    StatusIcon = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
    statusColor = 'bg-red-500';
    statusText = 'Cancellata';
  } else if (rawStatus === 'Ended') {
    StatusIcon = (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    );
    statusColor = 'bg-blue-500';
    statusText = 'Conclusa';
  } else if (rawStatus === 'Returning Series' || rawStatus === 'In Production') {
    StatusIcon = (
      <svg className="w-4 h-4 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
    statusColor = 'bg-green-500';
    statusText = 'In produzione';
  } else {
    StatusIcon = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    statusText = statusLabel;
  }

  const { data: friendsReviews, isLoading: isFriendsLoading } = useFriendsSeriesReviews(
    tmdbIdToFetch,
    isOpen
  );

  const SERIES_FRIENDS = useMemo(
    () =>
      (friendsReviews || []).reduce((acc: SeriesFriendDisplayItem[], f) => {
        if (!acc.find((x) => x.id === f.friend_id)) {
          let finalStatus = f.status || 'watching';
          if (finalStatus === 'to_watch') finalStatus = 'planned';
          if (finalStatus === 'watched') {
            const isEnded =
              tmdbSeries?.tmdb_status === 'Ended' || tmdbSeries?.tmdb_status === 'Canceled';
            finalStatus = isEnded ? 'completed' : 'waiting';
          }
          acc.push({
            id: f.friend_id,
            name: f.friend_name,
            avatar: f.friend_avatar ? resolveImageUrl(f.friend_avatar) : '/default_avatar.png',
            status: finalStatus,
          });
        }
        return acc;
      }, []),
    [friendsReviews, tmdbSeries?.tmdb_status]
  );

  const getStatusBorderColor = (status: string) => {
    return getMediaBorderClass(status);
  };

  // Long press for marking all watched
  const handleTouchStart = () => {
    isLongPressRef.current = false;
    setIsPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (tmdbIdToFetch) markAllEpisodesWatched(tmdbIdToFetch);
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
      if (tmdbIdToFetch) markAllEpisodesWatched(tmdbIdToFetch);
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
    if (tmdbIdToFetch && onToggleTrack) {
      onToggleTrack(tmdbIdToFetch, isUserTracked);
    }
  };

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      if (tmdbSeries.tmdb_id) {
        updateSeries({
          id: tmdbSeries.tmdb_id,
          updates: { status: newStatus },
        });
      }
    },
    [tmdbSeries.tmdb_id, updateSeries]
  );

  return {
    activeTab,
    setActiveTab,
    internalEpisode,
    setInternalEpisode,
    internalReviewLogId,
    setInternalReviewLogId,
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
    isPressing,
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
    handleMouseUp,
    handleClickTrack,
    handleStatusChange,
    tmdbIdToFetch,
    tmdbSeries,
    userTracking,
    isUserTracked,
    title,
    posterUrl,
    backdropUrl,
    genres,
    providersData,
    listsWithSeries,
    StatusIcon,
    statusColor,
    statusText,
    SERIES_FRIENDS,
    isFriendsLoading,
    getStatusBorderColor,
  };
};
