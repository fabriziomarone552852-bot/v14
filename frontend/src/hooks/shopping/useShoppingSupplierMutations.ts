import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createShoppingSupplier,
  updateShoppingSupplier,
  deleteShoppingSupplier,
  addInventoryBatch,
  deleteInventoryBatch,
  createQuickPriceBatch,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import type {
  ShoppingSupplierCreatePayload,
  UpdateShoppingSupplierArgs,
  AddInventoryBatchArgs,
  DeleteInventoryBatchArgs,
  QuickPriceBatchCreatePayload,
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

  // 9. LOTTI DI INVENTARIO / ACQUISTI
  const addInventoryBatchMutation = useMutation({
    mutationFn: ({ itemId, data }: AddInventoryBatchArgs) => addInventoryBatch(itemId, data),
    onSuccess: async (_d, vars) => {
      await Promise.all([
        invalidateLists(),
        invalidateItems(vars.listId),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
      ]);
    },
  });

  const deleteInventoryBatchMutation = useMutation({
    mutationFn: ({ batchId }: DeleteInventoryBatchArgs) => deleteInventoryBatch(batchId),
    onSuccess: async (_d, vars) => {
      await Promise.all([
        invalidateLists(),
        invalidateItems(vars.listId),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
      ]);
    },
  });

  const createQuickPriceBatchMutation = useMutation({
    mutationFn: (payload: QuickPriceBatchCreatePayload) => createQuickPriceBatch(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.allBatches() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.suppliers() }),
      ]);
    },
  });

  return {
    createSupplier: (payload: ShoppingSupplierCreatePayload) => createSupplierMutation.mutateAsync(payload),
    updateSupplier: (args: UpdateShoppingSupplierArgs) => updateSupplierMutation.mutateAsync(args),
    deleteSupplier: (id: number, asType?: number) => deleteSupplierMutation.mutateAsync({ id, asType }),
    addInventoryBatch: (args: AddInventoryBatchArgs) => addInventoryBatchMutation.mutateAsync(args),
    deleteInventoryBatch: (args: DeleteInventoryBatchArgs) => deleteInventoryBatchMutation.mutateAsync(args),
    createQuickPriceBatch: (payload: QuickPriceBatchCreatePayload) =>
      createQuickPriceBatchMutation.mutateAsync(payload),
  };
};
