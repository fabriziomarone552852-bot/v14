// src/hooks/useHabits.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit as apiDeleteHabit,
  createHabitPeriod,
  updateHabitPeriod,
} from '@/api/habitsApi';
import type { Habit, HabitPeriod, SaveHabitPayload } from '@/types/habits';
import { invalidateAllViews } from '@/utils/queryCacheUtils';

export const HABITS_QUERY_KEY = ['habits'];

export const useHabits = () => {
  return useQuery<Habit[]>({
    queryKey: HABITS_QUERY_KEY,
    queryFn: getHabits,
  });
};

export const useSaveHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveHabitPayload) => {
      if (payload.existingId) {
        return await updateHabit(payload.existingId, payload.data);
      }
      return await createHabit(payload.data);
    },
    onMutate: async (payload) => {
      if (!payload.existingId) return;
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });
      const previousHabits = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY);

      queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, (old = []) =>
        old.map((h) => {
          if (h.id !== payload.existingId) return h;
          return {
            ...h,
            titolo: payload.data.titolo ?? h.titolo,
            rrule: payload.data.rrule !== undefined ? payload.data.rrule : h.rrule,
            immagine_url: payload.data.immagine_url !== undefined ? payload.data.immagine_url : h.immagine_url,
          };
        })
      );

      return { previousHabits };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(HABITS_QUERY_KEY, context.previousHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      invalidateAllViews(queryClient);
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiDeleteHabit(id);
      return id;
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });
      const previousHabits = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY);

      queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, (old = []) =>
        old.filter((h) => h.id !== id)
      );

      return { previousHabits };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(HABITS_QUERY_KEY, context.previousHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      invalidateAllViews(queryClient);
    },
  });
};

export const useSuspendHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      periodId,
      endDate,
    }: {
      habitId: number;
      periodId: number;
      endDate: string;
    }) => {
      return await updateHabitPeriod(habitId, periodId, { data_fine: endDate });
    },
    onMutate: async ({ habitId, periodId, endDate }) => {
      // 1. Blocca eventuali query concorrenti
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });

      // 2. Salva lo snapshot per rollback in caso di errore
      const previousHabits = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY);

      // 3. Aggiorna istantaneamente in RAM (0ms di latenza)
      queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, (old = []) => {
        return old.map((habit) => {
          if (habit.id !== habitId) return habit;
          return {
            ...habit,
            periods: (habit.periods || []).map((p) =>
              p.id === periodId || !p.data_fine
                ? { ...p, data_fine: endDate }
                : p
            ),
          };
        });
      });

      return { previousHabits };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(HABITS_QUERY_KEY, context.previousHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      invalidateAllViews(queryClient);
    },
  });
};

export const useResumeHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      target,
      startDate,
    }: {
      habitId: number;
      target: number;
      startDate: string;
    }) => {
      return await createHabitPeriod(habitId, { data_inizio: startDate, target });
    },
    onMutate: async ({ habitId, target, startDate }) => {
      // 1. Blocca eventuali query concorrenti
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });

      // 2. Snapshot per rollback
      const previousHabits = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY);

      // 3. Aggiorna istantaneamente in RAM aggiungendo il nuovo periodo attivo (0ms)
      queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, (old = []) => {
        return old.map((habit) => {
          if (habit.id !== habitId) return habit;
          const newPeriod: HabitPeriod = {
            id: Date.now(),
            habit_id: habitId,
            data_inizio: startDate,
            data_fine: null,
            target,
          };
          return {
            ...habit,
            periods: [...(habit.periods || []), newPeriod],
          };
        });
      });

      return { previousHabits };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(HABITS_QUERY_KEY, context.previousHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      invalidateAllViews(queryClient);
    },
  });
};
