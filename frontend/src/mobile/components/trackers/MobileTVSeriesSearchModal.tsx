import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw } from 'lucide-react';
import type { TVSeries, MediaList, TMDBPaginatedSearch, TMDBSeriesSearchResult } from '@/types/trackers';
import { SearchIcon, CloseIcon, BackIcon } from '@/components/shared/utils/Icons';
import { useMediaFilterOptions, type MediaFilterState } from '@/hooks/trackers/useMediaFilterOptions';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileTVSeriesSearchResults } from './MobileTVSeriesSearchResults';
import { MobileTVSeriesFilterOptions } from './MobileTVSeriesFilterOptions';
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
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsOpenRef = useRef(false);
  const [viewMode, setViewMode] = useState<'filters' | 'results'>(debouncedQuery ? 'results' : 'filters');
  const [draftFilters, setDraftFilters] = useState<MediaFilterState>(filters);
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  // All'apertura del modale (passaggio da chiuso ad aperto)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isOpen && !prevIsOpenRef.current) {
      setDraftFilters(filters);
      if (!filters.globalSearch) {
        onFilterChange({ ...filters, globalSearch: true });
      }

      // Se aperto da link esterno con categoria esplicita o query già presente, mostra i risultati
      const hasInitialCategory =
        Boolean(debouncedQuery) ||
        (filters.genre && filters.genre !== 'all') ||
        (filters.network && filters.network !== 'all');

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

  // Gestione tasto Back (freccia UI e pulsante hardware Android)
  const handleBack = () => {
    if (viewMode === 'results') {
      setViewMode('filters');
      return;
    }
    // Chiudi ricerca e torna alla libreria normale
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

  // Opzioni e mutazioni locali agganciate a draftFilters
  const {
    availableGenres,
    availableNetworks,
    ratingOptions,
    tmdbStatusOptions,
    sortOptions,
    isDatePickerOpen,
    setIsDatePickerOpen,
    handleFieldChange,
    toggleRating,
    handleYearChange,
  } = useMediaFilterOptions({
    series,
    filters: { ...draftFilters, globalSearch: true },
    onFilterChange: (newFilters) => {
      setDraftFilters({ ...newFilters, globalSearch: true });
    },
  });

  // Esecuzione ricerca: avviene SOLO premendo Invio oppure cliccando "Cerca su TMDB"
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

  // Azzeramento completo della ricerca e ritorno ai filtri puliti
  const handleClearAll = () => {
    onReset();
    setDebouncedQuery('');
    setDraftFilters({
      keyword: '',
      genre: 'all',
      network: 'all',
      ratings: [],
      tmdbStatus: 'all',
      year: 'all',
      sortBy: 'date_added_desc',
      listId: null,
      globalSearch: true,
    });
    setViewMode('filters');
    inputRef.current?.focus();
  };

  // Quando è selezionata una lista personale, estraiamo e filtriamo le serie di quella lista
  const listSeriesResults = useMemo(() => {
    if (!isOpen || filters.listId === null || !myLists) return null;
    const targetList = myLists.find((l) => l.id === filters.listId);
    if (!targetList || !targetList.items) return [];

    let items = targetList.items.map((item) => {
      const existing = series?.find((s) => s.tmdb_id === item.series_tmdb_id);
      const title = existing?.title || item.series?.title || 'Serie';
      const posterPath = existing?.poster_path || item.series?.poster_path || null;
      const backdropPath = existing?.backdrop_path || null;
      const firstAirDate = existing?.first_air_date || item.series?.first_air_date || null;
      const overview = existing?.overview || null;
      const tmdbId = item.series_tmdb_id || existing?.tmdb_id || 0;

      const result: TMDBSeriesSearchResult = {
        id: tmdbId,
        name: title,
        original_name: existing?.original_title || null,
        overview: overview,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        first_air_date: firstAirDate,
      };
      return { result, existing, item };
    });

    // Filtro testuale (se digitato)
    const query = (filters.keyword || debouncedQuery || '').trim().toLowerCase();
    if (query) {
      items = items.filter(({ result }) =>
        result.name.toLowerCase().includes(query)
      );
    }

    // Filtro genere
    if (filters.genre && filters.genre !== 'all') {
      items = items.filter(({ existing }) =>
        existing?.genres ? existing.genres.includes(filters.genre) : false
      );
    }

    // Filtro network
    if (filters.network && filters.network !== 'all') {
      items = items.filter(({ existing }) =>
        existing?.networks ? existing.networks.includes(filters.network) : false
      );
    }

    // Filtro stato produzione TMDB
    if (filters.tmdbStatus && filters.tmdbStatus !== 'all') {
      items = items.filter(({ existing }) =>
        existing?.tmdb_status === filters.tmdbStatus
      );
    }

    // Filtro anno
    if (filters.year && filters.year !== 'all') {
      items = items.filter(({ result }) =>
        result.first_air_date ? result.first_air_date.startsWith(filters.year) : false
      );
    }

    // Ordinamento
    items.sort((a, b) => {
      if (filters.sortBy === 'name_asc') {
        return a.result.name.localeCompare(b.result.name);
      } else if (filters.sortBy === 'name_desc') {
        return b.result.name.localeCompare(a.result.name);
      } else if (filters.sortBy === 'release_date_desc') {
        return (b.result.first_air_date || '').localeCompare(a.result.first_air_date || '');
      } else if (filters.sortBy === 'release_date_asc') {
        return (a.result.first_air_date || '').localeCompare(b.result.first_air_date || '');
      } else {
        // date_added_desc
        const dateA = new Date(a.item.added_at || a.existing?.created_at || 0).getTime();
        const dateB = new Date(b.item.added_at || b.existing?.created_at || 0).getTime();
        return dateB - dateA;
      }
    });

    return items.map((i) => i.result);
  }, [filters, myLists, series, debouncedQuery]);

  const isSearching =
    filters.listId !== null
      ? false
      : debouncedQuery
      ? isSearchLoading
      : isDiscoverLoading;

  const results =
    filters.listId !== null
      ? (listSeriesResults ?? [])
      : debouncedQuery
      ? searchResults?.results
      : discoverData?.results;

  const hasActiveDraftFilters = useMemo(() => {
    return (
      Boolean(draftFilters.keyword?.trim()) ||
      draftFilters.genre !== 'all' ||
      draftFilters.network !== 'all' ||
      (draftFilters.ratings && draftFilters.ratings.length > 0) ||
      draftFilters.tmdbStatus !== 'all' ||
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
    if (currentFilterSource.network && currentFilterSource.network !== 'all') {
      const n = availableNetworks.find((x) => x.value === currentFilterSource.network);
      return n ? `Piattaforma: ${n.label}` : 'Filtro Piattaforma';
    }
    return null;
  }, [currentFilterSource.genre, currentFilterSource.network, availableGenres, availableNetworks]);

  const emptyMessage =
    filters.listId !== null
      ? 'Nessuna serie trovata in questa lista con questi criteri.'
      : 'Nessuna serie trovata su TMDB con questi criteri.';

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9990] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER SUPERIORE: FRECCIA INDIETRO + BARRA DI RICERCA + X AZZERA */}
      {/* Rimane fisso in alto a tutto schermo, esattamente sopra l'header normale della pagina */}
      <div className="border-b border-gray-200 bg-white shrink-0 pt-[env(safe-area-inset-top,0px)] shadow-2xs z-20">
        <div className="px-3 h-14 flex items-center gap-2 max-w-lg mx-auto relative">
          {/* Freccia Indietro per uscire dalla ricerca e tornare alla libreria */}
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center"
            title="Torna alla libreria"
            aria-label="Torna indietro"
          >
            <BackIcon className="w-5 h-5 text-gray-800" />
          </button>

          {/* Input di Ricerca cliccabile (al tocco riapre le impostazioni approfondite) */}
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

          {/* Pulsante freccia tonda per ripristinare tutta la ricerca (identico a webpage MediaFilterModal) */}
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

      {/* 2. CORPO: RISULTATI (SCROLLABILI) OPPURE FILTRI (SCROLLABILI CON TASTO FISSO IN BASSO) */}
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

export default MobileTVSeriesSearchModal;
