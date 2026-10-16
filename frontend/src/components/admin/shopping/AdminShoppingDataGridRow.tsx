// src/components/admin/shopping/AdminShoppingDataGridRow.tsx
import React, { memo } from 'react';
import type {
  ItemBatchRecord,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import { TrashIcon } from '@/components/shared/utils/Icons';

interface AdminShoppingDataGridRowProps {
  batch: ItemBatchRecord;
  isDirty: boolean;
  products: ShoppingProductOption[];
  suppliers: ShoppingSupplierOption[];
  brands: ShoppingSupplierOption[];
  onCellChange: (batchId: number, field: keyof ItemBatchRecord, value: unknown) => void;
  onSaveRow: (batchId: number) => void;
  onRevertRow: (batchId: number) => void;
  onDeleteBatch: (batchId: number, productName?: string | null) => void;
  disabled?: boolean;
}

export const AdminShoppingDataGridRow: React.FC<AdminShoppingDataGridRowProps> = memo(({
  batch,
  isDirty,
  products,
  suppliers,
  brands,
  onCellChange,
  onSaveRow,
  onRevertRow,
  onDeleteBatch,
  disabled = false,
}) => {
  const qty = batch.quantityPurchased ?? 1;
  const price = batch.purchasePrice ?? 0;
  const unitPrice = qty > 0 ? price / qty : price;

  // Anomalie visive
  const isSuspiciousPrice = unitPrice > 45 || unitPrice < 0.15;
  const isSuspiciousQty = qty <= 0;

  return (
    <tr
      className={`transition-colors text-xs border-b border-slate-100 ${
        isDirty
          ? 'bg-amber-50/80 hover:bg-amber-100/60'
          : 'hover:bg-sky-50/40 bg-white'
      }`}
    >
      {/* 1. ID & Flag Dirty/Seed */}
      <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-400">#{batch.id}</span>
          {isDirty && (
            <span
              className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"
              title="Modifiche non ancora salvate su questa riga"
            />
          )}
          {batch.isSeed && (
            <span
              className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200"
              title="Dato iniziale di sistema"
            >
              Seed
            </span>
          )}
        </div>
      </td>

      {/* 2. Data Acquisto */}
      <td className="py-2 px-2 whitespace-nowrap">
        <input
          type="date"
          value={batch.purchaseDate}
          disabled={disabled}
          onChange={(e) => onCellChange(batch.id, 'purchaseDate', e.target.value)}
          className="px-2 py-1 text-[11px] font-mono border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-sky-500"
        />
      </td>

      {/* 3. Prodotto (Selettore o Input con Riassegnazione) */}
      <td className="py-2 px-2 min-w-[200px]">
        <div className="space-y-0.5">
          <input
            type="text"
            list={`product-options-${batch.id}`}
            value={batch.productName || ''}
            disabled={disabled}
            placeholder="Nome prodotto..."
            onChange={(e) => {
              const val = e.target.value;
              const matched = products.find(
                (p) => (p.displayName || p.nameNormalized).toLowerCase() === val.trim().toLowerCase()
              );
              onCellChange(batch.id, 'productName', val);
              if (matched) {
                onCellChange(batch.id, 'productId', matched.id);
              }
            }}
            className="w-full px-2 py-1 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-sky-500"
          />
          <datalist id={`product-options-${batch.id}`}>
            {products.map((p) => (
              <option key={p.id} value={p.displayName || p.nameNormalized} />
            ))}
          </datalist>
          {batch.productId && (
            <div className="text-[10px] text-slate-400 font-mono px-1">
              ID Prodotto: {batch.productId}
            </div>
          )}
        </div>
      </td>

      {/* 4. Brand / Produttore */}
      <td className="py-2 px-2 min-w-[200px] w-56">
        <select
          value={batch.brandId ?? ''}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            const matchedBrand = brands.find((b) => b.id === val);
            onCellChange(batch.id, 'brandId', val);
            onCellChange(batch.id, 'brandName', matchedBrand?.name ?? null);
          }}
          className="w-full px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="">- Nessun Brand -</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </td>

      {/* 5. Supermercato / Fornitore */}
      <td className="py-2 px-2 min-w-[140px]">
        <select
          value={batch.supplierId ?? ''}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            const matchedSup = suppliers.find((s) => s.id === val);
            onCellChange(batch.id, 'supplierId', val);
            onCellChange(batch.id, 'supplierName', matchedSup?.name ?? null);
          }}
          className={`w-full px-2 py-1 text-xs border rounded-lg bg-white/90 outline-none focus:border-sky-500 cursor-pointer ${
            !batch.supplierId ? 'border-amber-300 text-amber-800 bg-amber-50/50' : 'border-slate-200'
          }`}
        >
          <option value="">⚠️ Negozio non assegnato</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </td>

      {/* 6. Quantità Acquistata */}
      <td className="py-2 px-2 w-20 text-center">
        <input
          type="number"
          step="0.001"
          min="0.001"
          value={batch.quantityPurchased}
          disabled={disabled}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            onCellChange(batch.id, 'quantityPurchased', val);
          }}
          className={`w-20 px-1.5 py-1 text-center font-bold text-xs border rounded-lg bg-white/90 outline-none focus:border-sky-500 font-mono ${
            isSuspiciousQty ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-slate-200'
          }`}
        />
      </td>

      {/* 7. Prezzo Totale (€) */}
      <td className="py-2 px-2 w-24 text-right">
        <input
          type="number"
          step="0.01"
          min="0"
          value={batch.purchasePrice}
          disabled={disabled}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            onCellChange(batch.id, 'purchasePrice', val);
          }}
          className="w-24 px-2 py-1 text-right font-extrabold text-xs border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-sky-500 font-mono text-slate-900"
        />
      </td>

      {/* 8. Prezzo Unitario Calcolato (€) */}
      <td className="py-2 px-3 w-24 text-right font-mono whitespace-nowrap">
        <span
          className={`font-bold text-xs ${
            isSuspiciousPrice ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-600'
          }`}
          title={isSuspiciousPrice ? 'Prezzo unitario anomalo (molto elevato o quasi nullo)' : undefined}
        >
          {unitPrice.toFixed(2)} €
        </span>
      </td>

      {/* 9. Offerta / Volantino */}
      <td className="py-2 px-2 text-center w-16">
        <input
          type="checkbox"
          checked={batch.isOnSale}
          disabled={disabled}
          onChange={(e) => onCellChange(batch.id, 'isOnSale', e.target.checked)}
          className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
          title="Contrassegna come prezzo promozionale / in offerta"
        />
      </td>


      {/* 11. Azioni Riga */}
      <td className="py-2 px-3 text-center whitespace-nowrap w-28">
        <div className="flex items-center justify-center gap-1">
          {/* Tasto Salva Riga Singola */}
          <button
            type="button"
            disabled={!isDirty || disabled}
            onClick={() => onSaveRow(batch.id)}
            className={`p-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center ${
              isDirty
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-300 cursor-not-allowed opacity-40'
            }`}
            title="Salva modifiche su questa riga"
          >
            <span>💾</span>
          </button>

          {/* Tasto Annulla Modifiche Riga */}
          {isDirty && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRevertRow(batch.id)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Annulla modifiche a questa riga"
            >
              <span>↩️</span>
            </button>
          )}

          {/* Tasto Elimina Lotto */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDeleteBatch(batch.id, batch.productName)}
            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition cursor-pointer"
            title="Elimina definitivamente questa registrazione"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

AdminShoppingDataGridRow.displayName = 'AdminShoppingDataGridRow';
