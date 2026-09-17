// src/mobile/components/modals/shopping/quickprice/useMobileQuickPriceLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { getLocalTodayStr } from '@/utils/dateUtils';

export interface QuickPriceItem {
  id: string;
  productName: string;
  brandName: string;
  brandId: string;
  price: string;
  priceUnit: string;
  priceTotal: string;
  lastPriceEdited?: 'unit' | 'total';
  quantity: string;
  unitId: string;
  purchaseDate: string;
  supplierId: string;
  isOnSale: boolean;
}

export const createEmptyQuickPriceItem = (defaultProductName = ''): QuickPriceItem => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  productName: defaultProductName,
  brandName: '',
  brandId: '',
  price: '',
  priceUnit: '',
  priceTotal: '',
  lastPriceEdited: 'unit',
  quantity: '1',
  unitId: '',
  purchaseDate: getLocalTodayStr(),
  supplierId: '',
  isOnSale: false,
});

export function syncMobileItemPrices(
  item: QuickPriceItem,
  field: 'priceUnit' | 'priceTotal' | 'quantity',
  value: string
): QuickPriceItem {
  const cleanVal = value.replace(/[^0-9.,]/g, '').replace(',', '.');
  const qty = Math.max(0.001, Number(item.quantity.replace(',', '.')) || 1);

  if (field === 'priceUnit') {
    const unitNum = Number(cleanVal);
    const totalCalc = !Number.isNaN(unitNum) && cleanVal !== '' ? (unitNum * qty).toFixed(2) : '';
    return {
      ...item,
      priceUnit: value,
      priceTotal: totalCalc,
      price: cleanVal,
      lastPriceEdited: 'unit',
    };
  }

  if (field === 'priceTotal') {
    const totalNum = Number(cleanVal);
    const unitCalc = !Number.isNaN(totalNum) && cleanVal !== '' && qty > 0 ? (totalNum / qty).toFixed(2) : '';
    return {
      ...item,
      priceTotal: value,
      priceUnit: unitCalc,
      price: unitCalc,
      lastPriceEdited: 'total',
    };
  }

  if (field === 'quantity') {
    const newQty = Math.max(0.001, Number(cleanVal) || 1);
    let newPriceTotal = item.priceTotal;
    let newPriceUnit = item.priceUnit;

    if (item.lastPriceEdited === 'total' && item.priceTotal.trim() !== '') {
      const tot = Number(item.priceTotal.replace(',', '.'));
      if (!Number.isNaN(tot)) {
        newPriceUnit = (tot / newQty).toFixed(2);
      }
    } else if (item.priceUnit.trim() !== '') {
      const unit = Number(item.priceUnit.replace(',', '.'));
      if (!Number.isNaN(unit)) {
        newPriceTotal = (unit * newQty).toFixed(2);
      }
    }

    return {
      ...item,
      quantity: value,
      priceUnit: newPriceUnit,
      priceTotal: newPriceTotal,
      price: newPriceUnit,
    };
  }

  return { ...item, [field]: value };
}

export interface UseMobileQuickPriceLogicProps {
  isOpen: boolean;
  initialProductName?: string;
  onClose: () => void;
}

export function useMobileQuickPriceLogic({
  isOpen,
  initialProductName = '',
  onClose,
}: UseMobileQuickPriceLogicProps) {
  const mutations = useShoppingMutations();
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [items, setItems] = useState<QuickPriceItem[]>([createEmptyQuickPriceItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [datePickerItemId, setDatePickerItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems([createEmptyQuickPriceItem(initialProductName)]);
      setSelectedListId('');
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialProductName]);

  const handleAddItem = useCallback(() => {
    setItems((prev) => [...prev, createEmptyQuickPriceItem()]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length === 1) return [createEmptyQuickPriceItem()];
      return prev.filter((it) => it.id !== id);
    });
  }, []);

  const updateItem = useCallback(
    <K extends keyof QuickPriceItem>(id: string, field: K, value: QuickPriceItem[K]) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          if (field === 'priceUnit' || field === 'priceTotal' || field === 'quantity') {
            return syncMobileItemPrices(it, field as 'priceUnit' | 'priceTotal' | 'quantity', String(value));
          }
          return { ...it, [field]: value };
        })
      );
    },
    []
  );

  const validItems = useMemo(() => {
    return items.filter((it) => {
      const pStr = it.priceUnit || it.price || it.priceTotal;
      return it.productName.trim().length > 0 && pStr.trim().length > 0 && Number(pStr.replace(',', '.')) > 0;
    });
  }, [items]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (validItems.length === 0) {
        setErrorMessage('Inserisci almeno un prodotto con relativo prezzo valido.');
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const records = validItems.map((it) => {
          const parsedPrice = Number(it.price.replace(',', '.'));
          const parsedQty = Number(it.quantity.replace(',', '.')) || 1;
          const finalUnitId = it.unitId ? Number(it.unitId) : undefined;
          const finalBrandId = it.brandId ? Number(it.brandId) : undefined;
          const finalSupplierId = it.supplierId ? Number(it.supplierId) : undefined;

          return {
            productName: it.productName.trim(),
            brandName: it.brandName.trim() || undefined,
            brandId: finalBrandId,
            purchasePrice: parsedPrice,
            quantityPurchased: parsedQty,
            unitId: finalUnitId,
            purchaseDate: it.purchaseDate || getLocalTodayStr(),
            supplierId: finalSupplierId,
            isOnSale: it.isOnSale,
          };
        });

        await mutations.createQuickPriceBatch({
          shoppingListId: selectedListId ? Number(selectedListId) : null,
          records,
        });
        onClose();
      } catch {
        setErrorMessage('Errore durante il salvataggio dei prezzi.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validItems, selectedListId, mutations, onClose]
  );

  return {
    items,
    selectedListId,
    setSelectedListId,
    validItems,
    isSubmitting,
    errorMessage,
    datePickerItemId,
    setDatePickerItemId,
    handleAddItem,
    handleRemoveItem,
    updateItem,
    handleSubmit,
  };
}
