// frontend/src/hooks/useAgendaYear.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { yearlyEntriesApi } from '@/api/yearlyEntriesApi';
import { bingoApi } from '@/api/bingoApi';
import type { DbYearlyEntry, DbBingoEntry } from '@/types/yearlyentries';
import type { DbEvent } from '@/types/events';
import type { DbTask } from '@/types/tasks';
import type { DailyEntry } from '@/types/dailyentries';
import type { Habit } from '@/types/habits';
import { getHabits } from '@/api/habitsApi';

export interface SyncYearResponse {
  year: number;
  entries: DbYearlyEntry[];
  bingo: DbBingoEntry[];
  events: DbEvent[];
  tasks: DbTask[];
  dailyEntries: DailyEntry[];
  habits: Habit[];
}

export const fetchYearData = async (year: number): Promise<SyncYearResponse> => {
  const startStr = `${year}-01-01`;
  const endStr = `${year}-12-31`;

  const [entries, bingoRaw, eventsRaw, tasksRaw, dailyEntriesRaw, habitsRaw] = await Promise.all([
    yearlyEntriesApi.getAll(year),
    bingoApi.getAll(year),
    api.get<{ items?: DbEvent[] } | DbEvent[]>(`/events?start_date=${startStr}&end_date=${endStr}`),
    api.get<{ items?: DbTask[] } | DbTask[]>('/tasks'),
    api.get<DailyEntry[]>(`/daily-entries?start_date=${startStr}&end_date=${endStr}`),
    getHabits(),
  ]);

  const events = Array.isArray(eventsRaw) ? eventsRaw : (eventsRaw?.items ?? []);
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw?.items ?? []);
  const bingo = (bingoRaw || []).sort((a, b) => (a.posizione ?? a.id) - (b.posizione ?? b.id));
  const dailyEntries = Array.isArray(dailyEntriesRaw) ? dailyEntriesRaw.filter(e => e.tipo === 'PX') : [];
  const habits = Array.isArray(habitsRaw) ? habitsRaw : [];

  return {
    year,
    entries: entries || [],
    bingo: bingo || [],
    events: events || [],
    tasks: tasks || [],
    dailyEntries,
    habits,
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
