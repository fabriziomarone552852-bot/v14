// src/mobile/components/trackers/catalog/MobileSeriesCatalogHeader.tsx
import React from 'react';
import {
  BackIcon,
  SearchIcon,
  EyeIcon,
  EyePlayIcon,
  EyeHalfOpenIcon,
  EyeClosedIcon,
} from '@/components/shared/utils/Icons';

export type CatalogStatusTab = 'all' | 'watching' | 'to_watch' | 'waiting' | 'completed';

export interface MobileSeriesCatalogHeaderProps {
  title?: string;
  onBack: () => void;
  rightActions?: React.ReactNode;
  onOpenSearch?: () => void;
  hasActiveFilters?: boolean;
  activeTab?: CatalogStatusTab;
  isEyeMenuOpen?: boolean;
  onToggleEyeMenu?: () => void;
}

export const MobileSeriesCatalogHeader: React.FC<MobileSeriesCatalogHeaderProps> = ({
  title = 'Le tue serie',
  onBack,
  rightActions,
  onOpenSearch,
  hasActiveFilters = false,
  activeTab = 'all',
  isEyeMenuOpen = false,
  onToggleEyeMenu,
}) => {
  // Icona dinamica per il pulsante dell'occhio in base al filtro attivo
  const renderEyeIcon = () => {
    switch (activeTab) {
      case 'watching':
        return <EyePlayIcon className="w-5 h-5 text-blue-600" />;
      case 'waiting':
        return <EyeIcon className="w-5 h-5 text-purple-600" />;
      case 'completed':
        return <EyeIcon className="w-5 h-5 text-emerald-600" />;
      case 'to_watch':
        return <EyeClosedIcon className="w-5 h-5 text-amber-600" />;
      case 'all':
      default:
        return <EyeHalfOpenIcon className="w-5 h-5 text-gray-800" />;
    }
  };

  return (
    <div className="shrink-0 bg-white border-b border-gray-200/90 pt-[env(safe-area-inset-top,0px)] shadow-2xs z-20">
      <div className="px-3 h-14 flex items-center justify-between gap-2 max-w-lg mx-auto relative select-none">
        {/* 1. FRECCIA INDIETRO PER CHIUDERE IL CATALOGO (A SINISTRA) */}
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center"
          title="Torna indietro"
          aria-label="Torna indietro"
        >
          <BackIcon className="w-5 h-5 text-gray-800" />
        </button>

        {/* 2. AREA CENTRALE: TITOLO SENZA NUMERI NÉ SOTTOTITOLI */}
        <div className="flex-1 min-w-0 flex items-center px-1">
          <h2 className="text-base font-black text-gray-900 truncate tracking-tight">
            {title}
          </h2>
        </div>

        {/* 3. GRUPPO AZIONI DESTRA: AZIONI PERSONALIZZATE OPPURE (LENTE + OCCHIO) */}
        <div className="flex items-center gap-1 shrink-0">
          {rightActions ? (
            rightActions
          ) : (
            <>
              {/* Lente d'ingrandimento per aprire la ricerca nel catalogo con tutti gli elementi (se presente) */}
              {onOpenSearch && (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className={`relative w-9 h-9 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                    hasActiveFilters
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Cerca nelle tue serie"
                  aria-label="Cerca nel catalogo"
                >
                  <SearchIcon className="w-5 h-5 text-gray-800" />
                  {hasActiveFilters && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white" />
                  )}
                </button>
              )}

              {/* Tasto Occhio per scegliere tra serie viste, non viste, in corso o tutte */}
              {onToggleEyeMenu && (
                <button
                  type="button"
                  onClick={onToggleEyeMenu}
                  className={`relative w-9 h-9 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                    isEyeMenuOpen
                      ? 'bg-blue-100 text-blue-700 shadow-inner'
                      : activeTab !== 'all'
                      ? 'bg-blue-50 shadow-2xs'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Filtra per stato di visione"
                  aria-label="Filtra per stato di visione"
                >
                  {renderEyeIcon()}
                  {activeTab !== 'all' && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white" />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileSeriesCatalogHeader;
