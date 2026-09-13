// src/components/archive/notes/useNotesPageLogic.ts
import { useMemo, useState } from 'react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useNoteArchiveData, type NoteFilterState } from '@/hooks/useNoteArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import { useConfirm } from '@/context/ConfirmContext';
import type { DailyEntry } from '@/types/dailyentries';
import type { NoteVariant } from '@/types';

export const initialNoteFilterState: NoteFilterState = {
  keyword: '',
  dateFrom: '',
  dateTo: '',
  variant: 'all',
};

export const useNotesPageLogic = () => {
  const { confirm } = useConfirm();

  // 1. CARICAMENTO DATI CON REACT QUERY
  const { data: rawNotes = [], isLoading: loading, isError } = useNotes();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  // 2. STATO FILTRI E PAGINAZIONE
  const [filters, setFilters] = useState<NoteFilterState>(initialNoteFilterState);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. MODALI
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
  const { paginatedNotes, totalPages, totalCount } = useNoteArchiveData({
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
    setFilters(initialNoteFilterState);
    setCurrentPage(1);
  };

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

  // 6. REGISTRAZIONE HEADER ARCHIVIO PER MOBILE
  useArchiveHeader({
    title: 'Note & Appunti',
    onOpenSearch: filterModal.open,
    onOpenNew: handleOpenNew,
    activeFiltersCount,
  });

  return {
    loading,
    isError,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    filterModal,
    formModal,
    containerRef,
    paginatedNotes,
    totalPages,
    totalCount,
    activeFiltersCount,
    hasActiveFilters,
    handleResetFilters,
    handleOpenNew,
    handleOpenEdit,
    handleDeleteNote,
    handleSaveNote,
  };
};
