import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import type {
  ShoppingListCreatePayload,
  UpdateShoppingListArgs,
  ShoppingListSummary,
} from '@/types/shopping';

export const useShoppingListMutations = () => {
  const queryClient = useQueryClient();

  const invalidateLists = () =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() });

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

  return {
    createList: (payload: ShoppingListCreatePayload) => createListMutation.mutateAsync(payload),
    updateList: (args: UpdateShoppingListArgs) => updateListMutation.mutateAsync(args),
    deleteList: (id: number) => deleteListMutation.mutateAsync(id),
  };
};
