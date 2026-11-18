import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type {
  TVSeries,
  MediaList,
  TMDBPaginatedSearch,
  TMDBSeriesSearchResult,
} from '@/types/trackers';
import {
  DEFAULT_SERIES_FILTERS,
  hasActiveSeriesFilters,
  useMediaFilterOptions,
  type MediaFilterState,
} from '@/hooks/trackers/useMediaFilterOptions';
import { useFilteredTVSeries } from '@/hooks/trackers/useFilteredTVSeries';
import { useAuth } from '@/context/AuthContext';
import { getPlatformMultiDisplayLabel } from '@/utils/platformFilterUtils';
import {
  formatGenreFilterSummary,
  formatMultiSelectSummary,
  isGenreFilterActive,
} from '@/utils/trackerFilterUtils';
import { useBackHandler } from '@/utils/backButtonManager';
import { formatPeopleFilterSummary } from '@/utils/trackerPeopleUtils';
import { MobileTVSeriesSearchResults } from './MobileTVSeriesSearchResults';
import { MobileTVSeriesFilterOptions } from './MobileTVSeriesFilterOptions';
import { filterSeriesListForSearchModal } from '../shared/mobileSearchListUtils';
import { MobileTrackerSearchHeader } from '../shared/MobileTrackerSearchHeader';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

export interface MobileTVSeriesSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MediaFilterState;
  onFilterChange: (newFilters: MediaFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  series: TVSeries[];
  myLists?: MediaList[];
  debouncedQuery: string;
  setDebouncedQuery: (q: string) => void;
  searchResults?: TMDBPaginatedSearch | null;
  discoverData?: TMDBPaginatedSearch | null;
  isSearchLoading: boolean;
  isDiscoverLoading: boolean;
  onCardClick: (mockSeries: Partial<TVSeries>) => void;
  onAddClick: (tmdbId: number, e: React.MouseEvent) => void;
  onToggleTrack?: (tmdbId: number, isTracked: boolean, e: React.MouseEvent) => void;
  hasMoreResults?: boolean;
  isFetchingMore?: boolean;
  onFetchMore?: () => void;
}

export const MobileTVSeriesSearchModal: React.FC<MobileTVSeriesSearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  series,
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
  const [draftFilters, setDraftFilters] = useState<MediaFilterState>(filters);
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  const shouldAutoFocusRef = useRef(false);

  // All'apertura del modale (passaggio da chiuso ad aperto)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setDraftFilters(filters);
      if (!filters.globalSearch) {
        onFilterChange({ ...filters, globalSearch: true });
      }

      const hasInitialCategory =
        Boolean(debouncedQuery) ||
        Boolean(filters.people?.trim()) ||
        isGenreFilterActive(filters.genres) ||
        (filters.networks?.length ?? 0) > 0 ||
        (filters.tmdbStatuses?.length ?? 0) > 0 ||
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
    availableNetworks,
    ratingOptions,
    tmdbStatusOptions,
    sortOptions,
    handleFieldChange,
    toggleRating,
  } = useMediaFilterOptions({
    series,
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
      ...DEFAULT_SERIES_FILTERS,
      globalSearch: true,
    });
    setViewMode('filters');
    inputRef.current?.focus();
  };

  const hasListFilter = (filters.listIds?.length ?? 0) > 0;
  const hasRatingFilter = (filters.ratings?.length ?? 0) > 0;
  const isLocalResultsMode = hasListFilter || hasRatingFilter;

  const listSeriesResults = useMemo(
    () =>
      filterSeriesListForSearchModal({
        isOpen,
        filters,
        myLists,
        series,
        debouncedQuery,
      }),
    [filters, myLists, series, debouncedQuery, isOpen]
  );

  const effectiveLocalFilters = useMemo<MediaFilterState>(
    () => ({
      ...filters,
      keyword: filters.keyword || debouncedQuery,
    }),
    [filters, debouncedQuery]
  );

  const localFilteredSeries = useFilteredTVSeries(
    series,
    effectiveLocalFilters,
    'all',
    myLists
  );

  const localSeriesAsSearchResults = useMemo<TMDBSeriesSearchResult[]>(
    () =>
      localFilteredSeries.map((s) => ({
        id: s.tmdb_id,
        name: s.title,
        original_name: s.original_title || null,
        overview: s.overview || null,
        poster_path: s.poster_path || null,
        backdrop_path: s.backdrop_path || null,
        first_air_date: s.first_air_date || null,
      })),
    [localFilteredSeries]
  );

  const isSearching = isLocalResultsMode
    ? false
    : debouncedQuery.trim()
    ? isSearchLoading
    : isDiscoverLoading;

  const results = hasListFilter
    ? listSeriesResults ?? []
    : hasRatingFilter
    ? localSeriesAsSearchResults
    : debouncedQuery.trim()
    ? searchResults?.results
    : discoverData?.results;

  const hasActiveDraftFilters = useMemo(
    () => hasActiveSeriesFilters(draftFilters, { ignoreGlobalSearch: true }),
    [draftFilters]
  );

  const currentFilterSource = viewMode === 'filters' ? draftFilters : filters;
  const userProviders = user?.streaming_providers ?? [];
  const activeFilterLabel = useMemo(() => {
    if (currentFilterSource.people?.trim()) {
      const ppl = formatPeopleFilterSummary(
        currentFilterSource.people,
        currentFilterSource.peopleMode
      );
      if (ppl) return `Persone: ${ppl}`;
    }
    if (isGenreFilterActive(currentFilterSource.genres)) {
      const label = formatGenreFilterSummary(
        currentFilterSource.genres,
        availableGenres,
        'Tutti i generi'
      );
      return `Genere: ${label}`;
    }
    if (currentFilterSource.networks && currentFilterSource.networks.length > 0) {
      const myLabel = getPlatformMultiDisplayLabel(
        currentFilterSource.networks,
        userProviders
      );
      if (myLabel) return `Piattaforme: ${myLabel}`;
      const label = formatMultiSelectSummary(
        currentFilterSource.networks,
        availableNetworks,
        'Tutte le piattaforme'
      );
      return `Piattaforme: ${label}`;
    }
    return null;
  }, [
    currentFilterSource.people,
    currentFilterSource.peopleMode,
    currentFilterSource.genres,
    currentFilterSource.networks,
    availableGenres,
    availableNetworks,
    userProviders,
  ]);

  const emptyMessage = hasListFilter
    ? 'Nessuna serie trovata nelle liste selezionate con questi criteri.'
    : hasRatingFilter
    ? 'Nessuna serie trovata nella libreria con questo voto e criteri.'
    : 'Nessuna serie trovata su TMDB con questi criteri.';

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
        backTitle="Torna alla libreria"
        autoFocus={viewMode === 'filters'}
      />

      {/* 2. CORPO: RISULTATI OPPURE FILTRI */}
      <div className="flex-1 min-h-0 flex flex-col max-w-lg mx-auto w-full overflow-hidden">
        {viewMode === 'results' ? (
          <div
            onScroll={handleScroll}
            className={`flex-1 min-h-0 overflow-y-auto p-3 ${scrollbarClass}`}
          >
            <MobileTVSeriesSearchResults
              isSearching={isSearching}
              results={results}
              series={series}
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
          <MobileTVSeriesFilterOptions
            filters={draftFilters}
            hasActiveFilters={hasActiveDraftFilters}
            myLists={myLists}
            availableGenres={availableGenres}
            availableNetworks={availableNetworks}
            ratingOptions={ratingOptions}
            tmdbStatusOptions={tmdbStatusOptions}
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

export default MobileTVSeriesSearchModal;
