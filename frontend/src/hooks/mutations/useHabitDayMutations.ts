// src/hooks/mutations/useHabitDayMutations.ts
//
// Estrae le 6 mutation habit/routine da useAgendaDay.ts,
// in modo analogo a useTaskMutations, useNoteMutations, useEventMutations.
// Responsabilità: operazioni CRUD su habit, routine e HabitLog per una singola giornata.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { findActivePeriod } from '@/utils/habitUtils';
import type { Habit, HabitLog, SyncDayResponse, SaveHabitPayload } from '@/types';
import { logger } from '@/utils/logger';

export const useHabitDayMutations = (queryKey: string[], dateStr: string) => {
  const queryClient = useQueryClient();

  // --- 1. SALVA HABIT / ROUTINE ---
  const saveHabitMutation = useMutation({
    mutationFn: async (payload: SaveHabitPayload) => {
      const { data_inizio, target_completamenti, data_fine, periodId, periods, ...baseData } = payload.data;
      const initialPeriods =
        periods && periods.length > 0
          ? periods
          : [{ data_inizio: data_inizio || dateStr, target: target_completamenti || 1 }];
      const result = payload.existingId
        ? await api.patch<Habit>(`/habits/${payload.existingId}`, baseData)
        : await api.post<Habit>('/habits', { ...baseData, periods: initialPeriods });

      if (!result) throw new Error("Errore nel salvataggio dell'abitudine");
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // --- 2. ELIMINA HABIT / ROUTINE ---
  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/habits/${id}`);
      return id;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<SyncDayResponse>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, habits: (old.habits ?? []).filter((h) => h.id !== deletedId) };
      });
    },
  });

  // --- 3. SOSPENDI ROUTINE ---
  const suspendHabitMutation = useMutation({
    mutationFn: async ({ habitId, periodId, endDate }: { habitId: number; periodId: number; endDate: string }) => {
      const result = await api.patch(`/habits/${habitId}/periods/${periodId}`, { data_fine: endDate });
      if (!result) throw new Error('Errore durante la sospensione');
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // --- 4. RIPRENDI ROUTINE ---
  const resumeHabitMutation = useMutation({
    mutationFn: async ({ habitId, target, startDate }: { habitId: number; target: number; startDate: string }) => {
      const result = await api.post(`/habits/${habitId}/periods`, { data_inizio: startDate, target });
      if (!result) throw new Error('Errore durante la ripresa');
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // --- 5. AGGIORNA PERIODO (TARGET) ---
  const updateHabitPeriodMutation = useMutation({
    mutationFn: async ({ habitId, periodId, target }: { habitId: number; periodId: number; target: number }) => {
      const result = await api.patch(`/habits/${habitId}/periods/${periodId}`, { target });
      if (!result) throw new Error('Errore aggiornamento periodo');
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // --- 6. AGGIORNA LOG GIORNALIERO (ottimistico) ---
  const updateHabitLogMutation = useMutation({
    mutationFn: async ({ habitId, delta }: { habitId: number; delta: number }) => {
      const endpoint =
        delta > 0 ? `/habit-log?habit_id=${habitId}` : `/habit-log/decrement?habit_id=${habitId}`;
      await api.post(endpoint, { data_riferimento: dateStr });
      return { habitId, delta };
    },
    onMutate: async ({ habitId, delta }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: SyncDayResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          habits: (old.habits || []).map((h: Habit) => {
            if (h.id !== habitId) return h;

            const currentLog =
              (h.logs || []).find((l: HabitLog) => l.data_riferimento === dateStr) ?? { count: 0 };
            const newLogs = (h.logs || []).filter((l: HabitLog) => l.data_riferimento !== dateStr);

            // Usa findActivePeriod invece della logica inline duplicata
            const activePeriod = findActivePeriod(h.periods ?? [], dateStr) ?? h.periods?.[0];
            const maxTarget = activePeriod?.target ?? 1;
            const nextCount = Math.min(maxTarget, Math.max(0, (currentLog.count ?? 0) + delta));

            if (nextCount > 0) {
              newLogs.push({
                ...currentLog,
                habit_id: habitId,
                data_riferimento: dateStr,
                count: nextCount,
              } as HabitLog);
            }

            return { ...h, logs: newLogs };
          }),
        };
      });

      return { previousData };
    },
    onError: (err, _variables, context) => {
      logger.error("Errore del server durante l'aggiornamento del log habit!", err);
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey });
      if (variables?.habitId) {
        queryClient.invalidateQueries({ queryKey: ['habitLogs', variables.habitId] });
      }
    },
  });

  return {
    saveHabit: saveHabitMutation.mutateAsync,
    deleteHabit: deleteHabitMutation.mutateAsync,
    suspendHabit: suspendHabitMutation.mutateAsync,
    resumeHabit: resumeHabitMutation.mutateAsync,
    updateHabitPeriod: updateHabitPeriodMutation.mutateAsync,
    updateHabitLog: updateHabitLogMutation.mutateAsync,
  };
};
