// src/hooks/useAgendaDay.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { DbTask, SyncDayResponse, Countdown } from '@/types';
import { useTaskMutations } from './mutations/useTaskMutations';
import { useNoteMutations } from './mutations/useNoteMutations';
import { useDailyEntryMutations } from './mutations/useDailyEntryMutations';
import { useEventMutations } from './mutations/useEventMutations';
import { useHabitDayMutations } from './mutations/useHabitDayMutations';

export interface SaveCountdownPayload {
  id?: number;
  title: string;
  targetDateStr: string;
  imageUrl?: string | null;
  immaginePosizione?: string | null;
}

export const useAgendaDay = (dateStr: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['daySync', dateStr];

  const noteMutations = useNoteMutations<SyncDayResponse>(queryKey);
  const { toggleTask } = useTaskMutations(['tasks']);
  const entryMutations = useDailyEntryMutations<SyncDayResponse>(queryKey);
  const eventMutations = useEventMutations<SyncDayResponse>(queryKey);
  const habitMutations = useHabitDayMutations(queryKey, dateStr);

  const { data: dayData, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async (): Promise<SyncDayResponse> => {
      const response = await api.get(`/sync/day?data_riferimento=${dateStr}`);
      
      if (!response) throw new Error('Impossibile caricare i dati della giornata');

      const rawData = response as SyncDayResponse;

      // 🪄 Normalizzazione dati: garantisce che array annidati esistano sempre
      return {
        ...rawData,
        events: rawData?.events ?? [],
        countdowns: rawData?.countdowns ?? [],
        obiettivi: rawData?.obiettivi ?? [],
        priorita: rawData?.priorita ?? [],
        note: rawData?.note ?? [],
        
        tasks: (rawData?.tasks ?? []).map((t: DbTask) => ({
          ...t,
          subtasks: t.subtasks ?? [] 
        })),

        habits: (rawData?.habits ?? []).map((h) => ({
          ...h,
          periods: h.periods ?? [], 
          logs: h.logs ?? []        
        }))
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  // --- COUNTDOWN ---
  const saveCountdownMutation = useMutation({
    mutationFn: async (countdown: SaveCountdownPayload) => {
      const isUpdate = countdown.id && countdown.id < 1000000000;
      const payload = {
        title: countdown.title ?? 'Nuovo Countdown',
        target_date: countdown.targetDateStr ?? new Date().toISOString(),
        immagine_url: countdown.imageUrl ?? null,
        immagine_posizione: countdown.immaginePosizione ?? null
      };
      const result = isUpdate
        ? await api.patch<Countdown>(`/countdowns/${countdown.id}`, payload)
        : await api.post<Countdown>('/countdowns', payload);

      if (!result) throw new Error('Errore nel salvataggio del countdown');
      return result;
    },
    onSuccess: (savedCountdown) => {
      queryClient.setQueryData<SyncDayResponse>(queryKey, (old) => {
        if (!old) return old;
        const currentCountdowns = old.countdowns ?? [];
        const exists = currentCountdowns.some((c) => c.id === savedCountdown.id);
        return {
          ...old,
          countdowns: exists 
            ? currentCountdowns.map((c) => (c.id === savedCountdown.id ? savedCountdown : c)) 
            : [...currentCountdowns, savedCountdown]
        };
      });
    }
  });

  const deleteCountdownMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/countdowns/${id}`);
      return id;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<SyncDayResponse>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, countdowns: (old.countdowns ?? []).filter((c) => c.id !== deletedId) };
      });
    }
  });

  return {
    dayData,
    isLoading,
    isError,
    toggleTask,
    deleteEvent: eventMutations.deleteEvent,
    saveNote: noteMutations.saveNote,
    deleteNote: noteMutations.deleteNote,
    saveCountdown: saveCountdownMutation.mutateAsync,
    deleteCountdown: deleteCountdownMutation.mutateAsync,
    // Habit/Routine — ora gestite da useHabitDayMutations
    saveHabit: habitMutations.saveHabit,
    deleteHabit: habitMutations.deleteHabit,
    suspendHabit: habitMutations.suspendHabit,
    resumeHabit: habitMutations.resumeHabit,
    updateHabitPeriod: habitMutations.updateHabitPeriod,
    updateHabitLog: habitMutations.updateHabitLog,
    updateHabitCount: habitMutations.updateHabitLog, // @deprecated — alias di updateHabitLog
    saveObiettivo: (data: { id?: number; text: string }) =>
       entryMutations.saveDailyEntry({ id: data.id, tipo: 'OD', text: data.text, dateStr }),
    savePriorita: (data: { id?: number; text: string }) =>
       entryMutations.saveDailyEntry({ id: data.id, tipo: 'PD', text: data.text, dateStr }),
  };
};