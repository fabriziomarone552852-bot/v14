// src/mobile/components/trackers/MobileSeriesCatalogModal.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { TVSeries, MediaList } from '@/types/trackers';
import { useBackHandler } from '@/utils/backButtonManager';
import {
  DEFAULT_SERIES_FILTERS,
  hasActiveSeriesFilters,
  type MediaFilterState,
} from '@/hooks/trackers/useMediaFilterOptions';
import { useFilteredTVSeries } from '@/hooks/trackers/useFilteredTVSeries';
import {
  MobileTrackerCatalogHeader,
  MobileTrackerCatalogEyeMenu,
  type CatalogStatusTab,
} from '../shared/catalog';
import { MobileSeriesCatalogGrid } from './MobileSeriesCatalogGrid';
import { MobileSeriesCatalogSearchModal } from './MobileSeriesCatalogSearchModal';

export interface MobileSeriesCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: TVSeries[];
  myLists?: MediaList[];
  onOpenSeriesDetail: (series: TVSeries) => void;
}

export const MobileSeriesCatalogModal: React.FC<MobileSeriesCatalogModalProps> = ({
  isOpen,
  onClose,
  series,
  myLists,
  onOpenSeriesDetail,
}) => {
  const [activeTab, setActiveTab] = useState<CatalogStatusTab>('all');
  const [isEyeMenuOpen, setIsEyeMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [filters, setFilters] = useState<MediaFilterState>(DEFAULT_SERIES_FILTERS);

  const hasActiveFilters = useMemo(
    () => hasActiveSeriesFilters(filters, { ignoreGlobalSearch: true }),
    [filters]
  );

  const handleResetFilters = () => {
    setFilters(DEFAULT_SERIES_FILTERS);
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

  // Condivide al 100% la logica unificata di filtro, rating calcolato dai log e ordinamento
  const filteredSeries = useFilteredTVSeries(series, filters, activeTab, myLists);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10025] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER: TITOLO "Le tue serie", TASTO LENTE E TASTO OCCHIO */}
      <MobileTrackerCatalogHeader
        onBack={onClose}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        hasActiveFilters={hasActiveFilters}
        activeTab={activeTab}
        isEyeMenuOpen={isEyeMenuOpen}
        onToggleEyeMenu={() => setIsEyeMenuOpen((prev) => !prev)}
        showPlatformsButton={true}
      />

      {/* 2. MENU SPEED-DIAL FLUTTUANTE PER STATO DI VISIONE */}
      <MobileTrackerCatalogEyeMenu
        isOpen={isEyeMenuOpen}
        onClose={() => setIsEyeMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* 3. GRIGLIA A 4 AREE (IN VISIONE, IN LISTA, IN ATTESA, COMPLETATE) */}
      <MobileSeriesCatalogGrid
        series={filteredSeries}
        onSelectSeries={(item) => {
          onOpenSeriesDetail(item);
        }}
        hasActiveFilters={hasActiveFilters || activeTab !== 'all'}
        onResetFilters={handleResetFilters}
      />

      {/* 4. MODALE DI RICERCA COMPLETO PER IL CATALOGO PERSONALE */}
      <MobileSeriesCatalogSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(DEFAULT_SERIES_FILTERS)}
        hasActiveFilters={hasActiveFilters}
        series={series}
        myLists={myLists}
      />
    </div>,
    document.body
  );
};

export default MobileSeriesCatalogModal;
