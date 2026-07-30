import { apiUrl } from '@/api/client';
import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '@/types/categories';

export async function getCategories(token: string): Promise<Category[]> {
  const res = await fetch(apiUrl('/categories'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Errore nel caricamento delle categorie');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(text || 'Risposta non JSON da /categories');
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function getCategory(
  token: string,
  id: number
): Promise<Category> {
  const res = await fetch(apiUrl(`/categories/${id}`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || 'Errore nel caricamento della categoria');
  }

  return JSON.parse(text) as Category;
}

export async function createCategory(
  token: string,
  payload: CategoryCreatePayload
): Promise<Category> {
  const res = await fetch(apiUrl('/categories'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || 'Errore nella creazione della categoria');
  }

  return JSON.parse(text) as Category;
}

export async function updateCategory(
  token: string,
  id: number,
  payload: CategoryUpdatePayload
): Promise<Category> {
  const res = await fetch(apiUrl(`/categories/${id}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Errore nell'aggiornamento della categoria");
  }

  return JSON.parse(text) as Category;
}