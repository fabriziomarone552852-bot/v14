// src/components/archive/shopping/ShoppingQuickPriceModal.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import BaseModal from '@/components/shared/dialog/BaseModal';
import {
  TagIcon,
  TrashIcon,
  PlusIcon,
  DropdownIcon,
} from '@/components/shared/utils/Icons';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { getLocalTodayStr } from '@/utils/dateUtils';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';

interface QuickPriceRow {
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

interface DropdownOption {
  value: string;
  label: string;
}

interface InlineDropdownSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}

const InlineDropdownSelect: React.FC<InlineDropdownSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleziona...',
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    bottom: number;
    left: number;
    width: number;
    openUpwards: boolean;
  }>({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    openUpwards: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const wrapperRef = useOutsideClick<HTMLDivElement>((e: MouseEvent | TouchEvent) => {
    const target = e.target as Node;
    if (
      (buttonRef.current && buttonRef.current.contains(target)) ||
      (dropdownRef.current && dropdownRef.current.contains(target))
    ) {
      return;
    }
    if (isOpen) setIsOpen(false);
  });

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 200;
      setCoords({
        top: rect.bottom + 4,
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: Math.max(rect.width, 140),
        openUpwards: openUp,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    }
  }, [isOpen, updateCoords]);

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: coords.openUpwards ? 'auto' : `${coords.top}px`,
        bottom: coords.openUpwards ? `${coords.bottom}px` : 'auto',
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        zIndex: 99999,
      }}
      className="bg-white border border-gray-100 rounded-xl shadow-2xl py-1 animate-fadeIn max-h-48 overflow-y-auto divide-y divide-gray-50"
    >
      {options.length === 0 ? (
        <div className="px-3 py-2 text-xs text-gray-400">Nessuna opzione</div>
      ) : (
        options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1" />
              )}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        id={id}
        ref={buttonRef}
        type="button"
        onClick={() => {
          updateCoords();
          setIsOpen((prev) => !prev);
        }}
        className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors text-left"
      >
        <span className={`truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>
          {displayLabel}
        </span>
        <DropdownIcon isDropdownOpen={isOpen} className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && createPortal(dropdownMenu, document.body)}
    </div>
  );
};

/* =========================================================================
 * ShoppingQuickPriceModal Component
 * ========================================================================= */
interface ShoppingQuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
  suppliers?: ShoppingSupplierOption[];
  unitOptions?: ConfigOption[];
}

const createEmptyRow = (): QuickPriceRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  productName: '',
  brandName: '',
  brandId: '',
  price: '',
  quantity: '1',
  unitId: '',
  purchaseDate: getLocalTodayStr(),
  supplierId: '',
  isOnSale: false,
});

export const ShoppingQuickPriceModal: React.FC<ShoppingQuickPriceModalProps> = ({
  isOpen,
  onClose,
  products = [],
  brands = [],
  suppliers = [],
  unitOptions = [],
}) => {
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
    return [
      { value: '', label: 'Nessuna' },
      ...unitOptions.map((u) => ({
        value: String(u.id),
        label: u.codeValue || u.codeName || `Unità ${u.id}`,
      })),
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
    if (focusTargetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(focusTargetId);
        if (el) {
          el.focus();
        }
        setFocusTargetId(null);
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [focusTargetId, rows]);

  const handleAddRow = useCallback(() => {
    const newRow = createEmptyRow();
    setRows((prev) => [...prev, newRow]);
    setFocusTargetId(`prod-${newRow.id}`);
  }, []);

  const handleRemoveRow = (id: string) => {
    if (rows.length === 1) {
      setRows([createEmptyRow()]);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = <K extends keyof QuickPriceRow>(
    id: string,
    field: K,
    value: QuickPriceRow[K]
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleProductSelect = (
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
  };

  const handleBrandSelect = (
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
  };

  const handleKeyDownOnLastField = (
    e: React.KeyboardEvent,
    rowIndex: number
  ) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      if (rowIndex === rows.length - 1) {
        e.preventDefault();
        handleAddRow();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Filtra le righe valide (che hanno un nome prodotto e un prezzo)
    const validRows = rows.filter(
      (r) => r.productName.trim().length > 0 && r.price.trim().length > 0
    );

    if (validRows.length === 0) {
      setErrorMessage(
        'Inserisci almeno una riga con Nome Prodotto e Prezzo valido per procedere.'
      );
      return;
    }

    // Valida i formati dei prezzi
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
        err instanceof Error ? err.message : 'Errore durante il salvataggio dei prezzi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledRowsCount = rows.filter(
    (r) => r.productName.trim() && r.price.trim()
  ).length;

  const modalFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      <span className="text-xs text-slate-500 font-medium">
        {filledRowsCount}{' '}
        {filledRowsCount === 1 ? 'prezzo pronto per il salvataggio' : 'prezzi pronti per il salvataggio'}
      </span>

      <button
        type="submit"
        form="quick-price-form"
        disabled={isSubmitting || filledRowsCount === 0}
        className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition cursor-pointer shadow-xs"
      >
        {isSubmitting
          ? 'Salvataggio in corso...'
          : `Salva ${filledRowsCount > 0 ? `(${filledRowsCount})` : ''}`}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-emerald-600" />
          <span>Aggiunta Rapida Prezzi & Prodotti</span>
        </div>
      }
      footer={modalFooter}
      formId="quick-price-form"
      maxWidthClass="max-w-5xl"
    >
      <form id="quick-price-form" onSubmit={handleSubmit} className="space-y-3 text-xs">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-xs">
            {errorMessage}
          </div>
        )}

        {/* Tabella interattiva */}
        <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto max-h-[55vh] custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[840px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-20">
                <tr>
                  <th className="py-2.5 px-3 min-w-[170px]">
                    Prodotto <span className="text-red-500">*</span>
                  </th>
                  <th className="py-2.5 px-3 min-w-[150px]">Brand / Marchio</th>
                  <th className="py-2.5 px-2.5 w-24">
                    Prezzo (€) <span className="text-red-500">*</span>
                  </th>
                  <th className="py-2.5 px-2 w-16">Qtà</th>
                  <th className="py-2.5 px-2.5 min-w-[110px]">Unità</th>
                  <th className="py-2.5 px-2.5 min-w-[140px]">Data</th>
                  <th className="py-2.5 px-2.5 min-w-[140px]">Negozio</th>
                  <th className="py-2.5 px-2.5 w-16 text-center">Offerta</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Prodotto Autocomplete con Portal Overlay */}
                    <td className="py-2 px-3">
                      <ShoppingProductAutocomplete
                        id={`prod-${row.id}`}
                        value={row.productName}
                        onChange={(name, prod) =>
                          handleProductSelect(row.id, name, prod)
                        }
                        products={products}
                        placeholder="Es. Pasta..."
                        className="w-full text-xs"
                        usePortal={true}
                      />
                    </td>

                    {/* Brand Autocomplete con Portal Overlay */}
                    <td className="py-2 px-3">
                      <ShoppingBrandAutocomplete
                        id={`brand-${row.id}`}
                        value={row.brandName}
                        onChange={(name, brand) =>
                          handleBrandSelect(row.id, name, brand)
                        }
                        brands={brands}
                        productName={row.productName}
                        products={products}
                        placeholder="Es. Barilla..."
                        className="w-full text-xs"
                        usePortal={true}
                      />
                    </td>

                    {/* Prezzo */}
                    <td className="py-2 px-2.5">
                      <input
                        id={`price-${row.id}`}
                        type="text"
                        inputMode="decimal"
                        value={row.price}
                        onChange={(e) =>
                          updateRow(row.id, 'price', e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </td>

                    {/* Quantità */}
                    <td className="py-2 px-2">
                      <input
                        id={`qty-${row.id}`}
                        type="text"
                        inputMode="decimal"
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(row.id, 'quantity', e.target.value)
                        }
                        placeholder="1"
                        className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs text-center text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </td>

                    {/* Unità di Misura Dropdown con Portal Overlay */}
                    <td className="py-2 px-2.5">
                      <InlineDropdownSelect
                        id={`unit-${row.id}`}
                        value={row.unitId}
                        onChange={(val) => updateRow(row.id, 'unitId', val)}
                        options={unitDropdownOptions}
                        placeholder="Unità"
                        className="w-full"
                      />
                    </td>

                    {/* Data Acquisto con DatePicker standard via usePortal */}
                    <td className="py-2 px-2.5">
                      <DatePicker
                        value={row.purchaseDate}
                        onChange={(newDate) => {
                          updateRow(row.id, 'purchaseDate', newDate);
                          setOpenDatePickerRowId(null);
                        }}
                        isOpen={openDatePickerRowId === row.id}
                        onToggle={() =>
                          setOpenDatePickerRowId(
                            openDatePickerRowId === row.id ? null : row.id
                          )
                        }
                        onClose={() => setOpenDatePickerRowId(null)}
                        align="left"
                        usePortal={true}
                      />
                    </td>

                    {/* Negozio / Fornitore Dropdown con Portal Overlay */}
                    <td className="py-2 px-2.5">
                      <InlineDropdownSelect
                        id={`supplier-${row.id}`}
                        value={row.supplierId}
                        onChange={(val) => updateRow(row.id, 'supplierId', val)}
                        options={supplierDropdownOptions}
                        placeholder="Negozio"
                        className="w-full"
                      />
                    </td>

                    {/* Offerta Checkbox */}
                    <td className="py-2 px-2.5 text-center">
                      <input
                        id={`sale-${row.id}`}
                        type="checkbox"
                        checked={row.isOnSale}
                        onChange={(e) =>
                          updateRow(row.id, 'isOnSale', e.target.checked)
                        }
                        onKeyDown={(e) =>
                          handleKeyDownOnLastField(e, index)
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>

                    {/* Elimina Riga */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Elimina riga"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tasto Aggiungi Riga posizionato sotto l'ultima riga */}
          <div className="p-2.5 bg-slate-50/60 border-t border-slate-200/80 flex items-center">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
            >
              <PlusIcon className="w-4 h-4 text-slate-500" />
              <span>Aggiungi riga</span>
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingQuickPriceModal;
