// src/components/shared/shopping/bulk/useBulkPurchaseLogic.ts
import { useState, useEffect, useMemo } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { getLocalTodayStr } from '@/utils/dateUtils';
import type { ConfigOption, ShoppingListItem, ShoppingListSummary } from '@/types/shopping';
import { emptyPurchaseForm, getEurCurrencyId, type PurchaseFormState } from '../shoppingItems.utils';

export interface BulkPurchaseRowState {
  item: ShoppingListItem;
  form: PurchaseFormState;
  saving: boolean;
}

export interface UseBulkPurchaseLogicProps {
  activeList?: ShoppingListSummary | null;
  items: ShoppingListItem[];
  currencyOptions: ConfigOption[];
}

export const useBulkPurchaseLogic = ({
  activeList,
  items,
  currencyOptions,
}: UseBulkPurchaseLogicProps) => {
  const mutations = useShoppingMutations();
  const defaultCurrencyId = useMemo(
    () => getEurCurrencyId(currencyOptions),
    [currencyOptions]
  );

  const [rowStates, setRowStates] = useState<Record<number, BulkPurchaseRowState>>({});

  useEffect(() => {
    const nextStates: Record<number, BulkPurchaseRowState> = {};
    for (const it of items) {
      const initialQuantity = it.quantity != null ? String(it.quantity) : '1';
      nextStates[it.id] = {
        item: it,
        form: {
          ...emptyPurchaseForm(defaultCurrencyId, initialQuantity),
          purchaseDate: getLocalTodayStr(),
        },
        saving: false,
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initialize states from items prop
    setRowStates(nextStates);
  }, [items, defaultCurrencyId]);

  const updateRowForm = (
    itemId: number,
    updater: (prev: PurchaseFormState) => PurchaseFormState
  ) => {
    setRowStates((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      return {
        ...prev,
        [itemId]: {
          ...current,
          form: updater(current.form),
        },
      };
    });
  };

  const handleSaveItem = async (itemId: number) => {
    const row = rowStates[itemId];
    if (!row || !activeList) return;

    const listId = row.item.shoppingListId || activeList.id;
    if (!listId) return;

    setRowStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], saving: true },
    }));

    try {
      const parsedPrice = row.form.price.trim() ? Number(row.form.price.replace(',', '.')) : 0;
      const purchasePrice = isNaN(parsedPrice) ? 0 : parsedPrice;
      await mutations.addInventoryBatch({
        itemId,
        listId,
        data: {
          productId: row.item.productId,
          supplierId: row.form.supplierId ? Number(row.form.supplierId) : undefined,
          purchaseDate: row.form.purchaseDate || getLocalTodayStr(),
          purchasePrice,
          quantity: Number(row.form.quantity.replace(',', '.')) || 1,
          currencyId: row.form.currencyId ? Number(row.form.currencyId) : undefined,
          isOnSale: row.form.isOnSale,
        },
      });

      await mutations.togglePurchased({
        id: itemId,
        listId,
        data: { isPurchased: true },
      });
    } finally {
      setRowStates((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], saving: false },
      }));
    }
  };

  const handleSaveAll = async () => {
    const itemIds = Object.keys(rowStates).map(Number);
    await Promise.all(itemIds.map((id) => handleSaveItem(id)));
  };

  return {
    rowStates,
    updateRowForm,
    handleSaveItem,
    handleSaveAll,
  };
};
