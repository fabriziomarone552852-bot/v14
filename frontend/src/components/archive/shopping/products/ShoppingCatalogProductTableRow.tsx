// src/components/archive/shopping/products/ShoppingCatalogProductTableRow.tsx
import React from 'react';
import { ShoppingIcon, ClockIcon } from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import type { EnrichedCatalogProduct } from './useShoppingArchiveProductsLogic';

interface ShoppingCatalogProductTableRowProps {
  item: EnrichedCatalogProduct;
  onSelect: (item: EnrichedCatalogProduct) => void;
}

const capitalizeFirst = (value: string): string => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const ShoppingCatalogProductTableRow: React.FC<ShoppingCatalogProductTableRowProps> = ({
  item,
  onSelect,
}) => {
  const unitDisplay = item.lastUnitName
    ? formatUnitForQuantity(item.lastUnitName, 1) || item.lastUnitName
    : null;
  const unitSuffix = unitDisplay ? `/${unitDisplay}` : '';

  const visibleBrands = item.brands.slice(0, 2);
  const extraBrandsCount = Math.max(0, item.brands.length - visibleBrands.length);

  return (
    <div
      onClick={() => onSelect(item)}
      className="grid grid-cols-[1fr_92px_54px] sm:grid-cols-[1fr_230px_170px_100px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-100 last:border-b-0 bg-white hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* 1. Prodotto */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pl-1">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-lime-50 border border-lime-200/70 text-lime-700 flex items-center justify-center shrink-0">
          <ShoppingIcon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold sm:font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
            {capitalizeFirst(item.displayName)}
          </p>
          <p className="text-[10px] text-slate-400 truncate sm:hidden">
            {item.brands.length > 0
              ? `${item.brands.length} ${item.brands.length === 1 ? 'marca' : 'marche'}`
              : 'Nessun marchio'}
          </p>
        </div>
      </div>

      {/* 2. Marche Collegate (Desktop) */}
      <div className="hidden sm:flex w-[230px] items-center gap-1.5 min-w-0">
        {item.brands.length === 0 ? (
          <span className="text-slate-300 font-bold">—</span>
        ) : (
          <>
            {visibleBrands.map((brand) => {
              const badgeColors =
                brand.sentiment === 'positive'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : brand.sentiment === 'negative'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200';
              return (
                <span
                  key={brand.key}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border truncate max-w-[100px] capitalize ${badgeColors}`}
                  title={brand.notes || brand.name}
                >
                  {brand.sentiment === 'positive' && <span>👍</span>}
                  {brand.sentiment === 'negative' && <span>👎</span>}
                  <span className="truncate">{brand.name}</span>
                </span>
              );
            })}
            {extraBrandsCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                +{extraBrandsCount}
              </span>
            )}
          </>
        )}
      </div>

      {/* 3. Ultimo Acquisto */}
      <div className="w-[92px] sm:w-[170px] text-center">
        {item.lastPrice != null ? (
          <div className="inline-flex flex-col items-center">
            <span className="inline-flex items-center gap-1 font-extrabold text-slate-800 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-slate-200/80 text-[10px] sm:text-xs">
              <ClockIcon className="w-3 h-3 text-slate-400 hidden sm:inline shrink-0" />
              <span>€{item.lastPrice.toFixed(2)}</span>
              {unitSuffix && (
                <span className="hidden sm:inline font-normal text-[10px] text-slate-500">
                  {unitSuffix}
                </span>
              )}
            </span>
            {(item.lastSupplierName || item.lastPurchaseDate) && (
              <span className="hidden sm:inline text-[10px] text-slate-400 truncate max-w-[155px] mt-0.5">
                {item.lastSupplierName || ''}
                {item.lastSupplierName && item.lastPurchaseDate ? ' • ' : ''}
                {item.lastPurchaseDate ? formatToItalianShortDate(item.lastPurchaseDate) : ''}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-300 font-bold">—</span>
        )}
      </div>

      {/* 4. Conteggio Acquisti */}
      <div className="w-[54px] sm:w-[100px] text-center">
        <span
          className={`inline-flex items-center justify-center font-extrabold px-2 py-0.5 rounded-full text-[10px] sm:text-xs border ${
            item.purchaseCount > 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
        >
          {item.purchaseCount}
        </span>
      </div>
    </div>
  );
};

export default ShoppingCatalogProductTableRow;
