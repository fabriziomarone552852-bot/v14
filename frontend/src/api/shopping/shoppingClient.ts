// src/api/shopping/shoppingClient.ts
import { api } from '@/api/apiService';

export const SHOPPING_API_BASE = '/shopping';

export async function apiRequest<T>(
  path: string,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: Record<string, unknown>;
    signal?: AbortSignal;
  } = { method: 'GET' }
): Promise<T> {
  const fullPath = `${SHOPPING_API_BASE}${path}`;
  const { method, body, params, signal } = options;

  switch (method) {
    case 'POST':   return (await api.post<T>(fullPath, body, { params, signal }))!;
    case 'PATCH':  return (await api.patch<T>(fullPath, body, { params, signal }))!;
    case 'PUT':    return (await api.put<T>(fullPath, body, { params, signal }))!;
    case 'DELETE': await api.delete(fullPath, { params, signal }); return undefined as unknown as T;
    default:       return (await api.get<T>(fullPath, { params, signal }))!;
  }
}

export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export const shoppingQueryKeys = {
  all: ['shopping'] as const,

  lists: () => [...shoppingQueryKeys.all, 'lists'] as const,
  list: (listId: number) => [...shoppingQueryKeys.all, 'lists', listId] as const,

  groups: () => [...shoppingQueryKeys.all, 'groups'] as const,
  group: (groupId: number) => [...shoppingQueryKeys.all, 'groups', groupId] as const,

  items: (listId: number | null) =>
    [...shoppingQueryKeys.all, 'items', listId] as const,

  suppliers: () => [...shoppingQueryKeys.all, 'suppliers'] as const,
  supplier: (supplierId: number) =>
    [...shoppingQueryKeys.all, 'suppliers', supplierId] as const,

  brands: () => [...shoppingQueryKeys.all, 'brands'] as const,
  brand: (brandId: number) =>
    [...shoppingQueryKeys.all, 'brands', brandId] as const,

  config: () => [...shoppingQueryKeys.all, 'config'] as const,
  products: () => [...shoppingQueryKeys.all, 'products'] as const,
  groupMembers: (groupId: number) =>
    [...shoppingQueryKeys.all, 'groups', groupId, 'members'] as const,
  allBatches: () => [...shoppingQueryKeys.all, 'batches', 'all'] as const,
} as const;
