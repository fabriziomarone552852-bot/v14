// src/mobile/components/trackers/movies/MobileMovieCatalogModal.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Movie, MovieFilters, MovieDetailTarget } from '@/types/movies';
import type { MediaList } from '@/types/trackers';
import { useBackHandler } from '@/utils/backButtonManager';
import { useFilteredMovies } from '@/hooks/trackers/useFilteredMovies';
import {
  DEFAULT_MOVIE_FILTERS,
  hasActiveMovieFilters,
} from '@/hooks/trackers/useMovieFilterOptions';
import {
  MobileTrackerCatalogHeader,
  MobileTrackerCatalogEyeMenu,
  type CatalogStatusTab,
} from '../shared/catalog';
import { MobileMovieCatalogGrid } from './MobileMovieCatalogGrid';
import { MobileMovieCatalogSearchModal } from './MobileMovieCatalogSearchModal';

export interface MobileMovieCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  myLists?: MediaList[];
  onOpenMovieDetail: (movie: MovieDetailTarget) => void;
}

export const MobileMovieCatalogModal: React.FC<MobileMovieCatalogModalProps> = ({
  isOpen,
  onClose,
  movies,
  myLists,
  onOpenMovieDetail,
}) => {
  const [activeTab, setActiveTab] = useState<CatalogStatusTab>('all');
  const [isEyeMenuOpen, setIsEyeMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [filters, setFilters] = useState<MovieFilters>(DEFAULT_MOVIE_FILTERS);

  const hasActiveFilters = useMemo(
    () => hasActiveMovieFilters(filters, { ignoreGlobalSearch: true }),
    [filters]
  );

  const handleResetFilters = () => {
    setFilters(DEFAULT_MOVIE_FILTERS);
    setActiveTab('all');
  };

  useBackHandler(
    isOpen,
    () => {
      if (isEyeMenuOpen) {
        setIsEyeMenuOpen(false);
        return true;
      }
      onClose();
      return true;
    },
    25
  );

  const mappedMovieTab: 'all' | 'to_watch' | 'watched' =
    activeTab === 'completed'
      ? 'watched'
      : activeTab === 'to_watch'
      ? 'to_watch'
      : 'all';

  const filteredMovies = useFilteredMovies(movies, filters, mappedMovieTab, myLists);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10025] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER: TITOLO "I tuoi film", TASTO PIATTAFORME AL CENTRO, LENTE E OCCHIO */}
      <MobileTrackerCatalogHeader
        title="I tuoi film"
        onBack={onClose}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        hasActiveFilters={hasActiveFilters}
        activeTab={activeTab}
        isEyeMenuOpen={isEyeMenuOpen}
        onToggleEyeMenu={() => setIsEyeMenuOpen((prev) => !prev)}
        showPlatformsButton={true}
        searchButtonTitle="Cerca nei tuoi film"
      />

      {/* 2. MENU SPEED-DIAL STATO VISIONE FILM */}
      <MobileTrackerCatalogEyeMenu
        isOpen={isEyeMenuOpen}
        onClose={() => setIsEyeMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        mediaType="movies"
      />

      {/* 3. GRIGLIA A 3 COLONNE (IN LISTA / GUARDATI) */}
      <MobileMovieCatalogGrid
        movies={filteredMovies}
        onSelectMovie={(item) => onOpenMovieDetail(item)}
        hasActiveFilters={hasActiveFilters || activeTab !== 'all'}
        onResetFilters={handleResetFilters}
      />

      {/* 4. MODALE FILTRI CATALOGO PERSONALE FILM */}
      <MobileMovieCatalogSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(DEFAULT_MOVIE_FILTERS)}
        hasActiveFilters={hasActiveFilters}
        movies={movies}
        myLists={myLists}
      />
    </div>,
    document.body
  );
};

export default MobileMovieCatalogModal;
