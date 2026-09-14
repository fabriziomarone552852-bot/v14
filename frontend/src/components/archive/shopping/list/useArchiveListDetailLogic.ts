// src/components/archive/shopping/list/useArchiveListDetailLogic.ts
import { useState } from 'react';
import type { ShoppingListSummary, ShoppingListItem } from '@/types/shopping';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { useModal } from '@/hooks/useModals';
import { getLocalTodayStr } from '@/utils/dateUtils';
import {
  emptyPurchaseForm,
  getEurCurrencyId,
  type PurchaseFormState,
} from '@/components/shared/shopping/shoppingItems.utils';

export type ItemFilterStatus = 'all' | 'open' | 'completed';

export interface UseArchiveListDetailLogicProps {
  list: ShoppingListSummary | null;
}

export const useArchiveListDetailLogic = ({
  list,
}: UseArchiveListDetailLogicProps) => {
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();
  const { config } = useShoppingData();

  const [filterStatus, setFilterStatus] = useState<ItemFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const purchaseModal = useModal<ShoppingListItem>();
  const currencyOptions = config?.currencyOptions ?? [];
  const eurCurrencyId = getEurCurrencyId(currencyOptions);

  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormState>(
    emptyPurchaseForm(eurCurrencyId)
  );

  const items = list?.items || [];
  const completedCount = items.filter((it) => it.isPurchased).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = items.filter((it) => {
    if (filterStatus === 'open' && it.isPurchased) return false;
    if (filterStatus === 'completed' && !it.isPurchased) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = it.productName.toLowerCase().includes(q);
      const matchNote = it.notes?.toLowerCase().includes(q) ?? false;
      if (!matchName && !matchNote) return false;
    }
    return true;
  });

  const handleOpenPurchase = (item: ShoppingListItem) => {
    setPurchaseForm({
      ...emptyPurchaseForm(eurCurrencyId, item.quantity != null ? String(item.quantity) : '1'),
      purchaseDate: getLocalTodayStr(),
    });
    purchaseModal.open(item);
  };

  const handleTogglePurchased = async (item: ShoppingListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isPurchased) {
      confirm({
        title: 'Annulla Acquisto',
        message: `Vuoi segnare "${item.productName}" come non acquistato?`,
        confirmText: 'Conferma',
        onConfirm: async () => {
          await mutations.togglePurchased({
            id: item.id,
            listId: item.shoppingListId,
            data: { isPurchased: false },
          });
        },
      });
    } else {
      const boughtQuantity = item.quantity != null ? item.quantity : 1;
      await mutations.addInventoryBatch({
        itemId: item.id,
        listId: item.shoppingListId,
        data: {
          productId: item.productId,
          purchaseDate: getLocalTodayStr(),
          purchasePrice: 0,
          quantity: boughtQuantity,
          brandId: item.brandId ?? undefined,
          brandName: item.brandName ?? undefined,
          currencyId: item.lastCurrencyId ? Number(item.lastCurrencyId) : undefined,
          isOnSale: false,
        },
      });
      await mutations.togglePurchased({
        id: item.id,
        listId: item.shoppingListId,
        data: { isPurchased: true },
      });
    }
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseModal.data) return;
    const it = purchaseModal.data;
    const parsedPrice = purchaseForm.price.trim() ? Number(purchaseForm.price.replace(',', '.')) : 0;
    const purchasePrice = isNaN(parsedPrice) ? 0 : parsedPrice;

    await mutations.addInventoryBatch({
      itemId: it.id,
      listId: it.shoppingListId,
      data: {
        productId: it.productId,
        supplierId: purchaseForm.supplierId ? Number(purchaseForm.supplierId) : undefined,
        purchaseDate: purchaseForm.purchaseDate || getLocalTodayStr(),
        purchasePrice,
        quantity: Number(purchaseForm.quantity.replace(',', '.')) || 1,
        currencyId: purchaseForm.currencyId ? Number(purchaseForm.currencyId) : undefined,
        isOnSale: purchaseForm.isOnSale,
      },
    });

    await mutations.togglePurchased({
      id: it.id,
      listId: it.shoppingListId,
      data: { isPurchased: true },
    });

    purchaseModal.close();
  };

  const handleDeleteItem = (item: ShoppingListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm({
      title: 'Elimina Articolo',
      message: `Sei sicuro di voler eliminare "${item.productName}"?`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        await mutations.deleteItem({ id: item.id, listId: item.shoppingListId });
      },
    });
  };

  return {
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    items,
    completedCount,
    totalCount,
    progressPercent,
    filteredItems,
    purchaseModal,
    purchaseForm,
    setPurchaseForm,
    handleOpenPurchase,
    handleTogglePurchased,
    handleConfirmPurchase,
    handleDeleteItem,
  };
};
