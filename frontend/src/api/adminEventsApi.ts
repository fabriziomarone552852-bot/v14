// src/api/adminEventsApi.ts
import { apiClient } from './client';

export interface AdminEventItem {
  id: number;
  user_id: number;
  username: string;
  titolo: string;
  descrizione?: string | null;
  data_inizio: string;
  data_fine?: string | null;
  tutto_il_giorno: boolean;
  luogo?: string | null;
  user_category_id?: number | null;
  category_name?: string | null;
  rrule?: string | null;
}

export interface AdminEventUpdatePayload {
  titolo?: string;
  descrizione?: string | null;
  data_inizio?: string;
  data_fine?: string | null;
  tutto_il_giorno?: boolean;
  luogo?: string | null;
  user_category_id?: number | null;
  user_id?: number;
  rrule?: string | null;
}

export interface AdminCategoryOption {
  id: number;
  user_id: number;
  username?: string | null;
  category_name: string;
  colore?: string | null;
  genre: number;
}

export async function fetchAdminEvents(userId?: number): Promise<AdminEventItem[]> {
  const res = await apiClient.get<AdminEventItem[]>('/admin/events', {
    params: userId ? { user_id: userId } : undefined,
  });
  return res.data;
}

export async function updateAdminEvent(
  eventId: number,
  payload: AdminEventUpdatePayload
): Promise<AdminEventItem> {
  const res = await apiClient.patch<AdminEventItem>(`/admin/events/${eventId}`, payload);
  return res.data;
}

export async function deleteAdminEvent(eventId: number): Promise<void> {
  await apiClient.delete(`/admin/events/${eventId}`);
}

export async function fetchAdminCategories(): Promise<AdminCategoryOption[]> {
  const res = await apiClient.get<AdminCategoryOption[]>('/admin/categories');
  return res.data;
}
