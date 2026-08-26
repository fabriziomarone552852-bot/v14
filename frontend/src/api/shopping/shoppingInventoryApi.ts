// src/api/shopping/shoppingInventoryApi.ts
import type {
  InventoryBatchCreatePayload,
  ItemBatchRecord,
  CommunityPriceRecord,
} from '@/types/shopping';
export type { ItemBatchRecord, CommunityPriceRecord };
import { apiRequest } from './shoppingClient';

export function serializeInventoryBatchCreatePayload(
  payload: InventoryBatchCreatePayload
) {
  return {
    ...(payload.productId !== undefined ? { product_id: payload.productId } : {}),
    ...(payload.brandId !== undefined ? { brand_id: payload.brandId } : {}),
    ...(payload.brandName !== undefined ? { brand_name: payload.brandName } : {}),
    quantity_purchased: payload.quantity ?? 1,
    purchase_price: payload.purchasePrice,
    purchase_date: payload.purchaseDate,
    ...(payload.supplierId !== undefined
      ? { supplier_id: payload.supplierId }
      : {}),
    ...(payload.expirationDate !== undefined
      ? { expiration_date: payload.expirationDate }
      : {}),
    is_on_sale: payload.offerFlagId !== undefined || payload.isOnSale === true,
  };
}

export async function addInventoryBatch(
  itemId: number,
  payload: InventoryBatchCreatePayload
): Promise<void> {
  await apiRequest<void>(`/items/${itemId}/inventory-batches`, {
    method: 'POST',
    body: serializeInventoryBatchCreatePayload(payload),
  });
}

export async function deleteInventoryBatch(batchId: number): Promise<void> {
  await apiRequest<void>(`/inventory-batches/${batchId}`, {
    method: 'DELETE',
  });
}

export async function fetchItemBatches(itemId: number): Promise<ItemBatchRecord[]> {
  const data = await apiRequest<{
    id: number;
    product_id?: number | null;
    product_name?: string | null;
    brand_id?: number | null;
    brand_name?: string | null;
    purchase_date: string;
    quantity_purchased: number;
    purchase_price: number;
    unit_price: number | null;
    supplier_id: number | null;
    supplier_name: string | null;
    unit_name: string | null;
    list_name: string | null;
    is_on_sale: boolean;
  }[]>(`/items/${itemId}/inventory-batches`, { method: 'GET' });
  return (data ?? []).map((b) => ({
    id: b.id,
    productId: b.product_id ?? null,
    productName: b.product_name ?? null,
    brandId: b.brand_id ?? null,
    brandName: b.brand_name ?? null,
    purchaseDate: b.purchase_date,
    quantityPurchased: Number(b.quantity_purchased),
    purchasePrice: Number(b.purchase_price),
    unitPrice: b.unit_price != null ? Number(b.unit_price) : null,
    supplierId: b.supplier_id,
    supplierName: b.supplier_name,
    unitName: b.unit_name,
    listName: b.list_name,
    isOnSale: b.is_on_sale,
  }));
}

export async function fetchAllInventoryBatches(signal?: AbortSignal): Promise<ItemBatchRecord[]> {
  const data = await apiRequest<{
    id: number;
    product_id?: number | null;
    product_name?: string | null;
    brand_id?: number | null;
    brand_name?: string | null;
    purchase_date: string;
    quantity_purchased: number;
    purchase_price: number;
    unit_price: number | null;
    supplier_id: number | null;
    supplier_name: string | null;
    unit_name: string | null;
    list_name: string | null;
    is_on_sale: boolean;
  }[]>('/inventory-batches', { method: 'GET', signal });
  return (data ?? []).map((b) => ({
    id: b.id,
    productId: b.product_id ?? null,
    productName: b.product_name ?? null,
    brandId: b.brand_id ?? null,
    brandName: b.brand_name ?? null,
    purchaseDate: b.purchase_date,
    quantityPurchased: Number(b.quantity_purchased),
    purchasePrice: Number(b.purchase_price),
    unitPrice: b.unit_price != null ? Number(b.unit_price) : null,
    supplierId: b.supplier_id,
    supplierName: b.supplier_name,
    unitName: b.unit_name,
    listName: b.list_name,
    isOnSale: b.is_on_sale,
  }));
}

export async function fetchCommunityPrices(productId: number): Promise<CommunityPriceRecord[]> {
  const data = await apiRequest<{
    purchase_date: string;
    unit_price: number;
    supplier_id: number | null;
    supplier_name: string | null;
    brand_id?: number | null;
    brand_name?: string | null;
    unit_name: string | null;
    is_on_sale: boolean;
  }[]>(`/products/${productId}/community-prices`, { method: 'GET' });
  return (data ?? []).map((p) => ({
    purchaseDate: p.purchase_date,
    unitPrice: Number(p.unit_price),
    supplierId: p.supplier_id,
    supplierName: p.supplier_name,
    brandId: p.brand_id ?? null,
    brandName: p.brand_name ?? null,
    unitName: p.unit_name,
    isOnSale: p.is_on_sale,
  }));
}

export async function addShoppingPrice(_payload: unknown): Promise<void> {
  throw new Error('addShoppingPrice non supportato: usare addInventoryBatch.');
}

export async function createQuickPriceBatch(
  payload: import('@/types/shopping').QuickPriceBatchCreatePayload
): Promise<ItemBatchRecord[]> {
  const data = await apiRequest<{
    id: number;
    product_id?: number | null;
    product_name?: string | null;
    brand_id?: number | null;
    brand_name?: string | null;
    purchase_date: string;
    quantity_purchased: number;
    purchase_price: number;
    unit_price: number | null;
    supplier_id: number | null;
    supplier_name: string | null;
    unit_name: string | null;
    list_name: string | null;
    is_on_sale: boolean;
  }[]>('/inventory-batches/quick-add', {
    method: 'POST',
    body: {
      records: payload.records.map((r) => ({
        product_name: r.productName,
        brand_name: r.brandName || undefined,
        brand_id: r.brandId != null ? r.brandId : undefined,
        supplier_id: r.supplierId != null ? r.supplierId : undefined,
        supplier_name: r.supplierName || undefined,
        unit_id: r.unitId != null ? r.unitId : undefined,
        purchase_date: r.purchaseDate,
        quantity_purchased: r.quantityPurchased,
        purchase_price: r.purchasePrice,
        is_on_sale: Boolean(r.isOnSale),
      })),
    },
  });

  return (data ?? []).map((b) => ({
    id: b.id,
    productId: b.product_id ?? null,
    productName: b.product_name ?? null,
    brandId: b.brand_id ?? null,
    brandName: b.brand_name ?? null,
    purchaseDate: b.purchase_date,
    quantityPurchased: Number(b.quantity_purchased),
    purchasePrice: Number(b.purchase_price),
    unitPrice: b.unit_price != null ? Number(b.unit_price) : null,
    supplierId: b.supplier_id,
    supplierName: b.supplier_name,
    unitName: b.unit_name,
    listName: b.list_name,
    isOnSale: b.is_on_sale,
  }));
}


export async function updateShoppingPrice(_priceId: number, _payload: unknown): Promise<void> {
  throw new Error('updateShoppingPrice non supportato nel backend attuale.');
}

export async function deleteShoppingPrice(_priceId: number): Promise<void> {
  throw new Error('deleteShoppingPrice non supportato nel backend attuale.');
}
