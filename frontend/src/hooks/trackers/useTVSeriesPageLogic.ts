import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { userGoalsApi } from '@/api/userGoalsApi';
import { useConfirm } from '@/context/ConfirmContext';
import { useAuth } from '@/context/AuthContext';
import {
  useMySeries,
  useSeriesStats,
  useMyQuotes,
  useMediaLists,
  useTMDBGenres,
  useTMDBProviders,
  useInfiniteSearchTMDBSeries,
  useInfiniteDiscoverTMDBSeries,
  type TMDBSeriesQueryFilterParams,
} from '@/hooks/queries/useTrackersQueries';
import {
  type TVSeries,
  type TMDBEpisode,
  type TMDBPaginatedSearch,
  type SeriesDetailTarget,
  extractSeriesTmdbId,
} from '@/types/trackers';
import type { TabType } from '@/components/trackers/series/detail';
import {
  DEFAULT_SERIES_FILTERS,
  hasActiveSeriesFilters,
  type MediaFilterState as SeriesFilterState,
} from './useMediaFilterOptions';
import { useFilteredTVSeries } from './useFilteredTVSeries';
import { useSeriesUrlParams } from './useSeriesUrlParams';
import { useAutoSyncSeriesProviders } from './useAutoSyncSeriesProviders';
import { buildTMDBGenreParams, mapSortByToTMDB } from '@/utils/trackerFilterUtils';
import { buildTMDBWatchProvidersParam } from '@/utils/platformFilterUtils';
import { useDebounce } from '@/hooks/useDebounce';
import { parsePeopleTokens } from '@/utils/trackerPeopleUtils';
import { useAutoSyncTrackerCredits } from './useAutoSyncTrackerCredits';

export const useTVSeriesPageLogic = () => {
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const tmdbIdParam = searchParams.get('tmdb_id');
  const openReviewParam = searchParams.get('open_review') === 'true';
  const openEpisodeParam = searchParams.get('open_episode');
  const openSeasonParam = searchParams.get('open_season');
  const openReviewLogIdParam = searchParams.get('open_review_log_id');

  const [detailModalOpen, setDetailModalOpen] = useState(() => Boolean(tmdbIdParam));
  const [detailModalSeries, setDetailModalSeries] = useState<SeriesDetailTarget | null>(() => {
    return tmdbIdParam ? { tmdb_id: Number(tmdbIdParam) } : null;
  });
  const [detailModalTab, setDetailModalTab] = useState<TabType>(() => {
    if (openReviewParam) return 'review';
    if (openEpisodeParam || openSeasonParam !== null) return 'seasons';
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
  const [detailModalSeasonNumber, setDetailModalSeasonNumber] = useState<number | undefined>(() => {
    return openSeasonParam !== null ? Number(openSeasonParam) : undefined;
  });
  const [detailModalReviewLogId, setDetailModalReviewLogId] = useState<number | undefined>(() => {
    return openReviewLogIdParam ? Number(openReviewLogIdParam) : undefined;
  });

  const openSeriesDetail = (
    seriesItem: SeriesDetailTarget,
    tab: TabType = 'overview',
    episode?: TMDBEpisode,
    reviewLogId?: number,
    seasonNumber?: number
  ) => {
    setDetailModalSeries(seriesItem);
    setDetailModalTab(tab);
    setDetailModalEpisode(episode);
    setDetailModalSeasonNumber(seasonNumber);
    setDetailModalReviewLogId(reviewLogId);
    setDetailModalOpen(true);
  };

  const { data: series, isLoading, isError } = useMySeries();
  useAutoSyncSeriesProviders(series);
  useAutoSyncTrackerCredits(
    series,
    '/trackers/series/sync-credits',
    ['trackers', 'series'],
    Boolean(series && series.length > 0)
  );
  const { data: statsData } = useSeriesStats();
  const { data: myQuotes } = useMyQuotes();
  const { data: myLists } = useMediaLists();
  const { data: tmdbGenres = [] } = useTMDBGenres();
  const { data: tmdbProviders = [] } = useTMDBProviders();

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
  }, [series, detailModalOpen, detailModalSeries]);

  const [activeTab, setActiveTab] = useState<'all' | 'watching' | 'watched' | 'to_watch'>('all');
  const [goalViewType, setGoalViewType] = useState<'percent' | 'fraction'>('fraction');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<SeriesFilterState>(DEFAULT_SERIES_FILTERS);

  const searchQuery = filters.keyword;

  const handleFilterChange = (newFilters: SeriesFilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_SERIES_FILTERS);
  };

  const hasActiveFilters = useMemo(() => hasActiveSeriesFilters(filters), [filters]);

  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [isRandomModalOpen, setRandomModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const debouncedPeopleRaw = useDebounce(filters.people || '', 400);
  const normalizedPeopleLive = useMemo(
    () => parsePeopleTokens(filters.people).join(', '),
    [filters.people]
  );
  const normalizedPeopleDebounced = useMemo(
    () => parsePeopleTokens(debouncedPeopleRaw).join(', '),
    [debouncedPeopleRaw]
  );
  const isPeoplePending = normalizedPeopleLive !== normalizedPeopleDebounced;

  const tmdbFilterParams = useMemo<TMDBSeriesQueryFilterParams>(() => {
    const genreParams = buildTMDBGenreParams(filters.genres, tmdbGenres, 'tv');
    const providersParam = buildTMDBWatchProvidersParam(
      filters.networks,
      tmdbProviders,
      user?.streaming_providers ?? []
    );
    const statusParam =
      filters.tmdbStatuses && filters.tmdbStatuses.length > 0
        ? filters.tmdbStatuses.join('|')
        : undefined;
    const yearParam =
      filters.years && filters.years.length > 0
        ? filters.years.join('|')
        : undefined;

    return {
      with_genres: genreParams.with_genres,
      without_genres: genreParams.without_genres,
      with_watch_providers: providersParam,
      with_status: statusParam,
      first_air_date_year: yearParam,
      with_people: normalizedPeopleDebounced || undefined,
      people_mode: normalizedPeopleDebounced ? (filters.peopleMode || 'AND') : undefined,
      sort_by: mapSortByToTMDB(filters.sortBy, 'tv'),
    };
  }, [
    filters.genres,
    filters.networks,
    filters.tmdbStatuses,
    filters.years,
    filters.peopleMode,
    filters.sortBy,
    normalizedPeopleDebounced,
    tmdbGenres,
    tmdbProviders,
    user?.streaming_providers,
  ]);

  const hasListFilter = (filters.listIds?.length ?? 0) > 0;
  const hasPersonalOnlyFilter =
    hasListFilter || (!filters.globalSearch && (filters.ratings?.length ?? 0) > 0);

  const shouldSearchTMDB =
    Boolean(debouncedQuery.trim()) && !hasPersonalOnlyFilter && !isPeoplePending;
  const shouldDiscoverTMDB =
    !shouldSearchTMDB &&
    Boolean(filters.globalSearch) &&
    !hasListFilter &&
    !isPeoplePending;

  const searchInfinite = useInfiniteSearchTMDBSeries(
    debouncedQuery,
    shouldSearchTMDB,
    tmdbFilterParams
  );
  const discoverInfinite = useInfiniteDiscoverTMDBSeries(
    tmdbFilterParams,
    shouldDiscoverTMDB
  );

  const isSearchLoading =
    searchInfinite.isLoading ||
    (Boolean(debouncedQuery.trim()) && !hasPersonalOnlyFilter && isPeoplePending);
  const isDiscoverLoading =
    discoverInfinite.isLoading ||
    (!Boolean(debouncedQuery.trim()) && Boolean(filters.globalSearch) && !hasListFilter && isPeoplePending);

  const searchResults: TMDBPaginatedSearch | null = useMemo(() => {
    if (!searchInfinite.data?.pages?.length) return null;
    const allResults = searchInfinite.data.pages.flatMap((p) => p.results || []);
    const lastPage = searchInfinite.data.pages[searchInfinite.data.pages.length - 1];
    return {
      page: lastPage?.page || 1,
      total_pages: lastPage?.total_pages || 1,
      total_results: lastPage?.total_results || allResults.length,
      results: allResults,
    };
  }, [searchInfinite.data]);

  const discoverData: TMDBPaginatedSearch | null = useMemo(() => {
    if (!discoverInfinite.data?.pages?.length) return null;
    const allResults = discoverInfinite.data.pages.flatMap((p) => p.results || []);
    const lastPage = discoverInfinite.data.pages[discoverInfinite.data.pages.length - 1];
    return {
      page: lastPage?.page || 1,
      total_pages: lastPage?.total_pages || 1,
      total_results: lastPage?.total_results || allResults.length,
      results: allResults,
    };
  }, [discoverInfinite.data]);

  const hasMoreResults = shouldSearchTMDB
    ? Boolean(searchInfinite.hasNextPage)
    : Boolean(discoverInfinite.hasNextPage);
  const isFetchingMore = shouldSearchTMDB
    ? searchInfinite.isFetchingNextPage
    : discoverInfinite.isFetchingNextPage;

  const fetchMoreResults = useCallback(() => {
    if (shouldSearchTMDB) {
      if (searchInfinite.hasNextPage && !searchInfinite.isFetchingNextPage) {
        searchInfinite.fetchNextPage();
      }
    } else if (shouldDiscoverTMDB) {
      if (discoverInfinite.hasNextPage && !discoverInfinite.isFetchingNextPage) {
        discoverInfinite.fetchNextPage();
      }
    }
  }, [shouldSearchTMDB, shouldDiscoverTMDB, searchInfinite, discoverInfinite]);

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
      const data = await api.post<TVSeries, { tmdb_id: number; status: string }>(
        '/trackers/series',
        payload
      );
      return data;
    },
    onMutate: async (payload: { tmdb_id: number; status: string }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'series'] });
      const previousSeries = queryClient.getQueryData<TVSeries[]>(['trackers', 'series']);

      const seriesDetails =
        searchResults?.results?.find((s) => s.id === payload.tmdb_id) ||
        discoverData?.results?.find((s) => s.id === payload.tmdb_id);

      if (seriesDetails) {
        queryClient.setQueryData<TVSeries[]>(['trackers', 'series'], (old) => {
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
    setFilters((prev) => ({
      ...prev,
      genres: { include: [genre], exclude: [], mode: 'OR' },
    }));
    setDetailModalOpen(false);
  };

  const handlePlatformClick = (platform: string) => {
    setFilters((prev) => ({
      ...prev,
      networks: [platform],
    }));
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
    detailModalSeasonNumber,
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
    hasMoreResults,
    isFetchingMore,
    fetchMoreResults,
  };
};
