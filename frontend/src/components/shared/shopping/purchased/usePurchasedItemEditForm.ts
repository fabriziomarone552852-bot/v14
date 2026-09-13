// src/components/shared/shopping/purchased/usePurchasedItemEditForm.ts
import { useState, useEffect } from 'react';
import type { ShoppingListItem } from '@/types/shopping';
import type { PurchasedItemEditFormData } from '@/mobile/components/modals/shopping/MobilePurchasedItemEditModal';
import { getLocalTodayStr } from '@/utils/dateUtils';

export interface UsePurchasedItemEditFormProps {
  open: boolean;
  item: ShoppingListItem | null;
  onSubmit: (formData: PurchasedItemEditFormData) => Promise<void> | void;
  onClose: () => void;
}

export const usePurchasedItemEditForm = ({
  open,
  item,
  onSubmit,
  onClose,
}: UsePurchasedItemEditFormProps) => {
  const [formData, setFormData] = useState<PurchasedItemEditFormData>({
    productName: '',
    brandName: '',
    brandId: '',
    shoppingListId: '',
    quantity: '1',
    unitId: '',
    notes: '',
    price: '',
    currencyId: '1',
    supplierId: '',
    purchaseDate: getLocalTodayStr(),
    isOnSale: false,
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && item) {
      const batches = item.inventoryBatches || [];
      const latestBatch = batches.length > 0 ? batches[0] : null;

      const priceVal =
        item.lastPrice != null
          ? item.lastPrice.toFixed(2).replace('.', ',')
          : latestBatch?.purchase_price != null || latestBatch?.purchasePrice != null
          ? Number(latestBatch.purchase_price ?? latestBatch.purchasePrice).toFixed(2).replace('.', ',')
          : '';

      const supplierVal =
        item.lastSupplierId != null
          ? String(item.lastSupplierId)
          : latestBatch?.supplier_id != null || latestBatch?.supplierId != null
          ? String(latestBatch.supplier_id ?? latestBatch.supplierId)
          : '';

      const dateVal =
        item.lastPurchaseDate
          ? item.lastPurchaseDate.split('T')[0]
          : latestBatch?.purchase_date || latestBatch?.purchaseDate
          ? String(latestBatch.purchase_date || latestBatch.purchaseDate).split('T')[0]
          : getLocalTodayStr();

      const onSaleVal = Boolean(
        latestBatch?.is_on_sale ?? latestBatch?.isOnSale ?? false
      );

      setFormData({
        productName: item.productName || '',
        brandName: item.brandName || '',
        brandId: item.brandId ? String(item.brandId) : '',
        shoppingListId: item.shoppingListId ? String(item.shoppingListId) : '',
        quantity: item.quantity != null ? String(item.quantity) : '1',
        unitId: item.unitId ? String(item.unitId) : '',
        notes: item.notes || '',
        price: priceVal,
        currencyId: item.lastCurrencyId ? String(item.lastCurrencyId) : '1',
        supplierId: supplierVal,
        purchaseDate: dateVal,
        isOnSale: onSaleVal,
      });
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isSubmitting,
    handleSubmit,
  };
};
