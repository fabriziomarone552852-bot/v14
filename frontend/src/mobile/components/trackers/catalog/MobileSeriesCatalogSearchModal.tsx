// src/mobile/components/trackers/catalog/MobileSeriesCatalogSearchModal.tsx
import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TVSeries, MediaList } from '@/types/trackers';
import { SearchIcon, CloseIcon, BackIcon } from '@/components/shared/utils/Icons';
import {
  useMediaFilterOptions,
  type MediaFilterState,
} from '@/hooks/trackers/useMediaFilterOptions';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileTVSeriesFilterOptions } from '../MobileTVSeriesFilterOptions';

export interface MobileSeriesCatalogSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MediaFilterState;
  onFilterChange: (newFilters: MediaFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  series: TVSeries[];
  myLists?: MediaList[];
}

export const MobileSeriesCatalogSearchModal: React.FC<MobileSeriesCatalogSearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  series,
  myLists,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useBackHandler(
    isOpen,
    () => {
      onClose();
      return true;
    },
    30
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

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
    filters: { ...filters, globalSearch: false },
    onFilterChange: (newFilters) => onFilterChange({ ...newFilters, globalSearch: false }),
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10035] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER DI RICERCA: FRECCIA INDIETRO + BARRA DI TESTO + X AZZERA */}
      <div className="border-b border-gray-200 bg-white shrink-0 pt-[env(safe-area-inset-top,0px)] shadow-2xs z-20">
        <div className="px-3 h-14 flex items-center gap-2 max-w-lg mx-auto relative">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center"
            title="Torna al catalogo"
            aria-label="Torna indietro"
          >
            <BackIcon className="w-5 h-5 text-gray-800" />
          </button>

          <div className="relative flex-1 flex items-center min-w-0">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={filters.keyword || ''}
              onChange={(e) => handleFieldChange('keyword', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  inputRef.current?.blur();
                  onClose();
                }
              }}
              placeholder="Cerca per titolo o genere..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-2xs"
            />
          </div>

          {/* Pulsante 'X' per azzerare testo o resetta filtri */}
          {filters.keyword ? (
            <button
              type="button"
              onClick={() => handleFieldChange('keyword', '')}
              className="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              title="Azzera testo"
            >
              <CloseIcon className="w-4 h-4 text-gray-500" />
            </button>
          ) : hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              Azzera
            </button>
          ) : null}
        </div>
      </div>

      {/* 2. BODY CON TUTTE LE OPZIONI DI FILTRO DEL CATALOGO */}
      <div className="flex-1 min-h-0 relative">
        <MobileTVSeriesFilterOptions
          filters={filters}
          hasActiveFilters={hasActiveFilters}
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
          onExecuteSearch={onClose}
          actionButtonLabel="Mostra Serie Filtrate"
        />
      </div>
    </div>,
    document.body
  );
};

export default MobileSeriesCatalogSearchModal;
