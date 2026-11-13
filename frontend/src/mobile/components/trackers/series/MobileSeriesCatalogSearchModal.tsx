// src/mobile/components/trackers/catalog/MobileSeriesCatalogSearchModal.tsx
import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TVSeries, MediaList } from '@/types/trackers';
import {
  useMediaFilterOptions,
  type MediaFilterState,
} from '@/hooks/trackers/useMediaFilterOptions';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileTVSeriesFilterOptions } from './MobileTVSeriesFilterOptions';
import { MobileTrackerSearchHeader } from '../shared/MobileTrackerSearchHeader';

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
    filters: { ...filters, globalSearch: false },
    onFilterChange: (newFilters) => onFilterChange({ ...newFilters, globalSearch: false }),
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10035] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      <MobileTrackerSearchHeader
        inputRef={inputRef}
        keyword={filters.keyword || ''}
        onKeywordChange={(val) => handleFieldChange('keyword', val)}
        onExecuteSearch={() => {
          inputRef.current?.blur();
          onClose();
        }}
        onBack={onClose}
        onClearAll={() => {
          onReset();
          inputRef.current?.focus();
        }}
        placeholder="Cerca per titolo nei tuoi cataloghi..."
        isClearHighlighted={hasActiveFilters || Boolean(filters.keyword)}
        backTitle="Torna al catalogo"
        autoFocus={true}
      />

      <div className="flex-1 min-h-0 flex flex-col max-w-lg mx-auto w-full overflow-hidden">
        <MobileTVSeriesFilterOptions
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          myLists={myLists}
          availableGenres={availableGenres}
          availableNetworks={availableNetworks}
          ratingOptions={ratingOptions}
          tmdbStatusOptions={tmdbStatusOptions}
          sortOptions={sortOptions}
          handleFieldChange={handleFieldChange}
          toggleRating={toggleRating}
          onExecuteSearch={onClose}
          sectionTitle="Filtri del tuo Catalogo"
          actionButtonLabel="Mostra Serie Filtrate"
          isGlobalSearch={false}
        />
      </div>
    </div>,
    document.body
  );
};

export default MobileSeriesCatalogSearchModal;
