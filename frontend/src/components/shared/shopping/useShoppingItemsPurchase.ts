// src/components/shared/shopping/useShoppingItemsPurchase.ts
import { useState } from 'react';
import { useModal } from '@/hooks/useModals';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { fetchItemBatches } from '@/api/shoppingApi';
import type { PurchasedItemEditFormData } from '@/mobile/components/modals/shopping/MobilePurchasedItemEditModal';
import type { ShoppingListItem } from '@/types/shopping';
import type { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import {
  emptyPurchaseForm,
  type PurchaseFormState,
} from './shoppingItems.utils';

export interface UseShoppingItemsPurchaseProps {
  activeListId: number | null;
  eurCurrencyId: string;
  mutations: ReturnType<typeof useShoppingMutations>;
}

export function useShoppingItemsPurchase({
  activeListId,
  eurCurrencyId,
  mutations,
}: UseShoppingItemsPurchaseProps) {
  const purchaseModal = useModal<ShoppingListItem>();
  const purchasedDetailModal = useModal<ShoppingListItem>();
  const purchasedEditModal = useModal<ShoppingListItem>();

  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormState>(
    emptyPurchaseForm(eurCurrencyId)
  );

  const handleOpenPurchase = (item: ShoppingListItem) => {
    const firstBatch = item.inventoryBatches?.[0];
    setPurchaseForm({
      ...emptyPurchaseForm(
        item.lastCurrencyId ? String(item.lastCurrencyId) : eurCurrencyId,
        item.quantity != null ? String(item.quantity) : '1',
        item.brandName ?? '',
        item.brandId != null ? String(item.brandId) : ''
      ),
      price: item.lastPrice != null && item.lastPrice > 0 ? String(item.lastPrice) : '',
      supplierId: item.lastSupplierId != null ? String(item.lastSupplierId) : '',
      purchaseDate: item.lastPurchaseDate || firstBatch?.purchase_date || getLocalTodayStr(),
      isOnSale: Boolean(firstBatch?.is_on_sale),
    });
    purchaseModal.open(item);
  };

  const handleClosePurchase = () => {
    setPurchaseForm(emptyPurchaseForm(eurCurrencyId));
    purchaseModal.close();
  };

  const handleTogglePurchased = async (item: ShoppingListItem) => {
    if (item.isPurchased) {
      await mutations.togglePurchased({
        id: item.id,
        listId: item.shoppingListId,
        data: { isPurchased: false },
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
          supplierId: item.lastSupplierId ?? undefined,
          currencyId: item.lastCurrencyId ? Number(item.lastCurrencyId) : (Number(eurCurrencyId) || undefined),
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

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!purchaseModal.data || activeListId == null) return;
    const targetItem = purchaseModal.data;
    const boughtQuantity = Number(purchaseForm.quantity) || 1;
    const originalQuantity = targetItem.quantity != null ? targetItem.quantity : 1;
    const parsedPrice = purchaseForm.price.trim() ? Number(purchaseForm.price.replace(',', '.')) : 0;
    const purchasePrice = isNaN(parsedPrice) ? 0 : parsedPrice;

    const batchData = {
      productId: targetItem.productId,
      supplierId: purchaseForm.supplierId ? Number(purchaseForm.supplierId) : undefined,
      brandId: purchaseForm.brandId ? Number(purchaseForm.brandId) : undefined,
      brandName: purchaseForm.brandName?.trim() || undefined,
      purchaseDate: purchaseForm.purchaseDate || getLocalTodayStr(),
      purchasePrice,
      quantity: boughtQuantity,
      currencyId: purchaseForm.currencyId ? Number(purchaseForm.currencyId) : undefined,
      isOnSale: purchaseForm.isOnSale,
      offerFlagId: purchaseForm.isOnSale ? (Number(purchaseForm.offerFlagId) || 1) : undefined,
    };

    if (!targetItem.isPurchased) {
      await mutations.addInventoryBatch({
        itemId: targetItem.id,
        listId: activeListId,
        data: batchData,
      });

      if (boughtQuantity < originalQuantity) {
        await mutations.updateItem({
          id: targetItem.id,
          listId: activeListId,
          data: { quantity: originalQuantity - boughtQuantity },
        });
        await mutations.togglePurchased({
          id: targetItem.id,
          listId: activeListId,
          data: { isPurchased: false },
        });
      } else {
        await mutations.togglePurchased({
          id: targetItem.id,
          listId: activeListId,
          data: { isPurchased: true },
        });
      }
    } else {
      let existingBatchId: number | null = null;
      if (targetItem.inventoryBatches && targetItem.inventoryBatches.length > 0) {
        existingBatchId = targetItem.inventoryBatches[0].id;
      } else {
        try {
          const batches = await fetchItemBatches(targetItem.id);
          if (batches && batches.length > 0) {
            existingBatchId = batches[0].id;
          }
        } catch {
          // ignore
        }
      }

      if (existingBatchId) {
        await mutations.updateInventoryBatch({
          batchId: existingBatchId,
          listId: activeListId,
          data: batchData,
        });
      } else {
        await mutations.addInventoryBatch({
          itemId: targetItem.id,
          listId: activeListId,
          data: batchData,
        });
      }

      await mutations.updateItem({
        id: targetItem.id,
        listId: activeListId,
        data: {
          quantity: boughtQuantity,
          brandName: purchaseForm.brandName?.trim() || undefined,
          brandId: purchaseForm.brandId ? Number(purchaseForm.brandId) : undefined,
        },
      });
    }

    handleClosePurchase();
  };

  const handlePurchasedEdit = async (formData: PurchasedItemEditFormData) => {
    if (!purchasedEditModal.data || activeListId == null) return;
    const targetItem = purchasedEditModal.data;
    const boughtQuantity = Number(formData.quantity) || 1;
    const destListId = formData.shoppingListId ? Number(formData.shoppingListId) : activeListId;

    // 1. Aggiorna i dati dell'articolo
    await mutations.updateItem({
      id: targetItem.id,
      listId: activeListId,
      data: {
        productName: formData.productName.trim(),
        brandName: formData.brandName.trim() || undefined,
        brandId: formData.brandId ? Number(formData.brandId) : undefined,
        shoppingListId: destListId !== activeListId ? destListId : undefined,
        quantity: boughtQuantity,
        unitId: formData.unitId ? Number(formData.unitId) : undefined,
        notes: formData.notes.trim() || undefined,
      },
    });

    // 2. Aggiorna il lotto/acquisto associato
    const batchData = {
      productId: targetItem.productId,
      supplierId: formData.supplierId ? Number(formData.supplierId) : undefined,
      brandId: formData.brandId ? Number(formData.brandId) : undefined,
      brandName: formData.brandName.trim() || undefined,
      purchaseDate: formData.purchaseDate,
      purchasePrice: Number(formData.price.replace(',', '.')),
      quantity: boughtQuantity,
      unitId: formData.unitId ? Number(formData.unitId) : undefined,
      currencyId: formData.currencyId ? Number(formData.currencyId) : undefined,
      isOnSale: formData.isOnSale,
      offerFlagId: formData.isOnSale ? 1 : undefined,
    };

    let existingBatchId: number | null = null;
    if (targetItem.inventoryBatches && targetItem.inventoryBatches.length > 0) {
      existingBatchId = targetItem.inventoryBatches[0].id;
    } else {
      try {
        const batches = await fetchItemBatches(targetItem.id);
        if (batches && batches.length > 0) {
          existingBatchId = batches[0].id;
        }
      } catch {
        // ignore
      }
    }

    if (existingBatchId) {
      await mutations.updateInventoryBatch({
        batchId: existingBatchId,
        listId: activeListId,
        data: batchData,
      });
    } else {
      await mutations.addInventoryBatch({
        itemId: targetItem.id,
        listId: activeListId,
        data: batchData,
      });
    }

    purchasedEditModal.close();
    purchasedDetailModal.close();
  };

  return {
    purchaseModal,
    purchasedDetailModal,
    purchasedEditModal,
    purchaseForm,
    setPurchaseForm,
    handleOpenPurchase,
    handleClosePurchase,
    handleTogglePurchased,
    handlePurchase,
    handlePurchasedEdit,
  };
}
