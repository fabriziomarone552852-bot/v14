// src/hooks/useCountdownArchiveData.ts
import { useMemo } from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import type { CountdownFilterState } from '@/components/countdowns/CountdownFilterModal';

interface UseCountdownArchiveDataOptions {
  rawCountdowns: CountdownItem[];
  filters: CountdownFilterState;
  currentPage: number;
  pageSize?: number;
}

export interface CountdownArchiveDataResult {
  filteredCountdowns: CountdownItem[];
  paginatedCountdowns: CountdownItem[];
  totalPages: number;
  totalCount: number;
  activeCount: number;
  expiredCount: number;
}

export const useCountdownArchiveData = ({
  rawCountdowns,
  filters,
  currentPage,
  pageSize = 12,
}: UseCountdownArchiveDataOptions): CountdownArchiveDataResult => {
  return useMemo(() => {
    const nowTime = Date.now();

    // 1. Statistiche
    const totalCount = rawCountdowns.length;
    const activeCount = rawCountdowns.filter((cd) => {
      const t = new Date(cd.targetDateStr).getTime();
      return !isNaN(t) && t > nowTime;
    }).length;
    const expiredCount = totalCount - activeCount;

    // 2. Filtri in RAM
    const filtered = rawCountdowns.filter((cd) => {
      const cdTime = new Date(cd.targetDateStr).getTime();
      const isExpired = isNaN(cdTime) || cdTime <= nowTime;

      // Filtro Stato (Tutti / Solo Attivi / Solo Scaduti)
      if (filters.status === 'active' && isExpired) return false;
      if (filters.status === 'expired' && !isExpired) return false;

      // Filtro per Parola Chiave (Titolo)
      if (filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        const matchTitle = cd.title ? cd.title.toLowerCase().includes(q) : false;
        if (!matchTitle) return false;
      }

      // Filtro per Periodo di Scadenza (Da Data a Data)
      if (cd.targetDateStr) {
        const cdDateSub = cd.targetDateStr.substring(0, 10);
        if (filters.dateFrom && cdDateSub < filters.dateFrom) return false;
        if (filters.dateTo && cdDateSub > filters.dateTo) return false;
      }

      return true;
    });

    // 3. Ordinamento dal più prossimo al più remoto
    const sorted = [...filtered].sort((a, b) => {
      const timeA = new Date(a.targetDateStr).getTime() || 0;
      const timeB = new Date(b.targetDateStr).getTime() || 0;
      return timeA - timeB;
    });

    // 4. Paginazione
    const totalPagesCount = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(currentPage, totalPagesCount);
    const startIdx = (safePage - 1) * pageSize;
    const paginated = sorted.slice(startIdx, startIdx + pageSize);

    return {
      filteredCountdowns: sorted,
      paginatedCountdowns: paginated,
      totalPages: totalPagesCount,
      totalCount,
      activeCount,
      expiredCount,
    };
  }, [rawCountdowns, filters, currentPage, pageSize]);
};
