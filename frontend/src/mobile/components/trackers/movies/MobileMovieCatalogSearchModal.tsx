// src/mobile/components/trackers/movies/MobileMovieCatalogSearchModal.tsx
import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Movie, MovieFilters } from '@/types/movies';
import type { MediaList } from '@/types/trackers';
import { useMovieFilterOptions } from '@/hooks/trackers/useMovieFilterOptions';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileMovieFilterOptions } from './MobileMovieFilterOptions';
import { MobileTrackerSearchHeader } from '../shared/MobileTrackerSearchHeader';

export interface MobileMovieCatalogSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MovieFilters;
  onFilterChange: (newFilters: MovieFilters) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  movies: Movie[];
  myLists?: MediaList[];
}

export const MobileMovieCatalogSearchModal: React.FC<MobileMovieCatalogSearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  movies,
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
    availablePlatforms,
    availableSagas,
    ratingOptions,
    obtainedOptions,
    sortOptions,
    handleFieldChange,
    toggleRating,
  } = useMovieFilterOptions({
    movies,
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
        placeholder="Cerca per titolo nei tuoi film..."
        isClearHighlighted={hasActiveFilters || Boolean(filters.keyword)}
        backTitle="Torna al catalogo"
        autoFocus={true}
      />

      <div className="flex-1 min-h-0 flex flex-col max-w-lg mx-auto w-full overflow-hidden">
        <MobileMovieFilterOptions
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          myLists={myLists}
          availableGenres={availableGenres}
          availablePlatforms={availablePlatforms}
          availableSagas={availableSagas}
          ratingOptions={ratingOptions}
          obtainedOptions={obtainedOptions}
          sortOptions={sortOptions}
          handleFieldChange={handleFieldChange}
          toggleRating={toggleRating}
          onExecuteSearch={onClose}
          sectionTitle="Filtri del tuo Catalogo"
          actionButtonLabel="Mostra Film Filtrati"
          isGlobalSearch={false}
        />
      </div>
    </div>,
    document.body
  );
};

export default MobileMovieCatalogSearchModal;
