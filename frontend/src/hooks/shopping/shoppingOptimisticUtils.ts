// src/hooks/shopping/shoppingOptimisticUtils.ts
import type { QueryClient } from '@tanstack/react-query';
import { shoppingQueryKeys } from '@/api/shoppingApi';
import type {
  ShoppingConfigBundle,
  ShoppingListItem,
  ShoppingListItemCreatePayload,
  ShoppingListSummary,
  ShoppingProductOption,
} from '@/types/shopping';

/**
 * Costruisce un articolo di lista spesa ottimistico completo in RAM (0ms)
 * attingendo al Mazzo di Carte già presente nella cache di React Query.
 */
export function buildOptimisticShoppingItem(
  queryClient: QueryClient,
  payload: ShoppingListItemCreatePayload,
  tempId: number
): ShoppingListItem {
  const cachedConfig = queryClient.getQueryData<ShoppingConfigBundle>(
    shoppingQueryKeys.config()
  );
  const cachedProductsEntries = queryClient.getQueriesData<ShoppingProductOption[]>({
    queryKey: shoppingQueryKeys.products(),
  });

  const normProdName = payload.productName.trim().toLowerCase();
  const normBrandName = (payload.brandName || '').trim().toLowerCase();

  let matchedProd: ShoppingProductOption | undefined;
  for (const [, prodList] of cachedProductsEntries) {
    const found = prodList?.find(
      (p) => (p?.displayName || p?.nameNormalized || '').trim().toLowerCase() === normProdName
    );
    if (found) {
      matchedProd = found;
      break;
    }
  }

  const matchedBrandLink = normBrandName
    ? matchedProd?.productBrands?.find(
        (pb) => (pb.brand?.nameNormalized || '').trim().toLowerCase() === normBrandName
      )
    : undefined;

  const effectiveUnitId = payload.unitId ?? matchedProd?.defaultUnitId ?? null;
  const unitOpt = effectiveUnitId
    ? cachedConfig?.unitOptions?.find((u) => Number(u.id) === Number(effectiveUnitId))
    : undefined;
  const resolvedUnitCodeName =
    unitOpt?.codeName || matchedProd?.defaultUnitCodeName || null;

  return {
    id: tempId,
    shoppingListId: payload.shoppingListId,
    productId: matchedProd?.id ?? 0,
    productName: payload.productName.trim(),
    nameNormalized: normProdName,
    brandId: payload.brandId ?? matchedBrandLink?.brandId ?? null,
    brandName: payload.brandName?.trim() || null,
    brandNotes:
      payload.brandNotes ??
      payload.brand_notes ??
      matchedBrandLink?.notes ??
      null,
    quantity: payload.quantity ?? 1,
    unitId: effectiveUnitId,
    unitCodeName: resolvedUnitCodeName,
    notes: payload.notes ?? null,
    isPurchased: false,
    lastPrice: matchedBrandLink?.lastPrice ?? matchedProd?.lastPurchasePrice ?? null,
    lastSupplierName:
      matchedBrandLink?.lastSupplierName ?? matchedProd?.lastSupplierName ?? null,
    inventoryBatches: [],
    canEdit: true,
    canDelete: true,
  };
}

/**
 * Sostituisce istantaneamente in cache il record temporaneo negativo con l'entità reale creata sul server.
 */
export function replaceOptimisticShoppingItem(
  queryClient: QueryClient,
  shoppingListId: number,
  tempId: number,
  createdItem: ShoppingListItem
): void {
  queryClient.setQueriesData<ShoppingListItem[]>(
    { queryKey: shoppingQueryKeys.items(shoppingListId) },
    (old) => (old ? old.map((it) => (it.id === tempId ? createdItem : it)) : old)
  );
  queryClient.setQueriesData<ShoppingListSummary[]>(
    { queryKey: shoppingQueryKeys.lists() },
    (old) => {
      if (!old) return old;
      return old.map((list) => {
        if (list.id !== shoppingListId || !list.items) return list;
        return {
          ...list,
          items: list.items.map((it) => (it.id === tempId ? createdItem : it)),
        };
      });
    }
  );
}
