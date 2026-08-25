// src/views/Archive/NotesPage.tsx
import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { NoteIcon, UndoIcon } from '@/components/shared/utils/Icons';
import { Pagination } from '@/components/shared/utils/Pagination';
import { NoteFilterBar } from '@/components/archive/notes/NoteFilterBar';
import { NoteCard } from '@/components/archive/notes/NoteCard';
import { NoteFilterModal } from '@/components/archive/notes/NoteFilterModal';
import { NoteModal } from '@/components/archive/notes/NoteModal';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useNoteArchiveData, type NoteFilterState } from '@/hooks/useNoteArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { useConfirm } from '@/context/ConfirmContext';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';
import { ERROR_MESSAGES } from '@/data/loadingMessages';
import type { DailyEntry } from '@/types/dailyentries';
import type { NoteVariant } from '@/types';

const initialFilterState: NoteFilterState = {
  keyword: '',
  dateFrom: '',
  dateTo: '',
  variant: 'all',
};

export const NotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();

  // 1. CARICAMENTO DATI CON REACT QUERY
  const { data: rawNotes = [], isLoading: loading, isError } = useNotes();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  // 2. STATO FILTRI E PAGINAZIONE
  const [filters, setFilters] = useState<NoteFilterState>(initialFilterState);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. MODALI — useModal<T> al posto di coppie useState separate
  const filterModal = useModal();
  const formModal = useModal<DailyEntry>();

  // 4. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 230,
    columns: (w) => (w >= 1024 ? 3 : w >= 640 ? 2 : 1),
    defaultPageSize: 6,
    minItems: 2,
    maxItems: 18,
  });

  // 5. ELABORAZIONE DATI IN RAM (MAZZO DI CARTE)
  const {
    paginatedNotes,
    totalPages,
    totalCount,
  } = useNoteArchiveData({
    rawNotes,
    filters,
    currentPage,
    pageSize,
  });

  // Conteggio filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.variant !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
  };

  // --- AZIONI CREAZIONE / MODIFICA / ELIMINAZIONE ---
  const handleOpenNew = () => formModal.open(null);

  const handleOpenEdit = (note: DailyEntry) => formModal.open(note);

  const handleDeleteNote = (note: DailyEntry) => {
    confirm({
      title: 'Elimina Nota',
      message: "Sei sicuro di voler eliminare definitivamente questa nota? L'azione non è reversibile.",
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        await deleteNoteMutation.mutateAsync(note.id);
      },
    });
  };

  const handleSaveNote = async (payload: {
    data_riferimento: string;
    testo: string;
    tipo: NoteVariant;
    id?: number;
  }) => {
    if (payload.id) {
      await updateNoteMutation.mutateAsync({
        id: payload.id,
        payload: {
          data_riferimento: payload.data_riferimento,
          testo: payload.testo,
          tipo: payload.tipo,
        },
      });
    } else {
      await createNoteMutation.mutateAsync({
        data_riferimento: payload.data_riferimento,
        testo: payload.testo,
        tipo: payload.tipo,
      });
    }

    formModal.close();
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="NOTE & RIFLESSIONI"
        subtitle="Bacheca completa delle tue note, memo veloci e riflessioni giornaliere."
        icon={<NoteIcon className="w-5 h-5 text-white" />}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. BARRA AZIONI (NUOVA NOTA + RICERCA) */}
      <NoteFilterBar
        onOpenNewNote={handleOpenNew}
        onOpenSearch={filterModal.open}
        activeFiltersCount={activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. BACHECA NOTE (GRIGLIA A 3 COLONNE CON ALTEZZA NATURALE) */}
      <div className={`${ARCHIVE_PANEL_CLASS} flex flex-col flex-1 min-h-0 overflow-hidden`}>
        <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {isError ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-2xl mb-3">⚠️</div>
              <p className="text-sm font-bold text-rose-700">{ERROR_MESSAGES.archive}</p>
              <button
                type="button"
                onClick={() => queryClient.refetchQueries()}
                className="mt-4 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
              >
                🔄 Riprova
              </button>
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
                  onClick={handleResetFilters}
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
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteNote}
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
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 4. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <NoteFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. MODALE CREAZIONE / MODIFICA NOTA */}
      <NoteModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        noteToEdit={formModal.data}
        onSave={handleSaveNote}
      />
    </div>
  );
};

export default NotesPage;
