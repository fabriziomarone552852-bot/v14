// src/components/archive/shopping/ShoppingPriceTableRow.tsx
import React, { useMemo } from 'react';
import { TagIcon, TrendDownIcon, ClockIcon } from '@/components/shared/utils/Icons';
import type { ItemBatchRecord } from '@/types/shopping';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';

export interface ProductPriceSummary {
  productId: number;
  productName: string;
  batches: ItemBatchRecord[];
  lowestPrice: number | null;
  lowestSupplier?: string | null;
  lowestDate?: string | null;
  avgPrice: number | null;
  latestPrice: number | null;
  latestSupplier?: string | null;
  latestDate?: string | null;
  unitName?: string | null;
}

interface ShoppingPriceTableRowProps {
  productSummary?: ProductPriceSummary | null;
  onSelectProduct: (summary: ProductPriceSummary) => void;
}

export const ShoppingPriceTableRow: React.FC<ShoppingPriceTableRowProps> = ({
  productSummary,
  onSelectProduct,
}) => {
  // Hook SEMPRE chiamato per primo (regola di React: mai dopo un return condizionale)
  const uniqueUnits = useMemo(() => {
    if (!productSummary) return [];
    const set = new Set<string>();
    for (const b of productSummary.batches || []) {
      if (b.unitName) set.add(b.unitName);
    }
    return Array.from(set);
  }, [productSummary]);

  if (!productSummary) return null;

  const isSingleUnit = uniqueUnits.length === 1;
  const commonUnitDisplay = isSingleUnit
    ? formatUnitForQuantity(uniqueUnits[0], 1) || uniqueUnits[0]
    : null;

  const unitSuffix = commonUnitDisplay ? `/${commonUnitDisplay}` : '';
  const batchCount = productSummary.batches?.length || 0;

  return (
    <div
      onClick={() => onSelectProduct(productSummary)}
      className="grid grid-cols-[1fr_70px_65px_70px] sm:grid-cols-[1fr_160px_150px_170px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-100 last:border-b-0 bg-white hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* Colonna Prodotto */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pl-1">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0">
          <TagIcon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold sm:font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
            {productSummary.productName}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400">
            {batchCount} {batchCount === 1 ? 'ril.' : 'ril.'}
          </p>
        </div>
      </div>

      {/* Colonna Prezzo Più Basso */}
      <div className="w-[70px] sm:w-[160px] text-center">
        {productSummary.lowestPrice != null ? (
          <div className="inline-flex flex-col items-center">
            <span className="inline-flex items-center gap-0.5 sm:gap-1 font-extrabold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-emerald-200/80 text-[10px] sm:text-xs">
              <TrendDownIcon className="w-3 h-3 shrink-0 hidden sm:inline" />
              <span>€{productSummary.lowestPrice.toFixed(2)}</span>
              {unitSuffix && <span className="hidden sm:inline font-normal text-[10px]">{unitSuffix}</span>}
            </span>
            {productSummary.lowestSupplier && (
              <span className="hidden sm:inline text-[10px] text-slate-400 truncate max-w-[130px] mt-0.5">
                {productSummary.lowestSupplier}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-300 font-bold">—</span>
        )}
      </div>

      {/* Colonna Prezzo Medio */}
      <div className="w-[65px] sm:w-[150px] text-center">
        {productSummary.avgPrice != null ? (
          <span className="inline-flex items-center font-extrabold text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-blue-200/80 text-[10px] sm:text-xs">
            €{productSummary.avgPrice.toFixed(2)}
          </span>
        ) : (
          <span className="text-slate-300 font-bold">—</span>
        )}
      </div>

      {/* Colonna Prezzo Più Recente */}
      <div className="w-[70px] sm:w-[170px] text-center">
        {productSummary.latestPrice != null ? (
          <div className="inline-flex flex-col items-center">
            <span className="inline-flex items-center gap-0.5 sm:gap-1 font-extrabold text-slate-800 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-slate-200 text-[10px] sm:text-xs">
              <ClockIcon className="w-3 h-3 text-slate-500 shrink-0 hidden sm:inline" />
              <span>€{productSummary.latestPrice.toFixed(2)}</span>
            </span>
            {productSummary.latestDate && (
              <span className="hidden sm:inline text-[10px] text-slate-400 mt-0.5">
                {productSummary.latestDate}
                {productSummary.latestSupplier ? ` · ${productSummary.latestSupplier}` : ''}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-300 font-bold">—</span>
        )}
      </div>
    </div>
  );
};

export default ShoppingPriceTableRow;

