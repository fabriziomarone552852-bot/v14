// src/hooks/shopping/useShoppingMutations.ts
import type { UseShoppingMutationsResult } from '@/types/shopping';

import { useShoppingListMutations } from './useShoppingListMutations';
import { useShoppingItemMutations } from './useShoppingItemMutations';
import { useShoppingSupplierMutations } from './useShoppingSupplierMutations';
import { useShoppingGroupMutations } from './useShoppingGroupMutations';

export const useShoppingMutations = (): UseShoppingMutationsResult => {
  const listMutations = useShoppingListMutations();
  const itemMutations = useShoppingItemMutations();
  const supplierMutations = useShoppingSupplierMutations();
  const groupMutations = useShoppingGroupMutations();

  return {
    ...listMutations,
    ...itemMutations,
    ...supplierMutations,
    ...groupMutations,
  };
};