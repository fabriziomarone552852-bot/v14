// src/mobile/components/modals/shopping/MobilePurchasedItemEditModal.tsx
import React, { useState, useEffect } from 'react';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import { EditIcon } from '@/components/shared/utils/Icons';
import { getLocalTodayStr } from '@/utils/dateUtils';
import {
  MobilePurchasedItemProductSection,
  MobilePurchasedItemPurchaseSection,
} from './purchased';

export interface PurchasedItemEditFormData {
  productName: string;
  brandName: string;
  brandId: string;
  shoppingListId: string;
  quantity: string;
  unitId: string;
  notes: string;
  price: string;
  unitPrice?: string;
  totalPrice?: string;
  lastPriceEdited?: 'unit' | 'total';
  currencyId: string;
  supplierId: string;
  purchaseDate: string;
  isOnSale: boolean;
}

export function syncPurchasedFormPrices(
  prev: PurchasedItemEditFormData,
  field: 'unitPrice' | 'totalPrice' | 'quantity',
  value: string
): PurchasedItemEditFormData {
  const cleanVal = value.replace(/[^0-9.,]/g, '').replace(',', '.');
  const qty = Math.max(0.001, Number((field === 'quantity' ? value : prev.quantity).replace(',', '.')) || 1);

  if (field === 'unitPrice') {
    const uNum = Number(cleanVal);
    const totCalc = !Number.isNaN(uNum) && cleanVal !== '' ? (uNum * qty).toFixed(2) : '';
    return {
      ...prev,
      unitPrice: value,
      totalPrice: totCalc,
      price: cleanVal,
      lastPriceEdited: 'unit',
    };
  }

  if (field === 'totalPrice') {
    const tNum = Number(cleanVal);
    const unitCalc = !Number.isNaN(tNum) && cleanVal !== '' && qty > 0 ? (tNum / qty).toFixed(2) : '';
    return {
      ...prev,
      totalPrice: value,
      unitPrice: unitCalc,
      price: unitCalc,
      lastPriceEdited: 'total',
    };
  }

  if (field === 'quantity') {
    const newQty = Math.max(0.001, Number(cleanVal) || 1);
    let newTot = prev.totalPrice || '';
    let newUnit = prev.unitPrice || prev.price || '';

    if (prev.lastPriceEdited === 'total' && prev.totalPrice && prev.totalPrice.trim() !== '') {
      const tot = Number(prev.totalPrice.replace(',', '.'));
      if (!Number.isNaN(tot)) {
        newUnit = (tot / newQty).toFixed(2);
      }
    } else if (newUnit.trim() !== '') {
      const u = Number(newUnit.replace(',', '.'));
      if (!Number.isNaN(u)) {
        newTot = (u * newQty).toFixed(2);
      }
    }

    return {
      ...prev,
      quantity: value,
      unitPrice: newUnit,
      totalPrice: newTot,
      price: newUnit,
    };
  }

  return { ...prev, [field]: value };
}

export interface MobilePurchasedItemEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: PurchasedItemEditFormData) => Promise<void> | void;
  item: ShoppingListItem | null;
  lists?: ShoppingListSummary[];
  suppliers: ShoppingSupplierOption[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  unitOptions: ConfigOption[];
  currencyOptions: ConfigOption[];
  zIndexClass?: string;
}

export const MobilePurchasedItemEditModal: React.FC<MobilePurchasedItemEditModalProps> = ({
  open,
  onClose,
  onSubmit,
  item,
  lists = [],
  suppliers,
  brands = [],
  products = [],
  unitOptions,
  currencyOptions,
  zIndexClass = 'z-[10010]',
}) => {
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

      const qtyNum = item.quantity != null ? Number(item.quantity) : 1;
      const unitNum = priceVal ? Number(priceVal.replace(',', '.')) : NaN;
      const initialTotal = !Number.isNaN(unitNum) ? (unitNum * qtyNum).toFixed(2) : '';

      setFormData({
        productName: item.productName || '',
        brandName: item.brandName || '',
        brandId: item.brandId ? String(item.brandId) : '',
        shoppingListId: item.shoppingListId ? String(item.shoppingListId) : '',
        quantity: item.quantity != null ? String(item.quantity) : '1',
        unitId: item.unitId ? String(item.unitId) : '',
        notes: item.notes || '',
        price: priceVal,
        unitPrice: priceVal,
        totalPrice: initialTotal,
        lastPriceEdited: 'unit',
        currencyId: item.lastCurrencyId ? String(item.lastCurrencyId) : '1',
        supplierId: supplierVal,
        purchaseDate: dateVal,
        isOnSale: onSaleVal,
      });
    }
  }, [open, item]);

  if (!open || !item) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.price.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmDisabled =
    isSubmitting || !formData.productName.trim() || !formData.price.trim();

  return (
    <MobileBaseModal
      isOpen={open}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          <EditIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="truncate">
            <span className="text-sm font-extrabold text-gray-900 block">
              Modifica Prodotto Acquistato
            </span>
            <span className="text-xs font-normal text-gray-500 truncate block">
              {item.productName}
            </span>
          </div>
        </div>
      }
      formId="mobile-purchased-item-edit-form"
      confirmText="Salva Modifiche"
      cancelText="Annulla"
      isConfirmDisabled={isConfirmDisabled}
    >
      <form
        id="mobile-purchased-item-edit-form"
        onSubmit={handleSubmit}
        className="space-y-4 max-w-lg mx-auto pb-6"
      >
        <MobilePurchasedItemProductSection
          formData={formData}
          setFormData={setFormData}
          lists={lists}
          brands={brands}
          products={products}
          unitOptions={unitOptions}
        />

        <MobilePurchasedItemPurchaseSection
          formData={formData}
          setFormData={setFormData}
          suppliers={suppliers}
          currencyOptions={currencyOptions}
        />
      </form>
    </MobileBaseModal>
  );
};

export default MobilePurchasedItemEditModal;
