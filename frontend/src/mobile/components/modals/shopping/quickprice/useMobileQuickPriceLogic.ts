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
  price: '0',
  quantity: '1',
  unitId: '',
  purchaseDate: getLocalTodayStr(),
  supplierId: '',
  isOnSale: false,
});

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
  const [items, setItems] = useState<QuickPriceItem[]>([createEmptyQuickPriceItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [datePickerItemId, setDatePickerItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems([createEmptyQuickPriceItem(initialProductName)]);
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
          return { ...it, [field]: value };
        })
      );
    },
    []
  );

  const validItems = useMemo(() => {
    return items.filter(
      (it) => it.productName.trim() && it.price.trim() && Number(it.price.replace(',', '.')) > 0
    );
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

        await mutations.createQuickPriceBatch({ records });
        onClose();
      } catch {
        setErrorMessage('Errore durante il salvataggio dei prezzi.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validItems, mutations, onClose]
  );

  return {
    items,
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
