// src/components/shared/layout/ArchiveActionBar.tsx
import React from 'react';
import { SearchIcon } from '@/components/shared/utils/Icons';
import { AddButton } from '@/components/shared/utils/AddButton';

interface ArchiveActionBarProps {
  // Sinistra: Pulsante di Creazione
  addLabel?: string;
  onAdd?: () => void;
  actionButton?: React.ReactNode;

  // Destra: Ricerca Modale & Filtri Rapidi Extra
  onOpenSearch?: () => void;
  activeFiltersCount?: number;
  extraFilters?: React.ReactNode;

  className?: string;
}

export const ArchiveActionBar: React.FC<ArchiveActionBarProps> = ({
  addLabel,
  onAdd,
  actionButton,
  onOpenSearch,
  activeFiltersCount = 0,
  extraFilters,
  className = '',
}) => {
  const hasActiveFilters = activeFiltersCount > 0;
  const basePanelClass =
    'rounded-2xl border border-slate-200/90 bg-white shadow-xs p-2.5 sm:px-4 shrink-0 flex items-center justify-between gap-3 text-xs relative z-10';

  return (
    <section className={`${basePanelClass} ${className}`}>
      {/* A SINISTRA: Pulsante Aggiungi / Azione Principale */}
      <div className="w-44 sm:w-48 shrink-0">
        {actionButton ? (
          actionButton
        ) : addLabel && onAdd ? (
          <AddButton
            label={addLabel}
            onClick={onAdd}
            compact
            className="shadow-2xs"
          />
        ) : null}
      </div>

      {/* A DESTRA: Lente di Ricerca & Eventuali Filtri Rapidi */}
      <div className="flex items-center gap-2.5">
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className={`relative p-2 rounded-xl border transition-all flex items-center justify-center w-8 h-8 cursor-pointer ${
              hasActiveFilters
                ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-blue-500'
            }`}
            title={hasActiveFilters ? `${activeFiltersCount} filtri attivi` : 'Filtri & Ricerca Avanzata'}
          >
            <SearchIcon className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-2xs">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}

        {extraFilters}
      </div>
    </section>
  );
};

export default ArchiveActionBar;
