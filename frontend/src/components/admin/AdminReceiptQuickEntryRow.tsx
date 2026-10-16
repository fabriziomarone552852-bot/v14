import React, { useState } from 'react';
import { TrashIcon } from '@/components/shared/utils/Icons';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import { sanitizeDecimalString, parseDecimalValue } from '@/utils/decimalUtils';
import type { ReceiptItemRow } from './AdminReceiptQuickEntrySection';

export interface AdminReceiptQuickEntryRowProps {
  row: ReceiptItemRow;
  index: number;
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  onUpdateRow: (id: string, field: keyof ReceiptItemRow, value: string | number | null) => void;
  onProductSelect: (rowId: string, name: string, prod?: ShoppingProductOption) => void;
  onBrandSelect: (rowId: string, name: string, brand?: ShoppingSupplierOption) => void;
  onRemoveRow: (id: string) => void;
  onKeyDownOnPrice: (e: React.KeyboardEvent, index: number) => void;
}

export const AdminReceiptQuickEntryRow: React.FC<AdminReceiptQuickEntryRowProps> = ({
  row,
  index,
  products,
  brands,
  onUpdateRow,
  onProductSelect,
  onBrandSelect,
  onRemoveRow,
  onKeyDownOnPrice,
}) => {
  const isComplete = row.productName.trim() !== '' && Boolean(row.price);

  // Stato per calcolo inverso da prezzo unitario con doppio click
  const [isEditingUnitPrice, setIsEditingUnitPrice] = useState<boolean>(false);
  const [unitPriceInput, setUnitPriceInput] = useState<string>('');

  const q = parseDecimalValue(row.quantity, 0);
  const p = parseDecimalValue(row.price, 0);
  const isBothCanonicalPresent = q > 0 && p > 0;
  // Abilitato solo se manca almeno uno dei due dati e l'altro è presente
  const canUnlockUnitPrice = !isBothCanonicalPresent && (q > 0 || p > 0);

  const handleApplyUnitPrice = () => {
    setIsEditingUnitPrice(false);
    const u = parseDecimalValue(unitPriceInput, 0);
    if (u <= 0) return;

    // Regola bloccante: se entrambi i dati canonici sono già presenti, la modifica non è ammessa
    if (q > 0 && p > 0) return;

    if (q > 0 && p <= 0) {
      // Caso 1: Quantità nota, Prezzo Totale mancante -> Prezzo Totale = Q * U
      const calcPrice = Math.round(q * u * 100) / 100;
      onUpdateRow(row.id, 'price', String(calcPrice));
    } else if (p > 0 && q <= 0) {
      // Caso 2: Prezzo Totale noto, Quantità mancante -> Quantità = P / U
      const calcQty = Math.round((p / u) * 1000) / 1000;
      onUpdateRow(row.id, 'quantity', String(calcQty));
    }
  };

  return (
    <tr
      key={row.id}
      className={`transition ${
        isComplete ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/30 hover:bg-slate-50/60'
      }`}
    >
      {/* Index */}
      <td className="py-2 px-3 text-center font-mono font-bold text-slate-400 text-xs">
        {index + 1}
      </td>

      {/* Prodotto con Autocomplete */}
      <td className="py-2 px-3">
        <ShoppingProductAutocomplete
          id={`prod-input-${index}`}
          value={row.productName}
          onChange={(name, prod) => onProductSelect(row.id, name, prod)}
          products={products}
          hideBrand={true}
          placeholder="Es. Pasta Penne, Latte..."
          className="w-full text-xs"
          usePortal={true}
        />
      </td>

      {/* Brand con Autocomplete */}
      <td className="py-2 px-3">
        <ShoppingBrandAutocomplete
          id={`brand-input-${index}`}
          value={row.brandName}
          onChange={(name, brand) => onBrandSelect(row.id, name, brand)}
          brands={brands}
          productName={row.productName}
          products={products}
          placeholder="Es. Barilla, Granarolo..."
          className="w-full text-xs"
          usePortal={true}
        />
      </td>

      {/* Quantità */}
      <td className="py-2 px-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="1"
          value={row.quantity}
          onChange={(e) => {
            const v = sanitizeDecimalString(e.target.value);
            onUpdateRow(row.id, 'quantity', v);
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-center text-xs font-bold text-slate-800 outline-none focus:border-sky-500 font-mono"
        />
      </td>

      {/* Prezzo Totale */}
      <td className="py-2 px-3">
        <div className="relative flex items-center">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={row.price}
            onChange={(e) =>
              onUpdateRow(
                row.id,
                'price',
                sanitizeDecimalString(e.target.value)
              )
            }
            onKeyDown={(e) => onKeyDownOnPrice(e, index)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-right font-mono text-xs font-extrabold text-blue-700 outline-none focus:border-blue-500 pr-6"
          />
          <span className="absolute right-2 text-xs font-bold text-slate-400 pointer-events-none">
            €
          </span>
        </div>
      </td>

      {/* Prezzo Unitario (Calcolato o sbloccabile con doppio click se manca un dato) */}
      <td className="py-2 px-3 text-right whitespace-nowrap">
        {isEditingUnitPrice ? (
          <div className="relative flex items-center justify-end">
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              value={unitPriceInput}
              onChange={(e) => setUnitPriceInput(sanitizeDecimalString(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyUnitPrice();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsEditingUnitPrice(false);
                }
              }}
              onBlur={handleApplyUnitPrice}
              className="w-24 px-2 py-1 text-right font-mono font-bold text-xs border-2 border-indigo-500 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-200 text-indigo-900 shadow-sm"
              title="Premi Invio per calcolare il valore mancante o Esc per annullare"
            />
          </div>
        ) : canUnlockUnitPrice ? (
          <span
            onDoubleClick={() => {
              setUnitPriceInput(row.unitPrice != null ? String(row.unitPrice) : '');
              setIsEditingUnitPrice(true);
            }}
            className="inline-block px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-xs cursor-pointer transition select-none shadow-2xs group"
            title="💡 Doppio click per inserire il prezzo unitario e calcolare il valore mancante (quantità o prezzo totale) 🧮"
          >
            <span className="flex items-center gap-1">
              <span>🧮</span>
              <span>{row.unitPrice != null ? `${row.unitPrice.toFixed(2)} €` : 'Calcola'}</span>
            </span>
          </span>
        ) : (
          <span
            className="inline-block px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs select-none"
            title={
              isBothCanonicalPresent
                ? 'Quantità e Prezzo Totale presenti: il prezzo unitario è calcolato automaticamente (modifica disabilitata)'
                : 'Inserisci la quantità o il prezzo totale per abilitare il calcolo da prezzo unitario'
            }
          >
            {row.unitPrice != null ? `${row.unitPrice.toFixed(2)} €` : '-'}
          </span>
        )}
      </td>

      {/* Elimina Riga */}
      <td className="py-2 px-2 text-center">
        <button
          type="button"
          onClick={() => onRemoveRow(row.id)}
          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
          title="Rimuovi riga"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
