import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { userGoalsApi } from '@/api/userGoalsApi';
import { useConfirm } from '@/context/ConfirmContext';
import { useAuth } from '@/context/AuthContext';
import {
  useMyMovies,
  useMovieDashboardStats,
  useMovieQuotes,
  useTMDBMovieGenres,
  useTMDBMovieProviders,
  useInfiniteSearchTMDBMovies,
  useInfiniteDiscoverTMDBMovies,
  type TMDBMovieQueryFilterParams,
} from '@/hooks/queries/useMovieQueries';
import { useMediaLists } from '@/hooks/queries/useTrackersQueries';
import { useMovieMutations } from '@/hooks/mutations/useMovieMutations';
import type {
  MovieDetailTarget,
  MovieFilters,
  TMDBPaginatedMovieSearch,
} from '@/types/movies';
import { extractMovieTmdbId } from '@/types/movies';
import {
  DEFAULT_MOVIE_FILTERS,
  hasActiveMovieFilters,
} from './useMovieFilterOptions';
import { useFilteredMovies } from './useFilteredMovies';
import { useMovieUrlParams, type MovieDetailTabType } from './useMovieUrlParams';
import { buildTMDBGenreParams, mapSortByToTMDB } from '@/utils/trackerFilterUtils';
import { buildTMDBWatchProvidersParam } from '@/utils/platformFilterUtils';
import { useDebounce } from '@/hooks/useDebounce';
import { parsePeopleTokens } from '@/utils/trackerPeopleUtils';
import { useAutoSyncTrackerCredits } from './useAutoSyncTrackerCredits';

export const useMoviePageLogic = () => {
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const tmdbIdParam = searchParams.get('tmdb_id');
  const openReviewParam = searchParams.get('open_review') === 'true';
  const openReviewLogIdParam = searchParams.get('open_review_log_id');

  const [detailModalOpen, setDetailModalOpen] = useState(() => Boolean(tmdbIdParam));
  const [detailModalMovie, setDetailModalMovie] = useState<MovieDetailTarget | null>(() => {
    return tmdbIdParam ? ({ tmdb_id: Number(tmdbIdParam) } as MovieDetailTarget) : null;
  });
  const [detailModalTab, setDetailModalTab] = useState<MovieDetailTabType>(() => {
    if (openReviewParam) return 'review';
    return 'overview';
  });
  const [detailModalReviewLogId, setDetailModalReviewLogId] = useState<number | undefined>(() => {
    return openReviewLogIdParam ? Number(openReviewLogIdParam) : undefined;
  });

  const openMovieDetail = (
    movieItem: MovieDetailTarget,
    tab: MovieDetailTabType = 'overview',
    reviewLogId?: number
  ) => {
    setDetailModalMovie(movieItem);
    setDetailModalTab(tab);
    setDetailModalReviewLogId(reviewLogId);
    setDetailModalOpen(true);
  };

  const { data: movies, isLoading, isError } = useMyMovies();
  useAutoSyncTrackerCredits(
    movies,
    '/trackers/movies/sync-credits',
    ['trackers', 'movies'],
    Boolean(movies && movies.length > 0)
  );
  const { data: statsData } = useMovieDashboardStats();
  const { data: myQuotes } = useMovieQuotes();
  const { data: myLists } = useMediaLists();
  const { data: tmdbGenres = [] } = useTMDBMovieGenres();
  const { data: tmdbProviders = [] } = useTMDBMovieProviders();

  useMovieUrlParams(movies, detailModalOpen, openMovieDetail);

  useEffect(() => {
    if (detailModalOpen && detailModalMovie && movies) {
      const currentTmdbId = extractMovieTmdbId(detailModalMovie);
      const updatedMovie = movies.find((m) => m.tmdb_id === currentTmdbId);
      if (updatedMovie) {
        if (JSON.stringify(updatedMovie) !== JSON.stringify(detailModalMovie)) {
          setDetailModalMovie(updatedMovie);
        }
      }
    }
  }, [movies, detailModalOpen, detailModalMovie]);

  const [activeTab, setActiveTab] = useState<'all' | 'to_watch' | 'watched'>('all');
  const [goalViewType, setGoalViewType] = useState<'percent' | 'fraction'>('fraction');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<MovieFilters>(DEFAULT_MOVIE_FILTERS);

  const searchQuery = filters.keyword;

  const handleFilterChange = (newFilters: MovieFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_MOVIE_FILTERS);
  };

  const hasActiveFilters = useMemo(() => hasActiveMovieFilters(filters), [filters]);

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

  const tmdbFilterParams = useMemo<TMDBMovieQueryFilterParams>(() => {
    const genreParams = buildTMDBGenreParams(filters.genres, tmdbGenres, 'movie');
    const providersParam = buildTMDBWatchProvidersParam(
      filters.platforms,
      tmdbProviders,
      user?.streaming_providers ?? []
    );
    const yearParam =
      filters.years && filters.years.length > 0
        ? filters.years.join('|')
        : undefined;

    return {
      with_genres: genreParams.with_genres,
      without_genres: genreParams.without_genres,
      with_watch_providers: providersParam,
      primary_release_year: yearParam,
      with_people: normalizedPeopleDebounced || undefined,
      people_mode: normalizedPeopleDebounced ? (filters.peopleMode || 'AND') : undefined,
      sort_by: mapSortByToTMDB(filters.sortBy, 'movie'),
    };
  }, [
    filters.genres,
    filters.platforms,
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
    hasListFilter ||
    (!filters.globalSearch &&
      ((filters.ratings?.length ?? 0) > 0 ||
        (filters.sagas?.length ?? 0) > 0 ||
        (Boolean(filters.obtainedFilter) && filters.obtainedFilter !== 'all')));

  const shouldSearchTMDB =
    Boolean(debouncedQuery.trim()) && !hasPersonalOnlyFilter && !isPeoplePending;
  const shouldDiscoverTMDB =
    !shouldSearchTMDB &&
    Boolean(filters.globalSearch) &&
    !hasListFilter &&
    !isPeoplePending;

  const searchInfinite = useInfiniteSearchTMDBMovies(
    debouncedQuery,
    shouldSearchTMDB,
    tmdbFilterParams
  );
  const discoverInfinite = useInfiniteDiscoverTMDBMovies(
    tmdbFilterParams,
    shouldDiscoverTMDB
  );

  const isSearchLoading =
    searchInfinite.isLoading ||
    (Boolean(debouncedQuery.trim()) && !hasPersonalOnlyFilter && isPeoplePending);
  const isDiscoverLoading =
    discoverInfinite.isLoading ||
    (!Boolean(debouncedQuery.trim()) && Boolean(filters.globalSearch) && !hasListFilter && isPeoplePending);

  const searchResults: TMDBPaginatedMovieSearch | null = useMemo(() => {
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

  const discoverData: TMDBPaginatedMovieSearch | null = useMemo(() => {
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

  const { addMovieMutation, deleteMovieMutation } = useMovieMutations();

  const handleAdd = (tmdbId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const movieDetails =
      searchResults?.results?.find((m) => m.id === tmdbId) ||
      discoverData?.results?.find((m) => m.id === tmdbId);

    addMovieMutation.mutate({
      tmdb_id: tmdbId,
      status: 'to_watch',
      movieDetails: movieDetails
        ? {
            title: movieDetails.title,
            original_title: movieDetails.original_title,
            overview: movieDetails.overview,
            poster_path: movieDetails.poster_path,
            backdrop_path: movieDetails.backdrop_path,
            release_date: movieDetails.release_date,
            vote_average: movieDetails.vote_average,
          }
        : undefined,
    });
  };

  const currentYear = new Date().getFullYear();
  const { data: goalData } = useQuery({
    queryKey: ['yearlyGoal', 'movies', currentYear],
    queryFn: () => userGoalsApi.getYearlyGoal('movies', currentYear),
  });

  const displayMovies = useFilteredMovies(movies, filters, activeTab, myLists);

  const goal = goalData?.goal_value || 50;
  const currentMovies = statsData?.movies_watched_this_year || 0;
  const goalPercent = Math.min(100, Math.round((currentMovies / goal) * 100));

  const handleToggleTrack = (tmdbId: number, isTracked: boolean) => {
    if (!isTracked) {
      const modalTmdbId = detailModalMovie ? extractMovieTmdbId(detailModalMovie) : undefined;
      const movieDetails =
        searchResults?.results?.find((m) => m.id === tmdbId) ||
        discoverData?.results?.find((m) => m.id === tmdbId) ||
        (detailModalMovie && modalTmdbId === tmdbId
          ? {
              title: detailModalMovie.title,
              original_title:
                'original_title' in detailModalMovie ? detailModalMovie.original_title : undefined,
              overview: 'overview' in detailModalMovie ? detailModalMovie.overview : undefined,
              poster_path: detailModalMovie.poster_path,
              backdrop_path: detailModalMovie.backdrop_path,
              release_date: detailModalMovie.release_date,
              vote_average: detailModalMovie.vote_average,
            }
          : undefined);

      addMovieMutation.mutate({
        tmdb_id: tmdbId,
        status: 'to_watch',
        movieDetails: movieDetails
          ? {
              title: movieDetails.title,
              original_title: movieDetails.original_title,
              overview: movieDetails.overview,
              poster_path: movieDetails.poster_path,
              backdrop_path: movieDetails.backdrop_path,
              release_date: movieDetails.release_date,
              vote_average: movieDetails.vote_average,
            }
          : undefined,
      });
    } else {
      confirm({
        title: 'Rimuovi film',
        message: 'Sei sicuro di voler rimuovere questo film dalla tua libreria?',
        confirmText: 'Rimuovi',
        cancelText: 'Annulla',
        isDestructive: true,
        onConfirm: () => {
          deleteMovieMutation.mutate(tmdbId);
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
      platforms: [platform],
    }));
    setDetailModalOpen(false);
  };

  const handleSagaClick = (saga: string) => {
    setFilters((prev) => ({
      ...prev,
      sagas: [saga],
    }));
    setDetailModalOpen(false);
  };

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
  };

  return {
    movies,
    isLoading,
    isError,
    handleRetry,
    goalPercent,
    goalViewType,
    setGoalViewType,
    currentMovies,
    goal,
    setStatsModalOpen,
    statsModalOpen,
    setRandomModalOpen,
    isRandomModalOpen,
    openMovieDetail,
    detailModalOpen,
    setDetailModalOpen,
    detailModalMovie,
    setDetailModalMovie,
    setDetailModalTab,
    detailModalTab,
    detailModalReviewLogId,
    displayMovies,
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
    handleSagaClick,
    hasMoreResults,
    isFetchingMore,
    fetchMoreResults,
  };
};
