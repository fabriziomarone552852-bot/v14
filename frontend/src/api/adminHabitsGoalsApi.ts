// src/api/adminHabitsGoalsApi.ts
import { apiClient } from './client';

export interface AdminHabitItem {
  id: number;
  user_id: number;
  username?: string | null;
  titolo: string;
  tipo: 'A' | 'R'; // 'A' = Abitudine, 'R' = Routine
  rrule?: string | null;
  target: number;
  logs_count: number;
}

export interface AdminHabitUpdatePayload {
  titolo?: string;
  tipo?: 'A' | 'R';
  rrule?: string | null;
  target?: number;
}

export interface AdminCountdownItem {
  id: number;
  user_id: number;
  username?: string | null;
  title: string;
  target_date: string;
  status: 'active' | 'closed';
  created_at: string;
  closed_at?: string | null;
}

export interface AdminCountdownUpdatePayload {
  title?: string;
  target_date?: string;
  status?: 'active' | 'closed';
}

// -------------------------------------------------------------
// HABITS & ROUTINES
// -------------------------------------------------------------

export async function fetchAdminHabits(): Promise<AdminHabitItem[]> {
  const res = await apiClient.get<AdminHabitItem[]>('/admin/habits');
  return res.data;
}

export async function updateAdminHabit(
  habitId: number,
  payload: AdminHabitUpdatePayload
): Promise<AdminHabitItem> {
  const res = await apiClient.patch<AdminHabitItem>(`/admin/habits/${habitId}`, payload);
  return res.data;
}

export async function deleteAdminHabit(habitId: number): Promise<void> {
  await apiClient.delete(`/admin/habits/${habitId}`);
}

// -------------------------------------------------------------
// COUNTDOWNS
// -------------------------------------------------------------

export async function fetchAdminCountdowns(): Promise<AdminCountdownItem[]> {
  const res = await apiClient.get<AdminCountdownItem[]>('/admin/countdowns');
  return res.data;
}

export async function updateAdminCountdown(
  countdownId: number,
  payload: AdminCountdownUpdatePayload
): Promise<AdminCountdownItem> {
  const res = await apiClient.patch<AdminCountdownItem>(`/admin/countdowns/${countdownId}`, payload);
  return res.data;
}

export async function deleteAdminCountdown(countdownId: number): Promise<void> {
  await apiClient.delete(`/admin/countdowns/${countdownId}`);
}
