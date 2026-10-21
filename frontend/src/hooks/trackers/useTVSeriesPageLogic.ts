import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { userGoalsApi } from '@/api/userGoalsApi';
import { useConfirm } from '@/context/ConfirmContext';
import {
  useMySeries,
  useSeriesStats,
  useMyQuotes,
  useMediaLists,
  useTMDBDiscover,
} from '@/hooks/queries/useTrackersQueries';
import { type TVSeries, type TMDBEpisode, type TMDBPaginatedSearch, type SeriesDetailTarget, extractSeriesTmdbId } from '@/types/trackers';
import type { TabType } from '@/components/trackers/SeriesDetailModal';
import type { MediaFilterState as SeriesFilterState } from '@/components/trackers/MediaFilterModal';
import { useFilteredTVSeries } from './useFilteredTVSeries';
import { useSeriesUrlParams } from './useSeriesUrlParams';

export const useTVSeriesPageLogic = () => {
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const tmdbIdParam = searchParams.get('tmdb_id');
  const openReviewParam = searchParams.get('open_review') === 'true';
  const openEpisodeParam = searchParams.get('open_episode');
  const openReviewLogIdParam = searchParams.get('open_review_log_id');

  const [detailModalOpen, setDetailModalOpen] = useState(() => Boolean(tmdbIdParam));
  const [detailModalSeries, setDetailModalSeries] = useState<SeriesDetailTarget | null>(() => {
    return tmdbIdParam ? { tmdb_id: Number(tmdbIdParam) } : null;
  });
  const [detailModalTab, setDetailModalTab] = useState<TabType>(() => {
    if (openReviewParam) return 'review';
    if (openEpisodeParam) return 'seasons';
    return 'overview';
  });
  const [detailModalEpisode, setDetailModalEpisode] = useState<TMDBEpisode | undefined>(() => {
    if (!openEpisodeParam) return undefined;
    return {
      id: Number(openEpisodeParam),
      series_tmdb_id: Number(tmdbIdParam || 0),
      season_number: 0,
      episode_number: 0,
    } as TMDBEpisode;
  });
  const [detailModalReviewLogId, setDetailModalReviewLogId] = useState<number | undefined>(() => {
    return openReviewLogIdParam ? Number(openReviewLogIdParam) : undefined;
  });

  const openSeriesDetail = (
    seriesItem: SeriesDetailTarget,
    tab: TabType = 'overview',
    episode?: TMDBEpisode,
    reviewLogId?: number
  ) => {
    setDetailModalSeries(seriesItem);
    setDetailModalTab(tab);
    setDetailModalEpisode(episode);
    setDetailModalReviewLogId(reviewLogId);
    setDetailModalOpen(true);
  };

  const { data: series, isLoading, isError } = useMySeries();
  const { data: statsData } = useSeriesStats();
  const { data: myQuotes } = useMyQuotes();
  const { data: myLists } = useMediaLists();

  useSeriesUrlParams(series, detailModalOpen, openSeriesDetail);

  useEffect(() => {
    if (detailModalOpen && detailModalSeries && series) {
      const currentTmdbId = extractSeriesTmdbId(detailModalSeries);
      const updatedSeries = series.find((s) => s.tmdb_id === currentTmdbId);
      if (updatedSeries) {
        if (JSON.stringify(updatedSeries) !== JSON.stringify(detailModalSeries)) {
          setDetailModalSeries(updatedSeries);
        }
      }
    }
  }, [series, detailModalOpen]);

  const [activeTab, setActiveTab] = useState<'all' | 'watching' | 'watched' | 'to_watch'>('all');
  const [goalViewType, setGoalViewType] = useState<'percent' | 'fraction'>('fraction');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<SeriesFilterState>({
    keyword: '',
    genre: 'all',
    network: 'all',
    ratings: [],
    tmdbStatus: 'all',
    year: 'all',
    sortBy: 'date_added_desc',
    listId: null,
  });

  const searchQuery = filters.keyword;

  const handleFilterChange = (newFilters: SeriesFilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      genre: 'all',
      network: 'all',
      ratings: [],
      tmdbStatus: 'all',
      year: 'all',
      sortBy: 'date_added_desc',
      listId: null,
    });
  };

  const hasActiveFilters =
    filters.keyword !== '' ||
    filters.genre !== 'all' ||
    filters.network !== 'all' ||
    (filters.ratings || []).length > 0 ||
    filters.tmdbStatus !== 'all' ||
    filters.year !== 'all' ||
    filters.listId !== null ||
    filters.sortBy !== 'date_added_desc';

  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [isRandomModalOpen, setRandomModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['tmdb', 'search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const data = await api.get<TMDBPaginatedSearch>('/trackers/series/search', {
        params: { query: debouncedQuery, page: 1 },
      });
      return data;
    },
    enabled: !!debouncedQuery.trim(),
  });

  const { data: discoverData, isLoading: isDiscoverLoading } = useTMDBDiscover(filters);

  const removeSeriesMutation = useMutation({
    mutationFn: async (tmdbId: number) => {
      await api.delete(`/trackers/series/${tmdbId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const addSeriesMutation = useMutation({
    mutationFn: async (payload: { tmdb_id: number; status: string }) => {
      const data = await api.post<TVSeries, { tmdb_id: number; status: string }>('/trackers/series', payload);
      return data;
    },
    onMutate: async (payload: { tmdb_id: number; status: string }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'series'] });
      const previousSeries = queryClient.getQueryData<TVSeries[]>(['trackers', 'series']);

      const seriesDetails = searchResults?.results?.find((s) => s.id === payload.tmdb_id);

      if (seriesDetails) {
        queryClient.setQueryData<TVSeries[]>(['trackers', 'series'], (old: TVSeries[] | undefined) => {
          const newSeries: Partial<TVSeries> = {
            id: -Math.floor(Math.random() * 100000),
            tmdb_id: seriesDetails.id,
            title: seriesDetails.name,
            original_title: seriesDetails.original_name || '',
            overview: seriesDetails.overview || '',
            poster_path: seriesDetails.poster_path || '',
            backdrop_path: seriesDetails.backdrop_path || '',
            status: payload.status,
            created_at: new Date().toISOString(),
            episodes: [],
          };
          return [newSeries as TVSeries, ...(old || [])];
        });
      }
      return { previousSeries };
    },
    onError: (
      err: unknown,
      _variables: { tmdb_id: number; status: string },
      context: { previousSeries: TVSeries[] | undefined } | undefined
    ) => {
      if (context?.previousSeries) {
        queryClient.setQueryData(['trackers', 'series'], context.previousSeries);
      }
      console.error('Error adding series:', err);
    },
    onSuccess: (response: TVSeries | null) => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });

      if (detailModalSeries && response) {
        const currentTmdbId = extractSeriesTmdbId(detailModalSeries);
        const respTmdbId = extractSeriesTmdbId(response);

        if (currentTmdbId !== undefined && respTmdbId !== undefined && currentTmdbId === respTmdbId) {
          setDetailModalSeries(response);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const handleAdd = (tmdbId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    addSeriesMutation.mutate({ tmdb_id: tmdbId, status: 'to_watch' });
  };

  const currentYear = new Date().getFullYear();
  const { data: goalData } = useQuery({
    queryKey: ['yearlyGoal', 'series', currentYear],
    queryFn: () => userGoalsApi.getYearlyGoal('series', currentYear),
  });

  const displaySeries = useFilteredTVSeries(series, filters, activeTab, myLists);

  const goal = goalData?.goal_value || 300;
  const currentEpisodes = statsData?.episodes_watched_this_year || 0;
  const goalPercent = Math.min(100, Math.round((currentEpisodes / goal) * 100));

  const handleToggleTrack = (tmdbId: number, isTracked: boolean) => {
    if (!isTracked) {
      addSeriesMutation.mutate({ tmdb_id: tmdbId, status: 'to_watch' });
    } else {
      confirm({
        title: 'Rimuovi serie',
        message: 'Sei sicuro di voler rimuovere questa serie dalla tua libreria?',
        confirmText: 'Rimuovi',
        cancelText: 'Annulla',
        isDestructive: true,
        onConfirm: () => {
          removeSeriesMutation.mutate(tmdbId);
          setDetailModalOpen(false);
        },
      });
    }
  };

  const handleGenreClick = (genre: string) => {
    setFilters((prev: SeriesFilterState) => ({ ...prev, genre }));
    setDetailModalOpen(false);
  };

  const handlePlatformClick = (platform: string) => {
    setFilters((prev: SeriesFilterState) => ({ ...prev, network: platform }));
    setDetailModalOpen(false);
  };

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
  };

  return {
    series,
    isLoading,
    isError,
    handleRetry,
    goalPercent,
    goalViewType,
    setGoalViewType,
    currentEpisodes,
    goal,
    setStatsModalOpen,
    statsModalOpen,
    setRandomModalOpen,
    isRandomModalOpen,
    openSeriesDetail,
    detailModalOpen,
    setDetailModalOpen,
    detailModalSeries,
    setDetailModalSeries,
    detailModalTab,
    setDetailModalTab,
    detailModalEpisode,
    detailModalReviewLogId,
    displaySeries,
    myQuotes,
    isQuoteExpanded,
    setIsQuoteExpanded,
    filters,
    searchQuery,
    hasActiveFilters,
    handleFilterChange,
    handleResetFilters,
    activeTab,
    setActiveTab,
    debouncedQuery,
    setDebouncedQuery,
    isSearchLoading,
    isDiscoverLoading,
    searchResults,
    discoverData,
    handleAdd,
    isFilterModalOpen,
    setIsFilterModalOpen,
    myLists,
    handleToggleTrack,
    handleGenreClick,
    handlePlatformClick,
  };
};
