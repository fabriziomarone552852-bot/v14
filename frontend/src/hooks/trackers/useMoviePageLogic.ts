import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { userGoalsApi } from '@/api/userGoalsApi';
import { useConfirm } from '@/context/ConfirmContext';
import {
  useMyMovies,
  useMovieDashboardStats,
  useMovieQuotes,
  useInfiniteSearchTMDBMovies,
  useInfiniteDiscoverTMDBMovies,
} from '@/hooks/queries/useMovieQueries';
import { useMediaLists } from '@/hooks/queries/useTrackersQueries';
import { useMovieMutations } from '@/hooks/mutations/useMovieMutations';
import type {
  MovieDetailTarget,
  MovieFilters,
  TMDBPaginatedMovieSearch,
} from '@/types/movies';
import { extractMovieTmdbId } from '@/types/movies';
import { useFilteredMovies } from './useFilteredMovies';
import { useMovieUrlParams, type MovieDetailTabType } from './useMovieUrlParams';

export const useMoviePageLogic = () => {
  const { confirm } = useConfirm();
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
  const { data: statsData } = useMovieDashboardStats();
  const { data: myQuotes } = useMovieQuotes();
  const { data: myLists } = useMediaLists();

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
  const [filters, setFilters] = useState<MovieFilters>({
    keyword: '',
    genre: 'all',
    platform: 'all',
    year: 'all',
    saga: 'all',
    ratings: [],
    sortBy: 'date_added_desc',
    listId: null,
    obtainedFilter: 'all',
    globalSearch: false,
  });

  const searchQuery = filters.keyword;

  const handleFilterChange = (newFilters: MovieFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      genre: 'all',
      platform: 'all',
      year: 'all',
      saga: 'all',
      ratings: [],
      sortBy: 'date_added_desc',
      listId: null,
      obtainedFilter: 'all',
      globalSearch: false,
    });
  };

  const hasActiveFilters =
    filters.keyword !== '' ||
    filters.genre !== 'all' ||
    filters.platform !== 'all' ||
    filters.year !== 'all' ||
    filters.saga !== 'all' ||
    (filters.ratings || []).length > 0 ||
    filters.listId !== null ||
    (filters.obtainedFilter && filters.obtainedFilter !== 'all') ||
    filters.sortBy !== 'date_added_desc' ||
    Boolean(filters.globalSearch);

  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [isRandomModalOpen, setRandomModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchInfinite = useInfiniteSearchTMDBMovies(debouncedQuery, !!debouncedQuery.trim());
  const discoverInfinite = useInfiniteDiscoverTMDBMovies(
    {
      genre: filters.genre,
      platform: filters.platform,
      year: filters.year,
      sortBy: filters.sortBy,
    },
    Boolean(filters.globalSearch)
  );

  const isSearchLoading = searchInfinite.isLoading;
  const isDiscoverLoading = discoverInfinite.isLoading;

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

  const isSearching = Boolean(debouncedQuery.trim());
  const hasMoreResults = isSearching
    ? Boolean(searchInfinite.hasNextPage)
    : Boolean(discoverInfinite.hasNextPage);
  const isFetchingMore = isSearching
    ? searchInfinite.isFetchingNextPage
    : discoverInfinite.isFetchingNextPage;

  const fetchMoreResults = useCallback(() => {
    if (isSearching) {
      if (searchInfinite.hasNextPage && !searchInfinite.isFetchingNextPage) {
        searchInfinite.fetchNextPage();
      }
    } else {
      if (discoverInfinite.hasNextPage && !discoverInfinite.isFetchingNextPage) {
        discoverInfinite.fetchNextPage();
      }
    }
  }, [isSearching, searchInfinite, discoverInfinite]);


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
              original_title: 'original_title' in detailModalMovie ? detailModalMovie.original_title : undefined,
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
    setFilters((prev) => ({ ...prev, genre }));
    setDetailModalOpen(false);
  };

  const handlePlatformClick = (platform: string) => {
    setFilters((prev) => ({ ...prev, platform }));
    setDetailModalOpen(false);
  };

  const handleSagaClick = (saga: string) => {
    setFilters((prev) => ({ ...prev, saga }));
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
    detailModalTab,
    setDetailModalTab,
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
