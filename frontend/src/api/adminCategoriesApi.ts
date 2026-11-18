// src/api/adminCategoriesApi.ts
import { apiClient } from './client';

export type CategoryGenreCode = 1 | 2 | 3 | 4 | 5;

export interface AdminCategoryItem {
  id: number;
  user_id: number;
  username?: string | null;
  category_name: string;
  colore?: string | null;
  genre: CategoryGenreCode;
  tasks_count: number;
  events_count: number;
}

export interface AdminCategoryUpdatePayload {
  category_name?: string;
  colore?: string | null;
  genre?: CategoryGenreCode;
}

export async function fetchAdminCategories(): Promise<AdminCategoryItem[]> {
  const res = await apiClient.get<AdminCategoryItem[]>('/admin/categories');
  return res.data;
}

export async function updateAdminCategory(
  categoryId: number,
  payload: AdminCategoryUpdatePayload
): Promise<AdminCategoryItem> {
  const res = await apiClient.patch<AdminCategoryItem>(`/admin/categories/${categoryId}`, payload);
  return res.data;
}

export async function deleteAdminCategory(categoryId: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${categoryId}`);
}
