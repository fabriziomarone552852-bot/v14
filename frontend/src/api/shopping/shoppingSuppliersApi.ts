// src/api/shopping/shoppingSuppliersApi.ts
import type {
  ShoppingSupplierCreatePayload,
  ShoppingSupplierOption,
  ShoppingSupplierUpdatePayload,
} from '@/types/shopping';
import { apiRequest } from './shoppingClient';

export type ShoppingSupplierOptionApi = {
  id: number;
  name: string;
  type_code?: number;
  status_id?: number | null;
  status_code_name?: string | null;
  is_active?: boolean;
};

export function normalizeShoppingSupplierOption(
  supplier: ShoppingSupplierOptionApi
): ShoppingSupplierOption {
  return {
    id: Number(supplier.id),
    name: supplier.name,
    typeCode: supplier.type_code ?? 1,
    statusId: supplier.status_id ?? null,
    statusCodeName: supplier.status_code_name ?? null,
    isActive: supplier.is_active ?? true,
  };
}

export function serializeShoppingSupplierPayload(
  payload: ShoppingSupplierCreatePayload | ShoppingSupplierUpdatePayload
) {
  return {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.typeCode !== undefined ? { type_code: payload.typeCode } : {}),
    ...(payload.statusId !== undefined ? { status_id: payload.statusId } : {}),
  };
}

export async function fetchShoppingSuppliers(
  signal?: AbortSignal
): Promise<ShoppingSupplierOption[]> {
  const data = await apiRequest<ShoppingSupplierOptionApi[]>('/suppliers', {
    method: 'GET',
    params: { type_code: 1 },
    signal,
  });

  return (data ?? []).map(normalizeShoppingSupplierOption);
}

export async function fetchShoppingBrands(
  signal?: AbortSignal
): Promise<ShoppingSupplierOption[]> {
  const data = await apiRequest<ShoppingSupplierOptionApi[]>('/brands', {
    method: 'GET',
    params: { limit: 100 },
    signal,
  });

  return (data ?? []).map(normalizeShoppingSupplierOption);
}

export async function createShoppingSupplier(
  payload: ShoppingSupplierCreatePayload
): Promise<ShoppingSupplierOption> {
  const data = await apiRequest<ShoppingSupplierOptionApi>('/suppliers', {
    method: 'POST',
    body: serializeShoppingSupplierPayload(payload),
  });

  return normalizeShoppingSupplierOption(data);
}

export async function updateShoppingSupplier(
  id: number,
  payload: ShoppingSupplierUpdatePayload
): Promise<ShoppingSupplierOption> {
  const data = await apiRequest<ShoppingSupplierOptionApi>(`/suppliers/${id}`, {
    method: 'PATCH',
    body: serializeShoppingSupplierPayload(payload),
  });

  return normalizeShoppingSupplierOption(data);
}

export async function deleteShoppingSupplier(id: number): Promise<void> {
  await apiRequest<void>(`/suppliers/${id}`, {
    method: 'DELETE',
  });
}
