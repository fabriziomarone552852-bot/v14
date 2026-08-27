// src/hooks/useNoteArchiveData.ts
import { useMemo } from 'react';
import type { DailyEntry } from '@/types/dailyentries';
import type { NoteVariant } from '@/types';
import { paginate } from '@/utils/paginationUtils';

export interface NoteFilterState {
  keyword: string;
  dateFrom: string;
  dateTo: string;
  variant: 'all' | NoteVariant;
}

interface UseNoteArchiveDataOptions {
  rawNotes: DailyEntry[];
  filters: NoteFilterState;
  currentPage: number;
  pageSize?: number;
}

export const useNoteArchiveData = ({
  rawNotes,
  filters,
  currentPage,
  pageSize = 6,
}: UseNoteArchiveDataOptions) => {
  return useMemo(() => {
    // 1. Filtraggio in RAM
    const filtered = rawNotes.filter((note) => {
      // Solo note effettive
      if (!['N1', 'N2', 'N3', 'N4'].includes(note.tipo)) return false;

      // Filtro per tipologia variante (N1, N2, N3, N4)
      if (filters.variant !== 'all' && note.tipo !== filters.variant) return false;

      // Filtro per Parola Chiave nel testo
      if (filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        const text = (note.testo || '').toLowerCase();
        if (!text.includes(q)) return false;
      }

      // Filtro per Intervallo Date (da data ... a data ...)
      if (note.data_riferimento) {
        const noteDate = note.data_riferimento.substring(0, 10);
        if (filters.dateFrom && noteDate < filters.dateFrom) return false;
        if (filters.dateTo && noteDate > filters.dateTo) return false;
      }

      return true;
    });

    // 2. Ordinamento: dalle più recenti alle più vecchie
    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.data_riferimento ? new Date(a.data_riferimento).getTime() : 0;
      const dateB = b.data_riferimento ? new Date(b.data_riferimento).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return b.id - a.id;
    });

    // 3. Statistiche aggregate per tipologia
    const stats = {
      total: rawNotes.length,
      n1: rawNotes.filter((n) => n.tipo === 'N1').length,
      n2: rawNotes.filter((n) => n.tipo === 'N2').length,
      n3: rawNotes.filter((n) => n.tipo === 'N3').length,
      n4: rawNotes.filter((n) => n.tipo === 'N4').length,
    };

    // 4. Paginazione fluida a 12 note per pagina
    const { paginatedItems, totalPages: totalPagesCount } = paginate(sorted, currentPage, pageSize);

    return {
      filteredNotes: sorted,
      paginatedNotes: paginatedItems,
      totalPages: totalPagesCount,
      totalCount: sorted.length,
      stats,
    };
  }, [rawNotes, filters, currentPage, pageSize]);
};
