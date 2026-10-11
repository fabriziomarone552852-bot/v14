import React from 'react';
import { TrashIcon } from '@/components/shared/utils/Icons';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
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
          type="number"
          min="0.01"
          step="any"
          value={row.quantity}
          onChange={(e) => {
            const v = e.target.value;
            onUpdateRow(row.id, 'quantity', v === '' ? '' : Math.max(0.01, Number(v)));
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-center text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
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
                e.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.')
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

      {/* Prezzo Unitario (Calcolato e Readonly) */}
      <td className="py-2 px-3 text-right">
        <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs">
          {row.unitPrice != null ? `${row.unitPrice.toFixed(2)} €` : '-'}
        </span>
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
