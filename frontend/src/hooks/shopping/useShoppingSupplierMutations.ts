import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createShoppingSupplier,
  updateShoppingSupplier,
  deleteShoppingSupplier,
  addInventoryBatch,
  updateInventoryBatch,
  deleteInventoryBatch,
  createQuickPriceBatch,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';
import type {
  ShoppingSupplierCreatePayload,
  UpdateShoppingSupplierArgs,
  AddInventoryBatchArgs,
  UpdateInventoryBatchArgs,
  DeleteInventoryBatchArgs,
  QuickPriceBatchCreatePayload,
  ShoppingListItem,
  ShoppingListSummary,
} from '@/types/shopping';

export const useShoppingSupplierMutations = () => {
  const queryClient = useQueryClient();

  const invalidateLists = () =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() });

  const invalidateItems = (listId: number) =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.items(listId) });

  // 8. FORNITORI / NEGOZI
  const createSupplierMutation = useMutation({
    mutationFn: (payload: ShoppingSupplierCreatePayload) => createShoppingSupplier(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.suppliers() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
      ]);
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: UpdateShoppingSupplierArgs) => updateShoppingSupplier(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.suppliers() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
      ]);
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: ({ id, asType }: { id: number; asType?: number }) => deleteShoppingSupplier(id, asType),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.suppliers() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
      ]);
    },
  });

  // 9. LOTTI DI INVENTARIO / ACQUISTI (OTTIMISTICO A 0MS)
  const addInventoryBatchMutation = useMutation({
    mutationFn: ({ itemId, data }: AddInventoryBatchArgs) => addInventoryBatch(itemId, data),
    onMutate: async ({ itemId, listId, data }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: shoppingQueryKeys.items(listId) }),
        queryClient.cancelQueries({ queryKey: shoppingQueryKeys.lists() }),
      ]);

      const prevItems = queryClient.getQueriesData<ShoppingListItem[]>({
        queryKey: shoppingQueryKeys.items(listId),
      });
      const prevLists = queryClient.getQueriesData<ShoppingListSummary[]>({
        queryKey: shoppingQueryKeys.lists(),
      });

      // Individua l'articolo esistente in RAM per distinguere acquisto completo vs parziale
      let existingItem: ShoppingListItem | undefined;
      for (const [, listItems] of prevItems) {
        const found = listItems?.find((it) => it.id === itemId);
        if (found) {
          existingItem = found;
          break;
        }
      }
      if (!existingItem) {
        for (const [, summaryLists] of prevLists) {
          const targetList = summaryLists?.find((l) => l.id === listId);
          const found = targetList?.items?.find((it) => it.id === itemId);
          if (found) {
            existingItem = found;
            break;
          }
        }
      }

      const wasAlreadyPurchased = Boolean(existingItem?.isPurchased);
      const originalQty = existingItem?.quantity ?? 1;
      const boughtQty = data.quantity != null && data.quantity > 0 ? data.quantity : originalQty;
      const isPartial = !wasAlreadyPurchased && boughtQty < originalQty;
      const remainingQty = isPartial ? Number((originalQty - boughtQty).toFixed(3)) : boughtQty;
      const unitPrice =
        data.purchasePrice > 0 && boughtQty > 0 ? data.purchasePrice / boughtQty : undefined;

      const patchOptimisticItem = (item: ShoppingListItem): ShoppingListItem => {
        if (item.id !== itemId) return item;
        if (isPartial) {
          return {
            ...item,
            quantity: remainingQty,
            isPurchased: false,
          };
        }
        return {
          ...item,
          isPurchased: true,
          ...(data.brandName !== undefined ? { brandName: data.brandName } : {}),
          ...(data.brandId !== undefined ? { brandId: data.brandId } : {}),
          ...(unitPrice !== undefined ? { lastPrice: unitPrice } : {}),
          ...(data.purchaseDate ? { lastPurchaseDate: data.purchaseDate } : {}),
        };
      };

      // 1. Aggiornamento istantaneo in RAM degli articoli della lista attiva
      queryClient.setQueriesData<ShoppingListItem[]>(
        { queryKey: shoppingQueryKeys.items(listId) },
        (old) => (old ? old.map(patchOptimisticItem) : old)
      );

      // 2. Aggiornamento istantaneo dei contatori di lista e dell'array items annidato
      queryClient.setQueriesData<ShoppingListSummary[]>(
        { queryKey: shoppingQueryKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((list) => {
            if (list.id !== listId) return list;
            const shouldIncrementPurchased = !wasAlreadyPurchased && !isPartial;
            return {
              ...list,
              purchasedItemsCount: shouldIncrementPurchased
                ? (list.purchasedItemsCount ?? 0) + 1
                : list.purchasedItemsCount,
              openItemsCount: shouldIncrementPurchased
                ? Math.max(0, (list.openItemsCount ?? 0) - 1)
                : list.openItemsCount,
              items: list.items ? list.items.map(patchOptimisticItem) : list.items,
            };
          });
        }
      );

      return { prevItems, prevLists, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevItems) {
        context.prevItems.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      if (context?.prevLists) {
        context.prevLists.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      showTrackerToast('Impossibile registrare l\'acquisto. Riprova.', 'warning');
    },
    onSettled: (_d, _err, vars) => {
      void Promise.all([
        invalidateLists(),
        invalidateItems(vars.listId),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.allBatches() }),
        queryClient.invalidateQueries({ queryKey: ['community_prices'] }),
      ]);
    },
  });

  const updateInventoryBatchMutation = useMutation({
    mutationFn: ({ batchId, data }: UpdateInventoryBatchArgs) => updateInventoryBatch(batchId, data),
    onSuccess: async (_d, vars) => {
      await Promise.all([
        invalidateLists(),
        invalidateItems(vars.listId),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['community_prices'] }),
      ]);
    },
  });

  const deleteInventoryBatchMutation = useMutation({
    mutationFn: ({ batchId }: DeleteInventoryBatchArgs) => deleteInventoryBatch(batchId),
    onSuccess: async (_d, vars) => {
      await Promise.all([
        invalidateLists(),
        invalidateItems(vars.listId),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['community_prices'] }),
      ]);
    },
  });

  const createQuickPriceBatchMutation = useMutation({
    mutationFn: (payload: QuickPriceBatchCreatePayload) => createQuickPriceBatch(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['community_prices'] }),
      ]);
    },
  });

  return {
    createSupplier: (payload: ShoppingSupplierCreatePayload) => createSupplierMutation.mutateAsync(payload),
    updateSupplier: (args: UpdateShoppingSupplierArgs) => updateSupplierMutation.mutateAsync(args),
    deleteSupplier: (id: number, asType?: number) => deleteSupplierMutation.mutateAsync({ id, asType }),
    addInventoryBatch: (args: AddInventoryBatchArgs) => addInventoryBatchMutation.mutateAsync(args),
    updateInventoryBatch: (args: UpdateInventoryBatchArgs) => updateInventoryBatchMutation.mutateAsync(args),
    deleteInventoryBatch: (args: DeleteInventoryBatchArgs) => deleteInventoryBatchMutation.mutateAsync(args),
    createQuickPriceBatch: (payload: QuickPriceBatchCreatePayload) =>
      createQuickPriceBatchMutation.mutateAsync(payload),
  };
};
