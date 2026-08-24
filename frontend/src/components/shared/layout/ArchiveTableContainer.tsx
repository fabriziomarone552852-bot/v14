// src/components/shared/layout/ArchiveTableContainer.tsx
import React from 'react';
import { Pagination } from '@/components/shared/utils/Pagination';

interface ArchiveTableContainerProps {
  // Intestazione Tabella
  header: React.ReactNode;

  // Stato di Caricamento
  loading?: boolean;
  loadingMessage?: string;

  // Stato Vuoto
  isEmpty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;

  // Paginazione
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  // Contenuto Righe
  children: React.ReactNode;

  className?: string;
  bodyRef?: React.Ref<HTMLDivElement>;
}

export const ArchiveTableContainer: React.FC<ArchiveTableContainerProps> = ({
  header,
  loading = false,
  loadingMessage = 'Caricamento in corso...',
  isEmpty = false,
  emptyIcon,
  emptyTitle = 'Nessun elemento trovato',
  emptyDescription = 'Non ci sono elementi che corrispondono ai criteri selezionati.',
  hasActiveFilters = false,
  onResetFilters,
  currentPage,
  totalPages = 1,
  onPageChange,
  children,
  className = '',
  bodyRef,
}) => {
  const basePanelClass =
    'rounded-2xl border border-slate-200/90 bg-white shadow-xs flex-1 min-h-0 flex flex-col justify-between overflow-hidden relative z-10';

  return (
    <main className={`${basePanelClass} ${className}`}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Intestazione Colonne */}
        {header}

        {/* Corpo Scrollabile / Adattivo */}
        <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">{loadingMessage}</p>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              {emptyIcon && <div className="p-3 bg-slate-100 rounded-2xl mb-3">{emptyIcon}</div>}
              <p className="text-sm font-bold text-slate-700">{emptyTitle}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
                {emptyDescription}
              </p>
              {hasActiveFilters && onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
                >
                  Azzera filtri
                </button>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>

      {/* Footer con Paginazione */}
      {totalPages > 1 && currentPage && onPageChange && (
        <div className="p-2.5 border-t border-slate-100 shrink-0 flex items-center justify-center bg-slate-50/50">
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </main>
  );
};

export default ArchiveTableContainer;
