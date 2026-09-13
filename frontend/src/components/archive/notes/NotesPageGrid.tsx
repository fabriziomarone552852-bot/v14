// src/components/archive/notes/NotesPageGrid.tsx
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NoteIcon, UndoIcon } from '@/components/shared/utils/Icons';
import { Pagination } from '@/components/shared/utils/Pagination';
import { NoteCard } from './NoteCard';
import { ERROR_MESSAGES } from '@/data/loadingMessages';
import type { DailyEntry } from '@/types/dailyentries';

interface NotesPageGridProps {
  containerRef: (node: HTMLDivElement | null) => void;
  loading: boolean;
  isError: boolean;
  totalCount: number;
  hasActiveFilters: boolean;
  paginatedNotes: DailyEntry[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onEditNote: (note: DailyEntry) => void;
  onDeleteNote: (note: DailyEntry) => void;
  panelClass: string;
}

export const NotesPageGrid: React.FC<NotesPageGridProps> = ({
  containerRef,
  loading,
  isError,
  totalCount,
  hasActiveFilters,
  paginatedNotes,
  currentPage,
  totalPages,
  onPageChange,
  onResetFilters,
  onEditNote,
  onDeleteNote,
  panelClass,
}) => {
  const queryClient = useQueryClient();

  return (
    <div className={`${panelClass} flex flex-col flex-1 min-h-0 overflow-hidden`}>
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
        {isError ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <div className="text-3xl">⚠️</div>
            <p className="text-sm font-bold text-rose-700">{ERROR_MESSAGES.archive}</p>
            <div className="mt-2 p-1.5 bg-rose-50 border border-rose-200 rounded-2xl">
              <button
                type="button"
                onClick={() => queryClient.refetchQueries()}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-rose-100 rounded-xl transition cursor-pointer"
              >
                🔄 Riprova
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Caricamento note in corso...</span>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-100">
              <NoteIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nessuna nota trovata</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {hasActiveFilters
                ? 'Nessuna nota corrisponde ai filtri selezionati. Prova ad azzerarli.'
                : 'Non ci sono note salvate nel tuo archivio.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                <UndoIcon className="w-3.5 h-3.5" />
                <span>Azzera filtri</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {paginatedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
              />
            ))}
          </div>
        )}
      </div>

      {/* PAGINAZIONE INFERIORE */}
      {totalPages > 1 && (
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center shrink-0">
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
