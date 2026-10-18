// src/mobile/components/trackers/MobileSeriesCatalogModal.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { TVSeries, MediaList } from '@/types/trackers';
import { useBackHandler } from '@/utils/backButtonManager';
import { normalizeMediaStatus } from '@/utils/mediaStatusTheme';
import type { MediaFilterState } from '@/hooks/trackers/useMediaFilterOptions';
import {
  MobileSeriesCatalogHeader,
  MobileSeriesCatalogEyeMenu,
  MobileSeriesCatalogGrid,
  MobileSeriesCatalogSearchModal,
  type CatalogStatusTab,
} from './catalog';

export interface MobileSeriesCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: TVSeries[];
  myLists?: MediaList[];
  onOpenSeriesDetail: (series: TVSeries) => void;
}

const DEFAULT_CATALOG_FILTERS: MediaFilterState = {
  keyword: '',
  genre: 'all',
  network: 'all',
  ratings: [],
  tmdbStatus: 'all',
  year: 'all',
  sortBy: 'date_added_desc',
  listId: null,
  globalSearch: false,
};

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
  const [filters, setFilters] = useState<MediaFilterState>(DEFAULT_CATALOG_FILTERS);

  // Rilevamento presenza di filtri di ricerca attivi
  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(filters.keyword.trim()) ||
      filters.genre !== 'all' ||
      filters.network !== 'all' ||
      (filters.ratings && filters.ratings.length > 0) ||
      filters.tmdbStatus !== 'all' ||
      filters.year !== 'all' ||
      filters.sortBy !== 'date_added_desc' ||
      filters.listId !== null
    );
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_CATALOG_FILTERS);
    setActiveTab('all');
  };

  // Gestione Tasto Fisico / Gesture Back di Android
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

  // Serie filtrate per tutti i criteri applicati (parola chiave, filtri e ordinamento)
  const filteredSeries = useMemo(() => {
    let result = [...series];

    // 1. Filtro per Lista Personale
    if (filters.listId !== null && myLists) {
      const targetList = myLists.find((l) => l.id === filters.listId);
      if (targetList && targetList.items) {
        const itemTmdbIds = new Set(targetList.items.map((i) => i.series_tmdb_id));
        result = result.filter((s) => itemTmdbIds.has(s.tmdb_id));
      }
    }

    // 2. Filtro Parola Chiave (Titolo, Titolo Originale, Generi)
    if (filters.keyword.trim()) {
      const q = filters.keyword.toLowerCase().trim();
      result = result.filter((s) => {
        const titleMatch = s.title.toLowerCase().includes(q);
        const origMatch = s.original_title?.toLowerCase().includes(q);
        const genreMatch = s.genres?.toLowerCase().includes(q);
        return titleMatch || origMatch || genreMatch;
      });
    }

    // 3. Filtro Genere
    if (filters.genre && filters.genre !== 'all') {
      const g = filters.genre.toLowerCase();
      result = result.filter((s) => s.genres?.toLowerCase().includes(g));
    }

    // 4. Filtro Network / Piattaforma
    if (filters.network && filters.network !== 'all') {
      const n = filters.network.toLowerCase();
      result = result.filter((s) => s.networks?.toLowerCase().includes(n));
    }

    // 5. Filtro Anno di Uscita
    if (filters.year && filters.year !== 'all') {
      result = result.filter((s) => s.first_air_date?.startsWith(filters.year));
    }

    // 6. Filtro Stato Produzione TMDB
    if (filters.tmdbStatus && filters.tmdbStatus !== 'all') {
      result = result.filter((s) => s.tmdb_status === filters.tmdbStatus);
    }

    // 7. Filtro Voto Personale
    if (filters.ratings && filters.ratings.length > 0) {
      result = result.filter((s) => {
        if (filters.ratings.includes('unrated')) {
          if (s.rating === null || s.rating === undefined || s.rating === 0) return true;
        }
        return filters.ratings.includes(String(s.rating));
      });
    }

    // 8. Filtro Menu Occhio (Tab di Stato Visione)
    if (activeTab === 'watching') {
      result = result.filter(
        (s) => normalizeMediaStatus(s.status, s.tmdb_status) === 'watching'
      );
    } else if (activeTab === 'to_watch') {
      result = result.filter((s) => {
        const st = normalizeMediaStatus(s.status, s.tmdb_status);
        return (
          st === 'to_watch' ||
          st === 'dropped' ||
          st === 'on_hold' ||
          st === 'untracked'
        );
      });
    } else if (activeTab === 'completed') {
      result = result.filter((s) => {
        const st = normalizeMediaStatus(s.status, s.tmdb_status);
        return st === 'completed' || st === 'waiting';
      });
    }

    // 9. Ordinamento
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'name_desc':
          return b.title.localeCompare(a.title);
        case 'release_date_desc':
          return (b.first_air_date || '').localeCompare(a.first_air_date || '');
        case 'release_date_asc':
          return (a.first_air_date || '').localeCompare(b.first_air_date || '');
        case 'date_added_desc':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [series, filters, activeTab, myLists]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10025] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER: TITOLO "Le tue serie", TASTO LENTE E TASTO OCCHIO */}
      <MobileSeriesCatalogHeader
        onBack={onClose}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        hasActiveFilters={hasActiveFilters}
        activeTab={activeTab}
        isEyeMenuOpen={isEyeMenuOpen}
        onToggleEyeMenu={() => setIsEyeMenuOpen((prev) => !prev)}
      />

      {/* 2. MENU SPEED-DIAL FLUTTUANTE VERSO IL BASSO PER STATO DI VISIONE (SENZA NUMERI) */}
      <MobileSeriesCatalogEyeMenu
        isOpen={isEyeMenuOpen}
        onClose={() => setIsEyeMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* 3. GRIGLIA A 4 AREE (IN VISIONE, IN LISTA, IN ATTESA, COMPLETATE) A 3 COLONNE */}
      <MobileSeriesCatalogGrid
        series={filteredSeries}
        onSelectSeries={(item) => {
          onClose();
          onOpenSeriesDetail(item);
        }}
        hasActiveFilters={hasActiveFilters || activeTab !== 'all'}
        onResetFilters={handleResetFilters}
      />

      {/* 4. MODALE DI RICERCA COMPLETO CON TUTTI GLI ELEMENTI PER IL CATALOGO PERSONALE */}
      <MobileSeriesCatalogSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(DEFAULT_CATALOG_FILTERS)}
        hasActiveFilters={hasActiveFilters}
        series={series}
        myLists={myLists}
      />
    </div>,
    document.body
  );
};

export default MobileSeriesCatalogModal;
