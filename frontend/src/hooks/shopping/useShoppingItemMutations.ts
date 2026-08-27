import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  toggleShoppingListItemPurchased,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import type {
  ShoppingListItemCreatePayload,
  UpdateShoppingListItemArgs,
  DeleteShoppingListItemArgs,
  ToggleShoppingListItemPurchasedArgs,
  ShoppingListItem,
  ShoppingListSummary,
} from '@/types/shopping';

export const useShoppingItemMutations = () => {
  const queryClient = useQueryClient();

  const invalidateLists = () =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() });

  const invalidateItems = (listId: number) =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.items(listId) });

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

  return {
    createItem: (payload: ShoppingListItemCreatePayload) => createItemMutation.mutateAsync(payload),
    updateItem: (args: UpdateShoppingListItemArgs) => updateItemMutation.mutateAsync(args),
    deleteItem: (args: DeleteShoppingListItemArgs) => deleteItemMutation.mutateAsync(args),
    togglePurchased: (args: ToggleShoppingListItemPurchasedArgs) => togglePurchasedMutation.mutateAsync(args),
  };
};
