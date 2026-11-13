// src/mobile/components/trackers/movies/MobileMovieSearchModal.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type {
  Movie,
  MovieFilters,
  TMDBPaginatedMovieSearch,
  TMDBMovieSearchResult,
  MovieDetailTarget,
} from '@/types/movies';
import type { MediaList } from '@/types/trackers';
import {
  DEFAULT_MOVIE_FILTERS,
  hasActiveMovieFilters,
  useMovieFilterOptions,
} from '@/hooks/trackers/useMovieFilterOptions';
import { useFilteredMovies } from '@/hooks/trackers/useFilteredMovies';
import { useAuth } from '@/context/AuthContext';
import { getPlatformMultiDisplayLabel } from '@/utils/platformFilterUtils';
import {
  formatGenreFilterSummary,
  formatMultiSelectSummary,
  isGenreFilterActive,
} from '@/utils/trackerFilterUtils';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileMovieSearchResults } from './MobileMovieSearchResults';
import { MobileMovieFilterOptions } from './MobileMovieFilterOptions';
import { filterMoviesListForSearchModal } from '../shared/mobileSearchListUtils';
import { MobileTrackerSearchHeader } from '../shared/MobileTrackerSearchHeader';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

export interface MobileMovieSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MovieFilters;
  onFilterChange: (newFilters: MovieFilters) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  movies: Movie[];
  myLists?: MediaList[];
  debouncedQuery: string;
  setDebouncedQuery: (q: string) => void;
  searchResults?: TMDBPaginatedMovieSearch | null;
  discoverData?: TMDBPaginatedMovieSearch | null;
  isSearchLoading: boolean;
  isDiscoverLoading: boolean;
  onCardClick: (movie: MovieDetailTarget) => void;
  onAddClick: (tmdbId: number, e: React.MouseEvent) => void;
  onToggleTrack?: (tmdbId: number, isTracked: boolean, e: React.MouseEvent) => void;
  hasMoreResults?: boolean;
  isFetchingMore?: boolean;
  onFetchMore?: () => void;
}

export const MobileMovieSearchModal: React.FC<MobileMovieSearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  movies,
  myLists,
  debouncedQuery,
  setDebouncedQuery,
  searchResults,
  discoverData,
  isSearchLoading,
  isDiscoverLoading,
  onCardClick,
  onAddClick,
  onToggleTrack,
  hasMoreResults = false,
  isFetchingMore = false,
  onFetchMore,
}) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsOpenRef = useRef(false);
  const [viewMode, setViewMode] = useState<'filters' | 'results'>(
    debouncedQuery ? 'results' : 'filters'
  );
  const [draftFilters, setDraftFilters] = useState<MovieFilters>(filters);
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  const shouldAutoFocusRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setDraftFilters(filters);
      if (!filters.globalSearch) {
        onFilterChange({ ...filters, globalSearch: true });
      }

      const hasInitialCategory =
        Boolean(debouncedQuery) ||
        isGenreFilterActive(filters.genres) ||
        (filters.platforms?.length ?? 0) > 0 ||
        (filters.sagas?.length ?? 0) > 0 ||
        (filters.years?.length ?? 0) > 0 ||
        (filters.listIds?.length ?? 0) > 0 ||
        (filters.ratings?.length ?? 0) > 0;

      if (hasInitialCategory) {
        shouldAutoFocusRef.current = false;
        setViewMode('results');
      } else {
        shouldAutoFocusRef.current = true;
        setViewMode('filters');
      }
    }
    if (!isOpen) {
      shouldAutoFocusRef.current = false;
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, debouncedQuery, filters, onFilterChange]);

  // Effetto dedicato al focus automatico: isolato da cambi di filters così non viene mai annullato
  useEffect(() => {
    if (!isOpen || !shouldAutoFocusRef.current) return undefined;
    const rafId = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const handleBack = () => {
    if (viewMode === 'results') {
      setViewMode('filters');
      return;
    }
    onReset();
    setDebouncedQuery('');
    onClose();
  };

  useBackHandler(
    isOpen,
    () => {
      handleBack();
      return true;
    },
    30
  );

  const {
    availableGenres,
    availablePlatforms,
    availableSagas,
    ratingOptions,
    sortOptions,
    obtainedOptions,
    handleFieldChange,
    toggleRating,
  } = useMovieFilterOptions({
    movies,
    filters: { ...draftFilters, globalSearch: true },
    onFilterChange: (newFilters) => {
      setDraftFilters({ ...newFilters, globalSearch: true });
    },
  });

  const handleExecuteSearch = (queryOverride?: string) => {
    const clean = (
      queryOverride !== undefined ? queryOverride : draftFilters.keyword || ''
    ).trim();
    inputRef.current?.blur();
    setDebouncedQuery(clean);
    onFilterChange({
      ...draftFilters,
      keyword: clean,
      globalSearch: true,
    });
    setViewMode('results');
  };

  const handleKeywordChange = (val: string) => {
    handleFieldChange('keyword', val);
  };

  const handleClearAll = () => {
    onReset();
    setDebouncedQuery('');
    setDraftFilters({
      ...DEFAULT_MOVIE_FILTERS,
      globalSearch: true,
    });
    setViewMode('filters');
    inputRef.current?.focus();
  };

  const hasListFilter = (filters.listIds?.length ?? 0) > 0;
  const hasPersonalLibraryFilter =
    (filters.ratings?.length ?? 0) > 0 ||
    (filters.sagas?.length ?? 0) > 0 ||
    filters.obtainedFilter === 'obtained';
  const isLocalResultsMode = hasListFilter || hasPersonalLibraryFilter;

  const listMovieResults = useMemo(
    () =>
      filterMoviesListForSearchModal({
        isOpen,
        filters,
        myLists,
        movies,
        debouncedQuery,
      }),
    [filters, myLists, movies, debouncedQuery, isOpen]
  );

  const effectiveLocalFilters = useMemo<MovieFilters>(
    () => ({
      ...filters,
      keyword: filters.keyword || debouncedQuery,
    }),
    [filters, debouncedQuery]
  );

  const localFilteredMovies = useFilteredMovies(
    movies,
    effectiveLocalFilters,
    'all',
    myLists
  );

  const localMoviesAsSearchResults = useMemo<TMDBMovieSearchResult[]>(
    () =>
      localFilteredMovies.map((m) => ({
        id: m.tmdb_id,
        title: m.title,
        original_title: m.original_title || null,
        overview: m.overview || null,
        poster_path: m.custom_poster_path || m.poster_path || null,
        backdrop_path: m.backdrop_path || null,
        release_date: m.release_date || m.italy_release_date || null,
        italy_release_date: m.italy_release_date || null,
        vote_average: m.vote_average,
      })),
    [localFilteredMovies]
  );

  const isSearching = isLocalResultsMode
    ? false
    : debouncedQuery.trim()
    ? isSearchLoading
    : isDiscoverLoading;

  const rawTmdbResults = debouncedQuery.trim()
    ? searchResults?.results
    : discoverData?.results;

  const filteredTmdbResults = useMemo(() => {
    if (!rawTmdbResults) return undefined;
    if (filters.obtainedFilter === 'not_obtained') {
      return rawTmdbResults.filter(
        (r) => !movies.some((m) => m.tmdb_id === r.id && Boolean(m.obtained_at))
      );
    }
    return rawTmdbResults;
  }, [rawTmdbResults, filters.obtainedFilter, movies]);

  const results = hasListFilter
    ? listMovieResults ?? []
    : hasPersonalLibraryFilter
    ? localMoviesAsSearchResults
    : filteredTmdbResults;

  const hasActiveDraftFilters = useMemo(
    () => hasActiveMovieFilters(draftFilters, { ignoreGlobalSearch: true }),
    [draftFilters]
  );

  const currentFilterSource = viewMode === 'filters' ? draftFilters : filters;
  const userProviders = user?.streaming_providers ?? [];
  const activeFilterLabel = useMemo(() => {
    if (isGenreFilterActive(currentFilterSource.genres)) {
      const label = formatGenreFilterSummary(
        currentFilterSource.genres,
        availableGenres,
        'Tutti i generi'
      );
      return `Genere: ${label}`;
    }
    if (currentFilterSource.platforms && currentFilterSource.platforms.length > 0) {
      const myLabel = getPlatformMultiDisplayLabel(
        currentFilterSource.platforms,
        userProviders
      );
      if (myLabel) return `Piattaforme: ${myLabel}`;
      const label = formatMultiSelectSummary(
        currentFilterSource.platforms,
        availablePlatforms,
        'Tutte le piattaforme'
      );
      return `Piattaforme: ${label}`;
    }
    return null;
  }, [
    currentFilterSource.genres,
    currentFilterSource.platforms,
    availableGenres,
    availablePlatforms,
    userProviders,
  ]);

  const emptyMessage = hasListFilter
    ? 'Nessun film trovato nelle liste selezionate con questi criteri.'
    : hasPersonalLibraryFilter
    ? 'Nessun film trovato nella libreria con questi criteri.'
    : 'Nessun film trovato su TMDB con questi criteri.';

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9990] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      <MobileTrackerSearchHeader
        inputRef={inputRef}
        keyword={draftFilters.keyword || ''}
        onKeywordChange={handleKeywordChange}
        onInputActivate={() => {
          if (viewMode === 'results') {
            setViewMode('filters');
          }
        }}
        onExecuteSearch={() => handleExecuteSearch()}
        onBack={handleBack}
        onClearAll={handleClearAll}
        placeholder={
          activeFilterLabel ? `${activeFilterLabel}...` : 'Cerca su TMDB e premi Invio...'
        }
        isClearHighlighted={
          hasActiveDraftFilters ||
          hasActiveFilters ||
          Boolean(draftFilters.keyword) ||
          Boolean(debouncedQuery)
        }
        backTitle="Torna indietro"
        autoFocus={viewMode === 'filters'}
      />

      {/* 2. CORPO: RISULTATI OPPURE FILTRI */}
      <div className="flex-1 min-h-0 flex flex-col max-w-lg mx-auto w-full overflow-hidden">
        {viewMode === 'results' ? (
          <div
            onScroll={handleScroll}
            className={`flex-1 min-h-0 overflow-y-auto p-3 ${scrollbarClass}`}
          >
            <MobileMovieSearchResults
              isSearching={isSearching}
              results={results}
              movies={movies}
              onCardClick={onCardClick}
              onAddClick={onAddClick}
              onToggleTrack={onToggleTrack}
              emptyMessage={emptyMessage}
              hasMoreResults={!isLocalResultsMode && hasMoreResults}
              isFetchingMore={!isLocalResultsMode && isFetchingMore}
              onFetchMore={!isLocalResultsMode ? onFetchMore : undefined}
            />
          </div>
        ) : (
          <MobileMovieFilterOptions
            filters={draftFilters}
            hasActiveFilters={hasActiveDraftFilters}
            myLists={myLists}
            availableGenres={availableGenres}
            availablePlatforms={availablePlatforms}
            availableSagas={availableSagas}
            ratingOptions={ratingOptions}
            obtainedOptions={obtainedOptions}
            sortOptions={sortOptions}
            handleFieldChange={handleFieldChange}
            toggleRating={toggleRating}
            onExecuteSearch={() => handleExecuteSearch()}
            isGlobalSearch={true}
          />
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileMovieSearchModal;
