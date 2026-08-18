// src/api/habits.ts
import { api } from '@/api/apiService';
import type { Habit, HabitPeriod, SaveHabitPayload } from '@/types/habits';

export const getHabits = async (): Promise<Habit[]> => {
  const data = await api.get<Habit[]>('/habits');
  return Array.isArray(data) ? data : [];
};

export const getHabit = async (id: number): Promise<Habit> => {
  return await api.get<Habit>(`/habits/${id}`);
};

export const createHabit = async (payload: SaveHabitPayload['data']): Promise<Habit> => {
  const { data_inizio, target_completamenti, data_fine, periodId, periods, ...baseData } = payload;
  const initialPeriods = periods && periods.length > 0
    ? periods
    : [{ data_inizio: data_inizio || new Date().toISOString().substring(0, 10), target: target_completamenti || 1 }];

  return await api.post<Habit>('/habits', {
    ...baseData,
    periods: initialPeriods,
  });
};

export const updateHabit = async (id: number, payload: Partial<SaveHabitPayload['data']>): Promise<Habit> => {
  const { data_inizio, target_completamenti, data_fine, periodId, periods, ...baseData } = payload;
  return await api.patch<Habit>(`/habits/${id}`, baseData);
};

export const deleteHabit = async (id: number): Promise<void> => {
  await api.delete(`/habits/${id}`);
};

export const createHabitPeriod = async (
  habitId: number,
  payload: { data_inizio: string; target: number }
): Promise<HabitPeriod> => {
  return await api.post<HabitPeriod>(`/habits/${habitId}/periods`, payload);
};

export const updateHabitPeriod = async (
  habitId: number,
  periodId: number,
  payload: { data_fine?: string | null; target?: number }
): Promise<HabitPeriod> => {
  return await api.patch<HabitPeriod>(`/habits/${habitId}/periods/${periodId}`, payload);
};
