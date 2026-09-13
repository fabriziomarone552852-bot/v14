// src/mobile/components/header/MobileHeaderRightActions.tsx
import React from 'react';
import { SearchIcon } from '@/components/shared/utils/Icons';

interface MobileHeaderRightActionsProps {
  isArchivePage: boolean;
  isShopping: boolean;
  isSettings: boolean;
  archiveConfig: {
    hasSearch?: boolean;
    hasNew?: boolean;
    title?: string;
    activeFiltersCount?: number;
  };
  triggerOpenSearch: () => void;
  triggerOpenNew: () => void;
  openOmniSearch: () => void;
  isAddMenuOpen: boolean;
  onToggleAddMenu: () => void;
}

export const MobileHeaderRightActions: React.FC<MobileHeaderRightActionsProps> = ({
  isArchivePage,
  isShopping,
  isSettings,
  archiveConfig,
  triggerOpenSearch,
  triggerOpenNew,
  openOmniSearch,
  isAddMenuOpen,
  onToggleAddMenu,
}) => {
  return (
    <div className="flex items-center gap-1 shrink-0 z-10">
      {/* SE SIAMO IN UNA PAGINA ARCHIVIO */}
      {isArchivePage ? (
        <>
          {/* Lente d'ingrandimento per la ricerca */}
          {archiveConfig.hasSearch && (
            <button
              type="button"
              onClick={triggerOpenSearch}
              className={`relative w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center ${
                (archiveConfig.activeFiltersCount ?? 0) > 0 ? 'text-blue-600 bg-blue-50' : ''
              }`}
              title="Filtri & Ricerca"
              aria-label="Cerca"
            >
              <SearchIcon className="w-5 h-5 text-gray-800" />
              {Boolean(
                archiveConfig.activeFiltersCount && archiveConfig.activeFiltersCount > 0
              )}
              {Boolean(
                archiveConfig.activeFiltersCount && archiveConfig.activeFiltersCount > 0
              ) && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-2xs">
                  {archiveConfig.activeFiltersCount}
                </span>
              )}
            </button>
          )}

          {/* Tasto Aggiungi (+) nell'header archivio */}
          {archiveConfig.hasNew && (
            <button
              type="button"
              onClick={triggerOpenNew}
              className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
              title={`Nuovo in ${archiveConfig.title || 'Archivio'}`}
              aria-label="Aggiungi"
            >
              <svg
                className="w-5 h-5 text-gray-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </>
      ) : isShopping && !isSettings ? (
        /* SE SIAMO IN SHOPPING */
        <button
          type="button"
          onClick={openOmniSearch}
          className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
          title="Cerca prodotti, liste o gruppi"
          aria-label="Cerca"
        >
          <SearchIcon className="w-5 h-5 text-gray-800" />
        </button>
      ) : null}

      {/* Tasto Più (+) per Agenda & Shopping (non mostrato in impostazioni o archivio) */}
      {!isSettings && !isArchivePage && (
        <button
          type="button"
          onClick={onToggleAddMenu}
          className={`w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center ${
            isAddMenuOpen ? 'bg-gray-200 text-gray-900 rotate-45' : ''
          }`}
          title={isShopping ? 'Aggiungi elementi spesa' : 'Aggiungi nuovo evento o task'}
          aria-label="Aggiungi"
        >
          <svg
            className="w-5 h-5 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MobileHeaderRightActions;
