import { api } from '@/api/apiService';
import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '@/types/categories';

export async function getCategories(): Promise<Category[]> {
  const data = await api.get<Category[] | { items?: Category[] }>('/categories');
  if (!data) return [];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getCategory(id: number): Promise<Category> {
  const data = await api.get<Category>(`/categories/${id}`);
  if (!data) throw new Error('Categoria non trovata');
  return data;
}

export async function createCategory(payload: CategoryCreatePayload): Promise<Category> {
  const data = await api.post<Category>('/categories', payload);
  if (!data) throw new Error('Errore nella creazione della categoria');
  return data;
}

export async function updateCategory(
  id: number,
  payload: CategoryUpdatePayload
): Promise<Category> {
  const data = await api.patch<Category>(`/categories/${id}`, payload);
  if (!data) throw new Error("Errore nell'aggiornamento della categoria");
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
