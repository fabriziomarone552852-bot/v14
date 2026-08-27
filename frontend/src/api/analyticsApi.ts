// src/api/analyticsApi.ts
import { api } from '@/api/apiService';
import { toNumberOrNull } from '@/api/shopping/shoppingClient';
import type { SupplierPriceSummary, ItemPriceHistoryPoint } from '@/types/shopping';

const ANALYTICS_API_BASE = '/analytics';

type SupplierPriceSummaryApi = {
  supplier_id?: number | null;
  supplier_name?: string | null;
  last_price?: number | string | null;
  last_purchase_date?: string | null;
  is_last_price_on_sale?: boolean;
  best_price?: number | string | null;
  best_purchase_date?: string | null;
  avg_normal_price?: number | string | null;
};

type ItemPriceHistoryPointApi = {
  id: number;
  purchase_date: string;
  purchase_price: number | string;
  supplier_name?: string | null;
  is_on_sale?: boolean;
  quantity_purchased?: number | string | null;
};

export async function fetchItemSupplierPrices(
  shoppingListItemId: number,
  signal?: AbortSignal
): Promise<SupplierPriceSummary[]> {
  const data = await api.get<SupplierPriceSummaryApi[]>(
    `${ANALYTICS_API_BASE}/shopping/items/${shoppingListItemId}/supplier-prices`,
    { signal }
  );

  return (data ?? []).map((item) => ({
    supplierId: item.supplier_id ?? null,
    supplierName: item.supplier_name ?? 'Fornitore non specificato',
    lastPrice: toNumberOrNull(item.last_price),
    lastPurchaseDate: item.last_purchase_date ?? null,
    isLastPriceOnSale: Boolean(item.is_last_price_on_sale),
    bestPrice: toNumberOrNull(item.best_price),
    bestPurchaseDate: item.best_purchase_date ?? null,
    avgNormalPrice: toNumberOrNull(item.avg_normal_price),
  }));
}

export async function fetchItemPriceHistory(
  shoppingListItemId: number,
  signal?: AbortSignal
): Promise<ItemPriceHistoryPoint[]> {
  const data = await api.get<ItemPriceHistoryPointApi[]>(
    `${ANALYTICS_API_BASE}/shopping/items/${shoppingListItemId}/price-history`,
    { signal }
  );

  return (data ?? []).map((item) => ({
    id: Number(item.id),
    purchaseDate: item.purchase_date,
    purchasePrice: Number(item.purchase_price),
    supplierName: item.supplier_name ?? null,
    isOnSale: Boolean(item.is_on_sale),
    quantityPurchased: toNumberOrNull(item.quantity_purchased),
  }));
}
