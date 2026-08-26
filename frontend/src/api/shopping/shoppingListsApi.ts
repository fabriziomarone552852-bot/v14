// src/api/shopping/shoppingListsApi.ts
import type { InventoryBatchRow } from '@/types';
import type {
  ShoppingListCreatePayload,
  ShoppingListItem,
  ShoppingListItemCreatePayload,
  ShoppingListItemUpdatePayload,
  ShoppingListSummary,
  ShoppingListUpdatePayload,
} from '@/types/shopping';
import { apiRequest, toNumberOrNull } from './shoppingClient';

export type ShoppingListItemApi = {
  id: number;
  shopping_list_id: number;
  product_id: number;
  product_name: string;
  name_normalized: string;
  brand_id?: number | null;
  brand_name?: string | null;
  quantity?: number | string | null;
  unit_id?: number | null;
  unit_name?: string | null;
  unit_code_name?: string | null;
  notes?: string | null;
  is_purchased: boolean;
  inventory_batches?: InventoryBatchRow[];
  created_at?: string;
  updated_at?: string | null;
};

export type ShoppingListSummaryApi = {
  id: number;
  name: string;
  description?: string | null;
  group_id?: number | null;
  group_name?: string | null;
  visibility_id: number;
  visibility_code_name?: string | null;
  status_id?: number | null;
  status_code_name?: string | null;
  is_completed?: boolean | null;
  items?: ShoppingListItemApi[];
};

export function normalizeShoppingListItem(item: ShoppingListItemApi): ShoppingListItem {
  return {
    id: Number(item.id),
    shoppingListId: Number(item.shopping_list_id),
    productId: Number(item.product_id),
    productName: item.product_name,
    nameNormalized: item.name_normalized,
    brandId: item.brand_id ?? null,
    brandName: item.brand_name ?? null,
    quantity: toNumberOrNull(item.quantity),
    unitId: item.unit_id ?? null,
    unitCodeName: item.unit_code_name ?? item.unit_name ?? null,
    isPurchased: Boolean(item.is_purchased),
    notes: item.notes ?? null,
    inventoryBatches: item.inventory_batches ?? [],
    createdAt: item.created_at ?? undefined,
    updatedAt: item.updated_at ?? undefined,
  };
}

export function normalizeShoppingListSummary(
  list: ShoppingListSummaryApi
): ShoppingListSummary {
  const items = list.items ?? [];
  const openItemsCount = items.filter((item) => !item.is_purchased).length;
  const purchasedItemsCount = items.filter((item) => item.is_purchased).length;
  const totalItemsCount = items.length;

  return {
    id: Number(list.id),
    name: list.name,
    description: list.description ?? null,
    groupId: list.group_id ?? null,
    groupName: list.group_name ?? null,
    visibilityId: Number(list.visibility_id),
    visibilityCodeName: list.visibility_code_name ?? null,
    statusId: list.status_id ?? null,
    statusCodeName: list.status_code_name ?? null,
    openItemsCount,
    purchasedItemsCount,
    totalItemsCount,
    isCompleted: Boolean(list.is_completed),
    canEdit: true,
    canDelete: true,
    canArchive: false,
    items: (list.items ?? []).map(normalizeShoppingListItem),
  };
}

export function serializeShoppingListPayload(
  payload: ShoppingListCreatePayload | ShoppingListUpdatePayload
) {
  return {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.description !== undefined
      ? { description: payload.description }
      : {}),
    ...(payload.groupId !== undefined ? { group_id: payload.groupId } : {}),
    ...(payload.visibilityId !== undefined
      ? { visibility_id: payload.visibilityId }
      : {}),
    ...(payload.statusId !== undefined ? { status_id: payload.statusId } : {}),
    ...(payload.isCompleted !== undefined ? { is_completed: payload.isCompleted } : {}),
  };
}

export function serializeShoppingListItemCreatePayload(
  payload: ShoppingListItemCreatePayload
) {
  return {
    shopping_list_id: payload.shoppingListId,
    product_name: payload.productName,
    ...(payload.brandName !== undefined ? { brand_name: payload.brandName } : {}),
    ...(payload.brandId !== undefined ? { brand_id: payload.brandId } : {}),
    ...(payload.quantity !== undefined ? { quantity: payload.quantity } : {}),
    ...(payload.unitId !== undefined ? { unit_id: payload.unitId } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
  };
}

export function serializeShoppingListItemUpdatePayload(
  payload: ShoppingListItemUpdatePayload
) {
  return {
    ...(payload.productName !== undefined ? { product_name: payload.productName } : {}),
    ...(payload.brandName !== undefined ? { brand_name: payload.brandName } : {}),
    ...(payload.brandId !== undefined ? { brand_id: payload.brandId } : {}),
    ...(payload.quantity !== undefined ? { quantity: payload.quantity } : {}),
    ...(payload.unitId !== undefined ? { unit_id: payload.unitId } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
  };
}

export async function fetchShoppingLists(
  signal?: AbortSignal
): Promise<ShoppingListSummary[]> {
  const data = await apiRequest<ShoppingListSummaryApi[]>('/lists', {
    method: 'GET',
    signal,
  });

  return (data ?? []).map(normalizeShoppingListSummary);
}

export async function fetchShoppingListItems(
  listId: number,
  signal?: AbortSignal
): Promise<ShoppingListItem[]> {
  const data = await apiRequest<ShoppingListItemApi[]>('/items', {
    method: 'GET',
    params: { shopping_list_id: listId },
    signal,
  });

  return (data ?? []).map(normalizeShoppingListItem);
}

export async function createShoppingList(
  payload: ShoppingListCreatePayload
): Promise<ShoppingListSummary> {
  const data = await apiRequest<ShoppingListSummaryApi>('/lists', {
    method: 'POST',
    body: serializeShoppingListPayload(payload),
  });

  return normalizeShoppingListSummary(data);
}

export async function updateShoppingList(
  id: number,
  payload: ShoppingListUpdatePayload
): Promise<ShoppingListSummary> {
  const data = await apiRequest<ShoppingListSummaryApi>(`/lists/${id}`, {
    method: 'PATCH',
    body: serializeShoppingListPayload(payload),
  });

  return normalizeShoppingListSummary(data);
}

export async function deleteShoppingList(id: number): Promise<void> {
  await apiRequest<void>(`/lists/${id}`, {
    method: 'DELETE',
  });
}

export async function createShoppingListItem(
  payload: ShoppingListItemCreatePayload
): Promise<ShoppingListItem> {
  const data = await apiRequest<ShoppingListItemApi>('/items', {
    method: 'POST',
    body: serializeShoppingListItemCreatePayload(payload),
  });

  return normalizeShoppingListItem(data);
}

export async function updateShoppingListItem(
  id: number,
  _listId: number,
  payload: ShoppingListItemUpdatePayload
): Promise<ShoppingListItem> {
  const data = await apiRequest<ShoppingListItemApi>(`/items/${id}`, {
    method: 'PATCH',
    body: serializeShoppingListItemUpdatePayload(payload),
  });

  return normalizeShoppingListItem(data);
}

export async function deleteShoppingListItem(
  id: number
): Promise<void> {
  await apiRequest<void>(`/items/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleShoppingListItemPurchased(
  id: number,
  payload: { isPurchased: boolean }
): Promise<ShoppingListItem> {
  const data = await apiRequest<ShoppingListItemApi>(`/items/${id}`, {
    method: 'PATCH',
    body: { is_purchased: payload.isPurchased },
  });
  return normalizeShoppingListItem(data);
}
