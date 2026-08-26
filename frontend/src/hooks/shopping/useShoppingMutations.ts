// src/hooks/shopping/useShoppingMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  createShoppingSupplier,
  updateShoppingSupplier,
  deleteShoppingSupplier,
  addInventoryBatch,
  deleteInventoryBatch,
  createQuickPriceBatch,
  toggleShoppingListItemPurchased,
  addShoppingPrice,
  updateShoppingPrice,
  deleteShoppingPrice,
  createShoppingGroup,
  updateShoppingGroup,
  archiveShoppingGroup,
  unarchiveShoppingGroup,
  deleteShoppingGroup,
  shoppingQueryKeys,
} from '@/api/shoppingApi';

import type {
  ShoppingListCreatePayload,
  ShoppingListItemCreatePayload,
  ShoppingSupplierCreatePayload,
  UpdateShoppingListArgs,
  UpdateShoppingListItemArgs,
  DeleteShoppingListItemArgs,
  UpdateShoppingSupplierArgs,
  AddInventoryBatchArgs,
  DeleteInventoryBatchArgs,
  ToggleShoppingListItemPurchasedArgs,
  UpdateShoppingPriceArgs,
  ShoppingPriceCreatePayload,
  UseShoppingMutationsResult,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingGroupCreatePayload,
  ShoppingGroupUpdatePayload,
} from '@/types/shopping';

export const useShoppingMutations = (): UseShoppingMutationsResult => {
  const queryClient = useQueryClient();

  const invalidateLists = () =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() });

  const invalidateGroups = () =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groups() });

  const invalidateItems = (listId: number) =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.items(listId) });


  // 1. CREA LISTA
  const createListMutation = useMutation({
    mutationFn: (payload: ShoppingListCreatePayload) => createShoppingList(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: shoppingQueryKeys.lists() });
      const prevLists = queryClient.getQueriesData<ShoppingListSummary[]>({ queryKey: shoppingQueryKeys.lists() });

      const tempId = -Date.now();
      const optimisticList: ShoppingListSummary = {
        id: tempId,
        name: payload.name,
        description: payload.description,
        groupId: payload.groupId ?? null,
        visibilityId: payload.visibilityId,
        isCompleted: false,
        openItemsCount: 0,
        purchasedItemsCount: 0,
        totalItemsCount: 0,
        canEdit: true,
        canDelete: true,
      };

      queryClient.setQueriesData<ShoppingListSummary[]>({ queryKey: shoppingQueryKeys.lists() }, (old) => {
        if (!old) return [optimisticList];
        return [...old, optimisticList];
      });

      return { prevLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevLists) {
        context.prevLists.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: async () => invalidateLists(),
  });

  // 2. MODIFICA LISTA
  const updateListMutation = useMutation({
    mutationFn: ({ id, data }: UpdateShoppingListArgs) => updateShoppingList(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: shoppingQueryKeys.lists() });
      const prevLists = queryClient.getQueriesData<ShoppingListSummary[]>({ queryKey: shoppingQueryKeys.lists() });

      queryClient.setQueriesData<ShoppingListSummary[]>({ queryKey: shoppingQueryKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((l) =>
          l.id === id
            ? {
                ...l,
                name: data.name !== undefined ? data.name : l.name,
                description: data.description !== undefined ? data.description : l.description,
                groupId: data.groupId !== undefined ? data.groupId : l.groupId,
                visibilityId: data.visibilityId !== undefined ? data.visibilityId : l.visibilityId,
                isCompleted: data.isCompleted !== undefined ? data.isCompleted : l.isCompleted,
              }
            : l
        );
      });

      return { prevLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevLists) {
        context.prevLists.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: async () => invalidateLists(),
  });

  // 3. ELIMINA LISTA
  const deleteListMutation = useMutation({
    mutationFn: (id: number) => deleteShoppingList(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: shoppingQueryKeys.lists() });
      const prevLists = queryClient.getQueriesData<ShoppingListSummary[]>({ queryKey: shoppingQueryKeys.lists() });

      queryClient.setQueriesData<ShoppingListSummary[]>({ queryKey: shoppingQueryKeys.lists() }, (old) => {
        if (!old) return old;
        return old.filter((l) => l.id !== id);
      });

      return { prevLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevLists) {
        context.prevLists.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: async () => invalidateLists(),
  });

  // 4. CREA ARTICOLO (OTTIMISTICO ISTANTANEO)
  const createItemMutation = useMutation({
    mutationFn: (payload: ShoppingListItemCreatePayload) => createShoppingListItem(payload),
    onMutate: async (payload) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: shoppingQueryKeys.items(payload.shoppingListId) }),
        queryClient.cancelQueries({ queryKey: shoppingQueryKeys.lists() }),
      ]);

      const prevItems = queryClient.getQueriesData<ShoppingListItem[]>({
        queryKey: shoppingQueryKeys.items(payload.shoppingListId),
      });
      const prevLists = queryClient.getQueriesData<ShoppingListSummary[]>({
        queryKey: shoppingQueryKeys.lists(),
      });

      const tempId = -Date.now();
      const optimisticItem: ShoppingListItem = {
        id: tempId,
        shoppingListId: payload.shoppingListId,
        productId: 0,
        productName: payload.productName,
        nameNormalized: payload.productName.toLowerCase(),
        quantity: payload.quantity ?? 1,
        unitId: payload.unitId ?? null,
        notes: payload.notes ?? null,
        isPurchased: false,
        inventoryBatches: [],
        canEdit: true,
        canDelete: true,
      };

      // Inserimento istantaneo in cima alla lista
      queryClient.setQueriesData<ShoppingListItem[]>(
        { queryKey: shoppingQueryKeys.items(payload.shoppingListId) },
        (old) => {
          if (!old) return [optimisticItem];
          return [optimisticItem, ...old];
        }
      );

      // Aggiornamento istantaneo dei conteggi della lista
      queryClient.setQueriesData<ShoppingListSummary[]>(
        { queryKey: shoppingQueryKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((list) => {
            if (list.id !== payload.shoppingListId) return list;
            return {
              ...list,
              openItemsCount: (list.openItemsCount ?? 0) + 1,
              totalItemsCount: (list.totalItemsCount ?? 0) + 1,
            };
          });
        }
      );

      return { prevItems, prevLists, shoppingListId: payload.shoppingListId };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevItems) {
        context.prevItems.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      if (context?.prevLists) {
        context.prevLists.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: async (_created, _err, vars) => {
      await Promise.all([
        invalidateLists(),
        invalidateItems(vars.shoppingListId),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
      ]);
    },
  });

  // 5. MODIFICA ARTICOLO (OTTIMISTICO ISTANTANEO)
  const updateItemMutation = useMutation({
    mutationFn: ({ id, listId, data }: UpdateShoppingListItemArgs) => updateShoppingListItem(id, listId, data),
    onMutate: async ({ id, listId, data }) => {
      await queryClient.cancelQueries({ queryKey: shoppingQueryKeys.items(listId) });
      const prevItems = queryClient.getQueriesData<ShoppingListItem[]>({
        queryKey: shoppingQueryKeys.items(listId),
      });

      queryClient.setQueriesData<ShoppingListItem[]>(
        { queryKey: shoppingQueryKeys.items(listId) },
        (old) => {
          if (!old) return old;
          return old.map((item) => {
            if (item.id !== id) return item;
            return {
              ...item,
              productName: data.productName !== undefined ? data.productName : item.productName,
              brandName: data.brandName !== undefined ? data.brandName : item.brandName,
              brandId: data.brandId !== undefined ? data.brandId : item.brandId,
              quantity: data.quantity !== undefined ? data.quantity : item.quantity,
              unitId: data.unitId !== undefined ? data.unitId : item.unitId,
              notes: data.notes !== undefined ? data.notes : item.notes,
              isPurchased: data.isPurchased !== undefined ? data.isPurchased : item.isPurchased,
            };
          });
        }
      );

      return { prevItems, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevItems) {
        context.prevItems.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: async (_updated, _err, vars) => {
      await Promise.all([
        invalidateLists(),
        invalidateItems(vars.listId),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
      ]);
    },
  });

  // 6. ELIMINA ARTICOLO (OTTIMISTICO ISTANTANEO)
  const deleteItemMutation = useMutation({
    mutationFn: ({ id }: DeleteShoppingListItemArgs) => deleteShoppingListItem(id),
    onMutate: async ({ id, listId }) => {
      if (!listId) return {};

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

      let wasPurchased = false;
      queryClient.setQueriesData<ShoppingListItem[]>(
        { queryKey: shoppingQueryKeys.items(listId) },
        (old) => {
          if (!old) return old;
          const target = old.find((i) => i.id === id);
          if (target) wasPurchased = Boolean(target.isPurchased);
          return old.filter((i) => i.id !== id);
        }
      );

      queryClient.setQueriesData<ShoppingListSummary[]>(
        { queryKey: shoppingQueryKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((list) => {
            if (list.id !== listId) return list;
            return {
              ...list,
              openItemsCount: Math.max(0, (list.openItemsCount ?? 0) - (wasPurchased ? 0 : 1)),
              purchasedItemsCount: Math.max(0, (list.purchasedItemsCount ?? 0) - (wasPurchased ? 1 : 0)),
              totalItemsCount: Math.max(0, (list.totalItemsCount ?? 0) - 1),
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
    },
    onSettled: async (_data, _err, vars) => {
      if (vars.listId) {
        await Promise.all([invalidateLists(), invalidateItems(vars.listId)]);
      } else {
        await invalidateLists();
      }
    },
  });

  // 7. CHECKBOX DA COMPRARE / COMPRATO (TOGGLE ISTANTANEO)
  const togglePurchasedMutation = useMutation({
    mutationFn: ({ id, data }: ToggleShoppingListItemPurchasedArgs) =>
      toggleShoppingListItemPurchased(id, { isPurchased: data.isPurchased }),
    onMutate: async ({ id, listId, data }) => {
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

      // Aggiornamento immediato in RAM
      queryClient.setQueriesData<ShoppingListItem[]>(
        { queryKey: shoppingQueryKeys.items(listId) },
        (old) => {
          if (!old) return old;
          return old.map((item) =>
            item.id === id
              ? {
                  ...item,
                  isPurchased: data.isPurchased,
                  inventoryBatches: data.isPurchased ? item.inventoryBatches : [],
                }
              : item
          );
        }
      );

      // Aggiornamento immediato dei contatori di lista
      queryClient.setQueriesData<ShoppingListSummary[]>(
        { queryKey: shoppingQueryKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((list) => {
            if (list.id !== listId) return list;
            const delta = data.isPurchased ? 1 : -1;
            return {
              ...list,
              purchasedItemsCount: Math.max(0, (list.purchasedItemsCount ?? 0) + delta),
              openItemsCount: Math.max(0, (list.openItemsCount ?? 0) - delta),
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
    },
    onSettled: async (_item, _err, vars) => {
      await Promise.all([
        invalidateLists(),
        invalidateItems(vars.listId),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
      ]);
    },
  });


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
    mutationFn: (payload: import('@/types/shopping').QuickPriceBatchCreatePayload) => createQuickPriceBatch(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.allBatches() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.suppliers() }),
      ]);
    },
  });

  // 10. MUTAZIONI GRUPPI
  const createGroupMutation = useMutation({
    mutationFn: (payload: ShoppingGroupCreatePayload) => createShoppingGroup(payload),
    onSuccess: async () => invalidateGroups(),
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ShoppingGroupUpdatePayload }) => updateShoppingGroup(id, data),
    onSuccess: async () => invalidateGroups(),
  });

  const archiveGroupMutation = useMutation({
    mutationFn: (groupId: number) => archiveShoppingGroup(groupId),
    onSuccess: async () => invalidateGroups(),
  });

  const unarchiveGroupMutation = useMutation({
    mutationFn: (groupId: number) => unarchiveShoppingGroup(groupId),
    onSuccess: async () => invalidateGroups(),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => deleteShoppingGroup(groupId),
    onSuccess: async () => invalidateGroups(),
  });

  return {
    createList: (payload: ShoppingListCreatePayload) => createListMutation.mutateAsync(payload),
    updateList: (args: UpdateShoppingListArgs) => updateListMutation.mutateAsync(args),
    deleteList: (id: number) => deleteListMutation.mutateAsync(id),

    createItem: (payload: ShoppingListItemCreatePayload) => createItemMutation.mutateAsync(payload),
    updateItem: (args: UpdateShoppingListItemArgs) => updateItemMutation.mutateAsync(args),
    deleteItem: (args: DeleteShoppingListItemArgs) => deleteItemMutation.mutateAsync(args),
    togglePurchased: (args: ToggleShoppingListItemPurchasedArgs) => togglePurchasedMutation.mutateAsync(args),

    createSupplier: (payload: ShoppingSupplierCreatePayload) => createSupplierMutation.mutateAsync(payload),
    updateSupplier: (args: UpdateShoppingSupplierArgs) => updateSupplierMutation.mutateAsync(args),
    deleteSupplier: (id: number, asType?: number) => deleteSupplierMutation.mutateAsync({ id, asType }),

    addInventoryBatch: (args: AddInventoryBatchArgs) => addInventoryBatchMutation.mutateAsync(args),
    deleteInventoryBatch: (args: DeleteInventoryBatchArgs) => deleteInventoryBatchMutation.mutateAsync(args),
    createQuickPriceBatch: (payload: import('@/types/shopping').QuickPriceBatchCreatePayload) =>
      createQuickPriceBatchMutation.mutateAsync(payload),

    addPrice: (payload: ShoppingPriceCreatePayload) => addShoppingPrice(payload),
    updatePrice: (args: UpdateShoppingPriceArgs) => updateShoppingPrice(args.priceId, args.data),
    deletePrice: (priceId: number) => deleteShoppingPrice(priceId),

    createGroup: (payload: ShoppingGroupCreatePayload) => createGroupMutation.mutateAsync(payload),
    updateGroup: (id: number, data: ShoppingGroupUpdatePayload) => updateGroupMutation.mutateAsync({ id, data }),
    archiveGroup: (groupId: number) => archiveGroupMutation.mutateAsync(groupId),
    unarchiveGroup: (groupId: number) => unarchiveGroupMutation.mutateAsync(groupId),
    deleteGroup: (groupId: number) => deleteGroupMutation.mutateAsync(groupId),
  };
};