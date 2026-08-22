import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

import {
  fetchShoppingConfig,
  fetchShoppingGroups,
  fetchShoppingListItems,
  fetchShoppingLists,
  fetchShoppingProducts,
  fetchShoppingSuppliers,
  shoppingQueryKeys,
} from '@/api/shoppingApi';

import type {
  ShoppingConfigBundle,
  ShoppingGroupSummary,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
  UseShoppingDataResult,
} from '@/types/shopping';

export const useShoppingData = (): UseShoppingDataResult => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const [activeListId, setActiveListId] = useState<number | null>(null);

  // Reset dell'attiva lista quando cambia utente
  useEffect(() => {
    setActiveListId(null);
  }, [userId]);

  const listsQuery = useQuery<ShoppingListSummary[]>({
    queryKey: [...shoppingQueryKeys.lists(), userId],
    queryFn: ({ signal }) => fetchShoppingLists(signal),
    staleTime: 10_000,
    gcTime: 10 * 60_000,
  });

  const suppliersQuery = useQuery<ShoppingSupplierOption[]>({
    queryKey: [...shoppingQueryKeys.suppliers(), userId],
    queryFn: ({ signal }) => fetchShoppingSuppliers(signal),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
  });

  const configQuery = useQuery<ShoppingConfigBundle>({
    queryKey: shoppingQueryKeys.config(),
    queryFn: ({ signal }) => fetchShoppingConfig(signal),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });

  const productsQuery = useQuery<ShoppingProductOption[]>({
    queryKey: [...shoppingQueryKeys.products(), userId],
    queryFn: ({ signal }) => fetchShoppingProducts(signal),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
  });

  const groupsQuery = useQuery<ShoppingGroupSummary[]>({
    queryKey: [...shoppingQueryKeys.groups(), userId],
    queryFn: ({ signal }) => fetchShoppingGroups(signal),
    staleTime: 10_000,
    gcTime: 30 * 60_000,
  });

  // Nessuna lista selezionata di default — l'utente sceglie manualmente



  const hasActiveList = activeListId !== null;

  const itemsQuery = useQuery<ShoppingListItem[]>({
    queryKey: [...shoppingQueryKeys.items(activeListId), userId],
    queryFn: ({ signal }) =>
      fetchShoppingListItems(activeListId as number, signal),
    enabled: hasActiveList,
    staleTime: 0,
    gcTime: 10 * 60_000,
  });

  const lists = listsQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const config = configQuery.data ?? null;

  const items = useMemo(() => {
    if (activeListId == null) return [];
    const rawItems = itemsQuery.data ?? [];
    return rawItems.filter((item) => item.shoppingListId === activeListId);
  }, [itemsQuery.data, activeListId]);

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId) ?? null,
    [lists, activeListId]
  );

  const isInitialLoading =
    listsQuery.isLoading ||
    groupsQuery.isLoading ||
    configQuery.isLoading ||
    suppliersQuery.isLoading ||
    productsQuery.isLoading ||
    (hasActiveList && itemsQuery.isLoading && items.length === 0);

  const refreshLists = async () => {
    await queryClient.invalidateQueries({
      queryKey: shoppingQueryKeys.lists(),
    });
  };

  const refreshGroups = async () => {
    await queryClient.invalidateQueries({
      queryKey: shoppingQueryKeys.groups(),
    });
  };

  const refreshItems = async (listId?: number | null) => {
    const targetListId = listId ?? activeListId;
    if (targetListId === null) return;

    await queryClient.invalidateQueries({
      queryKey: shoppingQueryKeys.items(targetListId),
    });
  };

  const refreshSuppliers = async () => {
    await queryClient.invalidateQueries({
      queryKey: shoppingQueryKeys.suppliers(),
    });
  };

  const refreshConfig = async () => {
    await queryClient.invalidateQueries({
      queryKey: shoppingQueryKeys.config(),
    });
  };

  return {
    lists,
    groups,
    activeListId,
    activeList,
    items,
    suppliers,
    products,
    config,
    listsLoading: listsQuery.isLoading,
    groupsLoading: groupsQuery.isLoading,
    itemsLoading: itemsQuery.isLoading,
    suppliersLoading: suppliersQuery.isLoading,
    productsLoading: productsQuery.isLoading,
    configLoading: configQuery.isLoading,
    isInitialLoading,
    setActiveListId,
    refreshLists,
    refreshGroups,
    refreshItems,
    refreshSuppliers,
    refreshConfig,
  };
};