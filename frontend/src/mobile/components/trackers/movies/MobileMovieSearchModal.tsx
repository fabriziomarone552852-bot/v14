// src/mobile/components/trackers/movies/MobileMovieSearchModal.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw } from 'lucide-react';
import type { Movie, MovieFilters, TMDBMovieSearchResult, TMDBPaginatedMovieSearch, MovieDetailTarget } from '@/types/movies';
import type { MediaList } from '@/types/trackers';
import { SearchIcon, CloseIcon, BackIcon } from '@/components/shared/utils/Icons';
import { useMovieFilterOptions } from '@/hooks/trackers/useMovieFilterOptions';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileMovieSearchResults } from './MobileMovieSearchResults';
import { MobileMovieFilterOptions } from './MobileMovieFilterOptions';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsOpenRef = useRef(false);
  const [viewMode, setViewMode] = useState<'filters' | 'results'>(debouncedQuery ? 'results' : 'filters');
  const [draftFilters, setDraftFilters] = useState<MovieFilters>(filters);
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isOpen && !prevIsOpenRef.current) {
      setDraftFilters(filters);
      if (!filters.globalSearch) {
        onFilterChange({ ...filters, globalSearch: true });
      }

      const hasInitialCategory =
        Boolean(debouncedQuery) ||
        (filters.genre && filters.genre !== 'all') ||
        (filters.platform && filters.platform !== 'all');

      if (hasInitialCategory) {
        setViewMode('results');
      } else {
        setViewMode('filters');
        timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }
    }
    prevIsOpenRef.current = isOpen;

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOpen, debouncedQuery, filters, onFilterChange]);

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
    isDatePickerOpen,
    setIsDatePickerOpen,
    handleFieldChange,
    toggleRating,
    handleYearChange,
  } = useMovieFilterOptions({
    movies,
    filters: { ...draftFilters, globalSearch: true },
    onFilterChange: (newFilters) => {
      setDraftFilters({ ...newFilters, globalSearch: true });
    },
  });

  const handleExecuteSearch = (queryOverride?: string) => {
    const clean = (queryOverride !== undefined ? queryOverride : (draftFilters.keyword || '')).trim();
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
      keyword: '',
      genre: 'all',
      platform: 'all',
      year: 'all',
      saga: 'all',
      ratings: [],
      sortBy: 'date_added_desc',
      listId: null,
      obtainedFilter: 'all',
      globalSearch: true,
    });
    setViewMode('filters');
    inputRef.current?.focus();
  };

  // Se è selezionata una lista personale, estraiamo i film di quella lista
  const listMovieResults = useMemo(() => {
    if (!isOpen || filters.listId === null || !myLists) return null;
    const targetList = myLists.find((l) => l.id === filters.listId);
    if (!targetList || !targetList.items) return [];

    let items = targetList.items
      .filter((i) => i.media_type === 'movie' || Boolean(i.movie_tmdb_id))
      .map((item) => {
        const existing = movies?.find((m) => m.tmdb_id === item.movie_tmdb_id);
        const title = existing?.title || item.movie?.title || 'Film';
        const posterPath = existing?.custom_poster_path || existing?.poster_path || item.movie?.poster_path || null;
        const backdropPath = existing?.backdrop_path || null;
        const releaseDate = existing?.release_date || existing?.italy_release_date || null;
        const overview = existing?.overview || null;
        const tmdbId = item.movie_tmdb_id || existing?.tmdb_id || 0;

        const result: TMDBMovieSearchResult = {
          id: tmdbId,
          title,
          original_title: existing?.original_title || null,
          overview,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          release_date: releaseDate,
        };
        return { result, existing, item };
      });

    const query = (filters.keyword || debouncedQuery || '').trim().toLowerCase();
    if (query) {
      items = items.filter(({ result }) =>
        result.title.toLowerCase().includes(query)
      );
    }

    if (filters.genre && filters.genre !== 'all') {
      items = items.filter(({ existing }) =>
        existing?.genres ? existing.genres.toLowerCase().includes(filters.genre.toLowerCase()) : false
      );
    }

    if (filters.year && filters.year !== 'all') {
      items = items.filter(({ result }) =>
        result.release_date ? result.release_date.startsWith(filters.year) : false
      );
    }

    return items.map((i) => i.result);
  }, [filters, myLists, movies, debouncedQuery, isOpen]);

  const isSearching =
    filters.listId !== null
      ? false
      : debouncedQuery
      ? isSearchLoading
      : isDiscoverLoading;

  const results =
    filters.listId !== null
      ? (listMovieResults ?? [])
      : debouncedQuery
      ? searchResults?.results
      : discoverData?.results;

  const hasActiveDraftFilters = useMemo(() => {
    return (
      Boolean(draftFilters.keyword?.trim()) ||
      draftFilters.genre !== 'all' ||
      draftFilters.platform !== 'all' ||
      draftFilters.saga !== 'all' ||
      (draftFilters.ratings && draftFilters.ratings.length > 0) ||
      draftFilters.year !== 'all' ||
      draftFilters.sortBy !== 'date_added_desc' ||
      draftFilters.listId !== null
    );
  }, [draftFilters]);

  const currentFilterSource = viewMode === 'filters' ? draftFilters : filters;
  const activeFilterLabel = useMemo(() => {
    if (currentFilterSource.genre && currentFilterSource.genre !== 'all') {
      const g = availableGenres.find((x) => x.value === currentFilterSource.genre);
      return g ? `Genere: ${g.label}` : 'Filtro Genere';
    }
    if (currentFilterSource.platform && currentFilterSource.platform !== 'all') {
      const p = availablePlatforms.find((x) => x.value === currentFilterSource.platform);
      return p ? `Piattaforma: ${p.label}` : 'Filtro Piattaforma';
    }
    return null;
  }, [currentFilterSource.genre, currentFilterSource.platform, availableGenres, availablePlatforms]);

  const emptyMessage =
    filters.listId !== null
      ? 'Nessun film trovato in questa lista con questi criteri.'
      : 'Nessun film trovato su TMDB con questi criteri.';

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9990] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER SUPERIORE: FRECCIA INDIETRO + BARRA DI RICERCA + X AZZERA */}
      <div className="border-b border-gray-200 bg-white shrink-0 pt-[env(safe-area-inset-top,0px)] shadow-2xs z-20">
        <div className="px-3 h-14 flex items-center gap-2 max-w-lg mx-auto relative">
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center"
            title="Torna indietro"
            aria-label="Torna indietro"
          >
            <BackIcon className="w-5 h-5 text-gray-800" />
          </button>

          <div className="relative flex-1 flex items-center min-w-0">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={draftFilters.keyword || ''}
              onChange={(e) => handleKeywordChange(e.target.value)}
              onClick={() => {
                if (viewMode === 'results') {
                  setViewMode('filters');
                }
              }}
              onFocus={() => {
                if (viewMode === 'results') {
                  setViewMode('filters');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleExecuteSearch();
                }
              }}
              placeholder={activeFilterLabel ? `${activeFilterLabel}...` : 'Cerca su TMDB e premi Invio...'}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-2xs"
            />
            {draftFilters.keyword && (
              <button
                type="button"
                onClick={() => handleKeywordChange('')}
                className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 active:scale-90 transition-all cursor-pointer"
                title="Cancella testo"
                aria-label="Cancella testo"
              >
                <CloseIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className={`w-9 h-9 rounded-xl border active:scale-90 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs ${
              hasActiveDraftFilters || hasActiveFilters || Boolean(draftFilters.keyword) || Boolean(debouncedQuery)
                ? 'border-red-200/80 bg-red-50/60 text-red-500 hover:text-red-700 hover:bg-red-50'
                : 'border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title="Ripristina tutta la ricerca"
            aria-label="Ripristina ricerca"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>

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
              hasMoreResults={hasMoreResults}
              isFetchingMore={isFetchingMore}
              onFetchMore={onFetchMore}
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
            isDatePickerOpen={isDatePickerOpen}
            setIsDatePickerOpen={setIsDatePickerOpen}
            handleFieldChange={handleFieldChange}
            toggleRating={toggleRating}
            handleYearChange={handleYearChange}
            onExecuteSearch={() => handleExecuteSearch()}
          />
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileMovieSearchModal;
