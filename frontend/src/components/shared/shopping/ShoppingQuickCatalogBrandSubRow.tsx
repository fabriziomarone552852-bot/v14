// src/components/shared/shopping/ShoppingQuickCatalogBrandSubRow.tsx
import React from 'react';
import type {
  ShoppingProductOption,
  ShoppingProductBrandLink,
  ShoppingListItem,
} from '@/types/shopping';
import { parseBrandPreference } from '@/utils/shoppingBrandPreference';

interface ShoppingQuickCatalogBrandSubRowProps {
  product: ShoppingProductOption;
  brandLink: ShoppingProductBrandLink | null;
  unitName: string;
  existingItem: ShoppingListItem | null;
  onToggle: (brandLink: ShoppingProductBrandLink | null) => void;
}

export const ShoppingQuickCatalogBrandSubRow: React.FC<ShoppingQuickCatalogBrandSubRowProps> = ({
  product: _product,
  brandLink,
  unitName: _unitName,
  existingItem,
  onToggle,
}) => {
  const isChecked = Boolean(existingItem);
  const isGeneric = brandLink === null;

  const brandName = isGeneric
    ? 'Senza marca specifica (Generico)'
    : brandLink.brand?.nameNormalized || 'Marca';

  const preference = !isGeneric ? parseBrandPreference(brandLink.notes) : null;

  const lastPrice =
    brandLink?.lastPrice != null && Number(brandLink.lastPrice) > 0
      ? Number(brandLink.lastPrice).toLocaleString('it-IT', {
          style: 'currency',
          currency: 'EUR',
        })
      : null;

  const lastSupplier = brandLink?.lastSupplierName;
  const lastDateFormatted = brandLink?.lastPurchaseDate
    ? new Date(brandLink.lastPurchaseDate).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
      })
    : null;

  return (
    <div
      onClick={() => onToggle(brandLink)}
      className={`grid grid-cols-[38px_1fr_120px_90px_110px] items-center gap-2 px-3 py-1.5 transition-colors cursor-pointer text-xs border-l-2 pl-4 ${
        isChecked
          ? 'bg-blue-50/80 hover:bg-blue-100/70 border-blue-600 font-medium text-blue-950'
          : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-300 text-gray-700'
      }`}
    >
      {/* 1. Checkbox */}
      <div
        className="flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(brandLink)}
          className="w-3.5 h-3.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition"
        />
      </div>

      {/* 2. Nome Brand + Sentiment Pill */}
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <span
          className={`truncate ${
            isGeneric ? 'italic text-gray-600 text-[11px]' : 'font-semibold text-gray-800'
          }`}
        >
          {brandName}
        </span>

        {preference?.sentiment === 'positive' && (
          <span
            className="shrink-0 text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
            title={preference.comment || 'Marchio consigliato'}
          >
            👍 {preference.comment ? preference.comment : 'Consigliato'}
          </span>
        )}

        {preference?.sentiment === 'negative' && (
          <span
            className="shrink-0 text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
            title={preference.comment || 'Marchio sconsigliato / da evitare'}
          >
            👎 {preference.comment ? preference.comment : 'Da evitare'}
          </span>
        )}

        {isChecked && (
          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-200 ml-auto">
            In lista
          </span>
        )}
      </div>

      {/* 3. Fornitore / Negozio */}
      <div className="truncate text-[11px] text-gray-500">
        {lastSupplier ? (
          <span className="text-gray-700" title={`Ultimo acquisto: ${lastSupplier}`}>
            🏪 {lastSupplier}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>

      {/* 4. Data ultimo acquisto */}
      <div className="truncate text-[11px] text-gray-500">
        {lastDateFormatted ? (
          <span className="text-slate-500 text-[10px]">{lastDateFormatted}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>

      {/* 5. Prezzo Ultimo Acquisto */}
      <div className="text-right text-[11px] text-gray-600 truncate">
        {lastPrice ? (
          <span className="font-semibold text-emerald-700">{lastPrice}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    </div>
  );
};

export default ShoppingQuickCatalogBrandSubRow;
