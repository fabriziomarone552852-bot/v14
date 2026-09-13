// src/mobile/components/modals/shopping/list/useMobileShoppingListDetailLogic.ts
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

export interface UseMobileShoppingListDetailLogicProps {
  list: ShoppingListSummary | null;
  onClose: () => void;
}

export function useMobileShoppingListDetailLogic({
  list,
  onClose,
}: UseMobileShoppingListDetailLogicProps) {
  const navigate = useNavigate();
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();
  const { suppliers, config } = useShoppingData();

  const [filterStatus, setFilterStatus] = useState<ItemFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const purchaseModal = useModal<ShoppingListItem>();
  const currencyOptions = useMemo(() => config?.currencyOptions ?? [], [config?.currencyOptions]);
  const offerFlagOptions = useMemo(() => config?.offerFlagOptions ?? [], [config?.offerFlagOptions]);
  const eurCurrencyId = useMemo(() => getEurCurrencyId(currencyOptions), [currencyOptions]);

  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormState>(
    emptyPurchaseForm(eurCurrencyId)
  );

  const isGroup = Boolean(list?.groupId || list?.groupName);
  const items = useMemo(() => list?.items || [], [list?.items]);

  const completedCount = useMemo(() => items.filter((it) => it.isPurchased).length, [items]);
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (filterStatus === 'open' && it.isPurchased) return false;
      if (filterStatus === 'completed' && !it.isPurchased) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = it.productName.toLowerCase().includes(q);
        const matchNote = it.note?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchNote) return false;
      }
      return true;
    });
  }, [items, filterStatus, searchQuery]);

  const handleOpenPurchase = useCallback(
    (item: ShoppingListItem) => {
      setPurchaseForm({
        ...emptyPurchaseForm(eurCurrencyId, item.quantity != null ? String(item.quantity) : '1'),
        purchaseDate: getLocalTodayStr(),
      });
      purchaseModal.open(item);
    },
    [eurCurrencyId, purchaseModal]
  );

  const handleTogglePurchased = useCallback(
    (item: ShoppingListItem, e: React.MouseEvent) => {
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
        handleOpenPurchase(item);
      }
    },
    [confirm, mutations, handleOpenPurchase]
  );

  const handlePurchaseSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!purchaseModal.data || !list?.id || !purchaseForm.price) return;

      const targetItem = purchaseModal.data;
      const boughtQuantity = Number(purchaseForm.quantity) || 1;
      const originalQuantity = targetItem.quantity != null ? targetItem.quantity : 1;

      try {
        await mutations.addInventoryBatch({
          itemId: targetItem.id,
          listId: list.id,
          data: {
            productId: targetItem.productId,
            supplierId: purchaseForm.supplierId ? Number(purchaseForm.supplierId) : undefined,
            purchaseDate: purchaseForm.purchaseDate,
            purchasePrice: Number(purchaseForm.price.replace(',', '.')),
            quantity: boughtQuantity,
            currencyId: purchaseForm.currencyId ? Number(purchaseForm.currencyId) : undefined,
            isOnSale: purchaseForm.isOnSale,
            offerFlagId: purchaseForm.isOnSale ? Number(purchaseForm.offerFlagId) || 1 : undefined,
          },
        });

        if (boughtQuantity < originalQuantity) {
          const remainingQuantity = originalQuantity - boughtQuantity;
          await mutations.updateItem({
            id: targetItem.id,
            listId: list.id,
            data: { quantity: remainingQuantity },
          });
        } else {
          await mutations.togglePurchased({
            id: targetItem.id,
            listId: list.id,
            data: { isPurchased: true },
          });
        }

        purchaseModal.close();
      } catch {
        // Error handled by mutation toast
      }
    },
    [list?.id, purchaseForm, purchaseModal, mutations]
  );

  const handleOpenShoppingPage = useCallback(() => {
    if (!list?.id) return;
    onClose();
    navigate(`/shopping?listId=${list.id}`);
  }, [list?.id, onClose, navigate]);

  return {
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    purchaseModal,
    suppliers,
    currencyOptions,
    offerFlagOptions,
    purchaseForm,
    setPurchaseForm,
    isGroup,
    items,
    completedCount,
    totalCount,
    progressPercent,
    filteredItems,
    handleTogglePurchased,
    handlePurchaseSubmit,
    handleOpenShoppingPage,
  };
}
