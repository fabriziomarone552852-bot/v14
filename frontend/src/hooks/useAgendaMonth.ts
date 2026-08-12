// frontend/src/hooks/useAgendaMonth.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useTaskMutations } from './mutations/useTaskMutations';
import { useNoteMutations } from './mutations/useNoteMutations';
import { useDailyEntryMutations } from './mutations/useDailyEntryMutations';
import { useEventMutations } from './mutations/useEventMutations';
import { useMonthlyEntryMutations } from './mutations/useMonthlyEntryMutations';
import type { SyncMonthResponse, DailyEntry } from '@/types';
import type { DbMonthlyEntry } from '@/types/monthlyentries';

// 1. IL CONTRATTO DELLA CACHE (Frontend Model)
// Estendiamo i dati grezzi del server aggiungendo i cassetti smistati
export interface MonthCacheData extends SyncMonthResponse {
  note: DailyEntry[];
  // Questi vengono ora da monthly_entries, non da daily_entries
  obiettivi: DbMonthlyEntry[];
  priorita: DbMonthlyEntry[];
  eventi_positivi: DbMonthlyEntry[];
  eventi_negativi: DbMonthlyEntry[];
}

export const useAgendaMonth = (startStr: string, endStr: string) => {
  const queryKey = ['monthSync', startStr, endStr];

  const taskMutations = useTaskMutations(['tasks']);
  const noteMutations = useNoteMutations<MonthCacheData>(queryKey);
  const entryMutations = useDailyEntryMutations<MonthCacheData>(queryKey);
  const eventMutations = useEventMutations<MonthCacheData>(queryKey);
  const monthlyMutations = useMonthlyEntryMutations(queryKey);

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async (): Promise<MonthCacheData> => {
      const data = await api.get<SyncMonthResponse>(`/sync/month?start_date=${startStr}&end_date=${endStr}`);

      if (!data) throw new Error('Impossibile caricare i dati mensili');

      // Salviamo solo i dati grezzi + note nella cache.
      // I cassetti derivati (obiettivi, priorita, ecc.) vengono calcolati
      // reattivamente con useMemo, così gli aggiornamenti ottimistici
      // su monthly_entries si riflettono ISTANTANEAMENTE.
      const entries = data.daily_entries || [];

      return {
        ...data,
        note: entries.filter(e => ['N1', 'N2', 'N3', 'N4'].includes(e.tipo)),
        // Inizializzati qui per il type system, ma il valore reale
        // arriva dal useMemo sotto
        obiettivi: [],
        priorita: [],
        eventi_positivi: [],
        eventi_negativi: [],
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  // 2. DERIVAZIONE REATTIVA — si aggiorna ISTANTANEAMENTE quando onMutate
  //    modifica monthly_entries nella cache (senza aspettare il server)
  const monthData = useMemo((): MonthCacheData | undefined => {
    if (!rawData) return undefined;
    const me = rawData.monthly_entries || [];
    return {
      ...rawData,
      obiettivi: me.filter(e => e.monthly_type === 'OM'),
      priorita: me.filter(e => e.monthly_type === 'PM'),
      eventi_positivi: me.filter(e => e.monthly_type === 'EP'),
      eventi_negativi: me.filter(e => e.monthly_type === 'EN'),
    };
  }, [rawData]);

  return {
    monthData,
    isLoading,
    isError,
    saveDailyEntry: entryMutations.saveDailyEntry,
    saveMonthlyEntry: monthlyMutations.saveMonthlyEntry,
    saveMonthlyEntryAsync: monthlyMutations.saveMonthlyEntryAsync,
    deleteMonthlyEntry: monthlyMutations.deleteMonthlyEntry,
    toggleTask: taskMutations.toggleTask,
    saveNote: noteMutations.saveNote,
    deleteNote: noteMutations.deleteNote,
    deleteEventFromCache: eventMutations.deleteEvent,
  };
};