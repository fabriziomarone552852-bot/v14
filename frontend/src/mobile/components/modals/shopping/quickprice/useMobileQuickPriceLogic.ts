// src/mobile/components/modals/shopping/quickprice/useMobileQuickPriceLogic.ts
import { useState, useCallback, useMemo } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { parseDecimalValue } from '@/utils/decimalUtils';
import {
  type QuickPriceEntry,
  createEmptyQuickPriceEntry,
  syncQuickPriceEntryAmounts,
  updateQuickPriceEntriesWithCascade,
  appendQuickPriceEntryFromLast,
  removeQuickPriceEntrySafely,
} from '@/utils/quickPriceUtils';

export type QuickPriceItem = QuickPriceEntry;

export const createEmptyQuickPriceItem = (
  defaultProductName = '',
  purchaseDate?: string,
  supplierId?: string
): QuickPriceItem =>
  createEmptyQuickPriceEntry({
    idPrefix: 'item',
    productName: defaultProductName,
    purchaseDate,
    supplierId,
  });

export const syncMobileItemPrices = syncQuickPriceEntryAmounts;

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
  const [items, setItems] = useState<QuickPriceItem[]>(() => [createEmptyQuickPriceItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [datePickerItemId, setDatePickerItemId] = useState<string | null>(null);
  const [prevOpenKey, setPrevOpenKey] = useState<string>(
    `${isOpen}-${initialProductName}`
  );

  const currentOpenKey = `${isOpen}-${initialProductName}`;
  if (currentOpenKey !== prevOpenKey) {
    setPrevOpenKey(currentOpenKey);
    if (isOpen) {
      setItems([createEmptyQuickPriceItem(initialProductName)]);
      setSelectedListId('');
      setErrorMessage(null);
      setIsSubmitting(false);
      setDatePickerItemId(null);
    }
  }

  const handleAddItem = useCallback(() => {
    setItems((prev) => appendQuickPriceEntryFromLast(prev, { idPrefix: 'item' }));
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => removeQuickPriceEntrySafely(prev, id, 'item'));
  }, []);

  const updateItem = useCallback(
    <K extends keyof QuickPriceItem>(id: string, field: K, value: QuickPriceItem[K]) => {
      setItems((prev) => updateQuickPriceEntriesWithCascade(prev, id, field, value));
    },
    []
  );

  const validItems = useMemo(() => {
    return items.filter((it) => {
      const pStr = it.priceUnit || it.price || it.priceTotal;
      return (
        it.productName.trim().length > 0 &&
        pStr.trim().length > 0 &&
        parseDecimalValue(pStr, 0) > 0
      );
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
          const parsedPrice = parseDecimalValue(it.price, 0);
          const parsedQty = parseDecimalValue(it.quantity, 1) || 1;
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
