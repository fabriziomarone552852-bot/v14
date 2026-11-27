// src/components/archive/shopping/quickprice/useQuickPriceModalLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { parseDecimalValue } from '@/utils/decimalUtils';
import {
  createEmptyQuickPriceEntry,
  generateQuickPriceEntryId,
  syncQuickPriceEntryAmounts,
  updateQuickPriceEntriesWithCascade,
  appendQuickPriceEntryFromLast,
  removeQuickPriceEntrySafely,
} from '@/utils/quickPriceUtils';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import {
  getUnitDisplayName,
  sortShoppingUnitOptions,
} from '@/components/shared/shopping/ShoppingUnitSelect';
import type { QuickPriceRow, DropdownOption } from '../QuickPriceTypes';

export interface UseQuickPriceModalLogicProps {
  isOpen: boolean;
  suppliers?: ShoppingSupplierOption[];
  unitOptions?: ConfigOption[];
  onClose: () => void;
}

export const createEmptyRow = (
  purchaseDate?: string,
  supplierId?: string
): QuickPriceRow =>
  createEmptyQuickPriceEntry({
    idPrefix: 'row',
    purchaseDate,
    supplierId,
  });

export const syncRowPrices = syncQuickPriceEntryAmounts;

export const useQuickPriceModalLogic = ({
  isOpen,
  suppliers = [],
  unitOptions = [],
  onClose,
}: UseQuickPriceModalLogicProps) => {
  const mutations = useShoppingMutations();
  const [rows, setRows] = useState<QuickPriceRow[]>(() => [
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);
  const [openDatePickerRowId, setOpenDatePickerRowId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
      setSelectedListId('');
      setErrorMessage(null);
      setFocusTargetId(null);
      setOpenDatePickerRowId(null);
    }
  }

  const supplierDropdownOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: '', label: 'Nessuno' },
      ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
    ];
  }, [suppliers]);

  const unitDropdownOptions: DropdownOption[] = useMemo(() => {
    const { sortedOptions } = sortShoppingUnitOptions(unitOptions);

    return [
      { value: '', label: 'Nessuna unità' },
      ...sortedOptions.map((u) => {
        const name = getUnitDisplayName(u);
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
        return {
          value: String(u.id),
          label: capitalized,
        };
      }),
    ];
  }, [unitOptions]);

  useEffect(() => {
    if (!focusTargetId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(focusTargetId);
      if (el) {
        el.focus();
      }
      setFocusTargetId(null);
    }, 40);
    return () => clearTimeout(timer);
  }, [focusTargetId, rows]);

  const handleAddRow = useCallback(() => {
    const newRowId = generateQuickPriceEntryId('row');
    setRows((prev) => appendQuickPriceEntryFromLast(prev, { id: newRowId, idPrefix: 'row' }));
    setFocusTargetId(`prod-${newRowId}`);
  }, []);

  const handleRemoveRow = useCallback((id: string) => {
    setRows((prev) => removeQuickPriceEntrySafely(prev, id, 'row'));
  }, []);

  const updateRow = useCallback(<K extends keyof QuickPriceRow>(
    id: string,
    field: K,
    value: QuickPriceRow[K]
  ) => {
    setRows((prev) => updateQuickPriceEntriesWithCascade(prev, id, field, value));
  }, []);

  const handleProductSelect = useCallback((
    rowId: string,
    productName: string,
    product?: ShoppingProductOption
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated: QuickPriceRow = { ...row, productName };
        if (product) {
          if (product.brandName && !row.brandName) {
            updated.brandName = product.brandName;
            updated.brandId = product.brandId ? String(product.brandId) : '';
          }
          if (product.defaultUnitId && !row.unitId) {
            updated.unitId = String(product.defaultUnitId);
          }
        }
        return updated;
      })
    );
  }, []);

  const handleBrandSelect = useCallback((
    rowId: string,
    brandName: string,
    brand?: ShoppingSupplierOption
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          brandName,
          brandId: brand ? String(brand.id) : '',
        };
      })
    );
  }, []);

  const handleKeyDownOnLastField = useCallback((
    e: React.KeyboardEvent,
    rowIndex: number
  ) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      if (rowIndex === rows.length - 1) {
        e.preventDefault();
        handleAddRow();
      }
    }
  }, [rows.length, handleAddRow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validRows = rows.filter(
      (r) => r.productName.trim().length > 0 && r.price.trim().length > 0
    );

    if (validRows.length === 0) {
      setErrorMessage(
        'Inserisci almeno una riga con Nome Prodotto e Prezzo valido per procedere.'
      );
      return;
    }

    for (const r of validRows) {
      const p = parseDecimalValue(r.price, NaN);
      if (Number.isNaN(p) || p < 0) {
        setErrorMessage(
          `Prezzo non valido per il prodotto "${r.productName}".`
        );
        return;
      }
      const q = parseDecimalValue(r.quantity, NaN);
      if (Number.isNaN(q) || q <= 0) {
        setErrorMessage(
          `Quantità non valida per il prodotto "${r.productName}".`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await mutations.createQuickPriceBatch({
        shoppingListId: selectedListId ? Number(selectedListId) : null,
        records: validRows.map((r) => ({
          productName: r.productName.trim(),
          brandName: r.brandName.trim() || undefined,
          brandId: r.brandId ? Number(r.brandId) : undefined,
          supplierId: r.supplierId ? Number(r.supplierId) : undefined,
          unitId: r.unitId ? Number(r.unitId) : undefined,
          purchaseDate: r.purchaseDate || getLocalTodayStr(),
          quantityPurchased: parseDecimalValue(r.quantity, 1) || 1,
          purchasePrice: parseDecimalValue(r.price, 0),
          isOnSale: r.isOnSale,
        })),
      });

      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Errore nel salvataggio dei prezzi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    rows,
    selectedListId,
    setSelectedListId,
    isSubmitting,
    openDatePickerRowId,
    setOpenDatePickerRowId,
    errorMessage,
    supplierDropdownOptions,
    unitDropdownOptions,
    handleAddRow,
    handleRemoveRow,
    updateRow,
    handleProductSelect,
    handleBrandSelect,
    handleKeyDownOnLastField,
    handleSubmit,
  };
};
