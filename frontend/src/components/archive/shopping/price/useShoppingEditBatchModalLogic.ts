// src/components/archive/shopping/price/useShoppingEditBatchModalLogic.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  ConfigOption,
  ItemBatchRecord,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { PurchasedItemEditFormData } from '@/mobile/components/modals/shopping/MobilePurchasedItemEditModal';
import {
  fetchShoppingSuppliers,
  fetchShoppingLists,
  fetchShoppingProducts,
  fetchShoppingConfig,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';

export interface UseShoppingEditBatchModalLogicProps {
  isOpen: boolean;
  batch: ItemBatchRecord | null;
  onClose: () => void;
  suppliers?: ShoppingSupplierOption[];
  lists?: ShoppingListSummary[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  unitOptions?: ConfigOption[];
  currencyOptions?: ConfigOption[];
  onSave: (batchId: number, data: {
    purchasePrice: number;
    purchaseDate: string;
    quantityPurchased?: number;
    supplierId?: number | null;
    isOnSale: boolean;
    productName?: string;
    brandName?: string;
    brandId?: number | null;
    notes?: string;
    unitId?: number | null;
    shoppingListId?: number | null;
  }) => Promise<void>;
}

export const useShoppingEditBatchModalLogic = ({
  isOpen,
  batch,
  onClose,
  suppliers = [],
  lists = [],
  brands = [],
  products = [],
  unitOptions = [],
  currencyOptions = [],
  onSave,
}: UseShoppingEditBatchModalLogicProps) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<PurchasedItemEditFormData>({
    productName: '',
    brandName: '',
    brandId: '',
    shoppingListId: '',
    quantity: '1',
    unitId: '',
    notes: '',
    price: '',
    unitPrice: '',
    totalPrice: '',
    lastPriceEdited: 'unit',
    currencyId: '',
    supplierId: '',
    purchaseDate: '',
    isOnSale: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: fetchedSuppliers = [] } = useQuery<ShoppingSupplierOption[]>({
    queryKey: shoppingQueryKeys.suppliers(),
    queryFn: ({ signal }) => fetchShoppingSuppliers(signal),
    staleTime: 60_000,
    enabled: isOpen && suppliers.length === 0,
  });

  const { data: fetchedLists = [] } = useQuery<ShoppingListSummary[]>({
    queryKey: shoppingQueryKeys.lists(),
    queryFn: ({ signal }) => fetchShoppingLists(signal),
    staleTime: 60_000,
    enabled: isOpen && lists.length === 0,
  });

  const { data: fetchedProducts = [] } = useQuery<ShoppingProductOption[]>({
    queryKey: shoppingQueryKeys.products(),
    queryFn: ({ signal }) => fetchShoppingProducts(signal),
    staleTime: 60_000,
    enabled: isOpen && products.length === 0,
  });

  const { data: config } = useQuery({
    queryKey: shoppingQueryKeys.config(),
    queryFn: ({ signal }) => fetchShoppingConfig(signal),
    staleTime: 300_000,
    enabled: isOpen && (unitOptions.length === 0 || currencyOptions.length === 0),
  });

  const effectiveSuppliers = suppliers.length > 0 ? suppliers : fetchedSuppliers;
  const effectiveBrands = brands.length > 0 ? brands : effectiveSuppliers;
  const effectiveLists = lists.length > 0 ? lists : fetchedLists;
  const effectiveProducts = products.length > 0 ? products : fetchedProducts;
  const effectiveUnits = unitOptions.length > 0 ? unitOptions : (config?.unitOptions ?? []);
  const effectiveCurrencies = currencyOptions.length > 0 ? currencyOptions : (config?.currencyOptions ?? []);

  useEffect(() => {
    if (isOpen && batch) {
      const uPrice =
        batch.unitPrice != null
          ? String(batch.unitPrice)
          : batch.purchasePrice != null
            ? String(batch.purchasePrice)
            : '';
      const qtyStr = batch.quantityPurchased != null ? String(batch.quantityPurchased) : '1';
      const qNum = Number(qtyStr) || 1;
      const uNum = Number(uPrice.replace(',', '.'));
      const tCalc =
        !Number.isNaN(uNum) && uPrice !== ''
          ? (uNum * qNum).toFixed(2)
          : batch.purchasePrice != null
            ? String(batch.purchasePrice)
            : '';

      let listIdStr = batch.shoppingListId ? String(batch.shoppingListId) : '';
      if (!listIdStr && batch.listName && effectiveLists.length > 0) {
        const found = effectiveLists.find(
          (l) => l.name.toLowerCase().trim() === batch.listName?.toLowerCase().trim()
        );
        if (found) {
          listIdStr = String(found.id);
        }
      }

      let unitIdStr = batch.unitId ? String(batch.unitId) : '';
      if (!unitIdStr && batch.unitName && effectiveUnits.length > 0) {
        const foundU = effectiveUnits.find(
          (u) =>
            (u.codeValue && u.codeValue.toLowerCase().trim() === batch.unitName?.toLowerCase().trim()) ||
            (u.codeName && u.codeName.toLowerCase().trim() === batch.unitName?.toLowerCase().trim()) ||
            (u.displayName && u.displayName.toLowerCase().trim() === batch.unitName?.toLowerCase().trim())
        );
        if (foundU) {
          unitIdStr = String(foundU.id);
        }
      }

      setFormData({
        productName: batch.productName || '',
        brandName: batch.brandName || '',
        brandId: batch.brandId ? String(batch.brandId) : '',
        shoppingListId: listIdStr,
        quantity: qtyStr,
        unitId: unitIdStr,
        notes: batch.notes || '',
        price: uPrice,
        unitPrice: uPrice,
        totalPrice: tCalc,
        lastPriceEdited: 'unit',
        currencyId: '',
        supplierId: batch.supplierId ? String(batch.supplierId) : '',
        purchaseDate: batch.purchaseDate || '',
        isOnSale: Boolean(batch.isOnSale),
      });
      setError(null);
      setIsSubmitting(false);
      setIsDatePickerOpen(false);
    }
  }, [isOpen, batch, effectiveLists, effectiveUnits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!batch) return;

    const priceVal = formData.unitPrice ?? formData.price ?? '';
    const parsedPrice = Number(String(priceVal).replace(',', '.'));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Inserisci un prezzo unitario valido maggiore di zero.');
      return;
    }

    const parsedQty = Number(String(formData.quantity).replace(',', '.'));
    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      setError('Inserisci una quantità valida.');
      return;
    }

    if (!formData.purchaseDate) {
      setError('Seleziona una data di acquisto valida.');
      return;
    }

    setIsSubmitting(true);
    try {
      const totalPurchasePrice =
        formData.lastPriceEdited === 'total' && formData.totalPrice && formData.totalPrice.trim() !== ''
          ? Number(String(formData.totalPrice).replace(',', '.'))
          : parsedPrice * parsedQty;

      await onSave(batch.id, {
        purchasePrice: totalPurchasePrice,
        purchaseDate: formData.purchaseDate,
        quantityPurchased: parsedQty,
        supplierId: formData.supplierId ? Number(formData.supplierId) : null,
        isOnSale: formData.isOnSale,
        productName: formData.productName.trim(),
        brandName: formData.brandName.trim() || undefined,
        brandId: formData.brandId ? Number(formData.brandId) : null,
        notes: formData.notes.trim() || undefined,
        unitId: formData.unitId ? Number(formData.unitId) : null,
        shoppingListId: formData.shoppingListId ? Number(formData.shoppingListId) : null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio della rilevazione.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isMobile,
    formData,
    setFormData,
    isSubmitting,
    isDatePickerOpen,
    setIsDatePickerOpen,
    error,
    setError,
    effectiveSuppliers,
    effectiveBrands,
    effectiveLists,
    effectiveProducts,
    effectiveUnits,
    effectiveCurrencies,
    handleSubmit,
  };
};
