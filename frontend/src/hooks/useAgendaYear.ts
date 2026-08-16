// frontend/src/hooks/useAgendaYear.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { yearlyEntriesApi } from '@/api/yearlyEntriesApi';
import { bingoApi } from '@/api/bingoApi';
import type { DbYearlyEntry, DbBingoEntry } from '@/types/yearlyentries';
import type { DbEvent } from '@/types/events';
import type { DbTask } from '@/types/tasks';

export interface SyncYearResponse {
  year: number;
  entries: DbYearlyEntry[];
  bingo: DbBingoEntry[];
  events: DbEvent[];
  tasks: DbTask[];
}

export const fetchYearData = async (year: number): Promise<SyncYearResponse> => {
  const startStr = `${year}-01-01`;
  const endStr = `${year}-12-31`;

  const [entries, bingoRaw, eventsRaw, tasksRaw] = await Promise.all([
    yearlyEntriesApi.getAll(year),
    bingoApi.getAll(year),
    api.get<{ items?: DbEvent[] } | DbEvent[]>(`/events?start_date=${startStr}&end_date=${endStr}`),
    api.get<{ items?: DbTask[] } | DbTask[]>('/tasks'),
  ]);

  const events = Array.isArray(eventsRaw) ? eventsRaw : (eventsRaw?.items ?? []);
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw?.items ?? []);
  const bingo = (bingoRaw || []).sort((a, b) => (a.posizione ?? a.id) - (b.posizione ?? b.id));

  return {
    year,
    entries: entries || [],
    bingo: bingo || [],
    events: events || [],
    tasks: tasks || [],
  };
};

export const useAgendaYear = (year: number) => {
  const queryClient = useQueryClient();
  const queryKey = ['yearSync', year];

  // 1. QUERY UNIFICATA DELL'ANNO (Esattamente come monthSync, weekSync e daySync)
  const { data: yearData, isLoading, isError } = useQuery<SyncYearResponse>({
    queryKey,
    queryFn: () => fetchYearData(year),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  // 2. PREFETCHING DEGLI ANNI ADIACENTI (Mazzo di Carte in RAM)
  useEffect(() => {
    const nextYear = year + 1;
    const prevYear = year - 1;

    queryClient.prefetchQuery({
      queryKey: ['yearSync', nextYear],
      queryFn: () => fetchYearData(nextYear),
      staleTime: 5 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: ['yearSync', prevYear],
      queryFn: () => fetchYearData(prevYear),
      staleTime: 5 * 60 * 1000,
    });
  }, [year, queryClient]);

  return {
    yearData,
    isLoading,
    isError,
    queryKey,
  };
};
