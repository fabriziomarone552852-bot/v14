// src/components/archive/shopping/quickprice/useQuickPriceModalLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { getLocalTodayStr } from '@/utils/dateUtils';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import {
  ORDERED_UNIT_KEYS,
  UNIT_DICTIONARY,
  getUnitDisplayName,
} from '@/components/shared/shopping/ShoppingUnitSelect';
import type { QuickPriceRow, DropdownOption } from '../QuickPriceTypes';

export interface UseQuickPriceModalLogicProps {
  isOpen: boolean;
  suppliers?: ShoppingSupplierOption[];
  unitOptions?: ConfigOption[];
  onClose: () => void;
}

export const createEmptyRow = (): QuickPriceRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  productName: '',
  brandName: '',
  brandId: '',
  price: '0',
  quantity: '1',
  unitId: '',
  purchaseDate: getLocalTodayStr(),
  supplierId: '',
  isOnSale: false,
});

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);
  const [openDatePickerRowId, setOpenDatePickerRowId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supplierDropdownOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: '', label: 'Nessuno' },
      ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
    ];
  }, [suppliers]);

  const unitDropdownOptions: DropdownOption[] = useMemo(() => {
    const sorted = [...unitOptions].sort((a, b) => {
      const valA = (a.codeValue || a.codeName || '').toLowerCase().replace(/^unit\./i, '').trim();
      const valB = (b.codeValue || b.codeName || '').toLowerCase().replace(/^unit\./i, '').trim();
      const keyA = UNIT_DICTIONARY[valA]?.singular || valA;
      const keyB = UNIT_DICTIONARY[valB]?.singular || valB;
      const idxA = ORDERED_UNIT_KEYS.indexOf(keyA);
      const idxB = ORDERED_UNIT_KEYS.indexOf(keyB);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });

    return [
      { value: '', label: 'Nessuna unità' },
      ...sorted.map((u) => {
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
    if (isOpen) {
      setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
      setErrorMessage(null);
      setFocusTargetId(null);
      setOpenDatePickerRowId(null);
    }
  }, [isOpen]);

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
    const newRow = createEmptyRow();
    setRows((prev) => [...prev, newRow]);
    setFocusTargetId(`prod-${newRow.id}`);
  }, []);

  const handleRemoveRow = useCallback((id: string) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return [createEmptyRow()];
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const updateRow = useCallback(<K extends keyof QuickPriceRow>(
    id: string,
    field: K,
    value: QuickPriceRow[K]
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
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
      const p = Number(r.price.replace(',', '.'));
      if (Number.isNaN(p) || p < 0) {
        setErrorMessage(
          `Prezzo non valido per il prodotto "${r.productName}".`
        );
        return;
      }
      const q = Number(r.quantity.replace(',', '.'));
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
        records: validRows.map((r) => ({
          productName: r.productName.trim(),
          brandName: r.brandName.trim() || undefined,
          brandId: r.brandId ? Number(r.brandId) : undefined,
          supplierId: r.supplierId ? Number(r.supplierId) : undefined,
          unitId: r.unitId ? Number(r.unitId) : undefined,
          purchaseDate: r.purchaseDate || getLocalTodayStr(),
          quantityPurchased: Number(r.quantity.replace(',', '.')) || 1,
          purchasePrice: Number(r.price.replace(',', '.')),
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
