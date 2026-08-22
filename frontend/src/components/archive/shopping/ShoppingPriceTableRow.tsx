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
  if (!productSummary) return null;

  // Mostra unità solo se tutti i record condividono la stessa unità
  const uniqueUnits = useMemo(() => {
    const set = new Set<string>();
    for (const b of productSummary.batches || []) {
      if (b.unitName) set.add(b.unitName);
    }
    return Array.from(set);
  }, [productSummary.batches]);

  const isSingleUnit = uniqueUnits.length === 1;
  const commonUnitDisplay = isSingleUnit
    ? formatUnitForQuantity(uniqueUnits[0], 1) || uniqueUnits[0]
    : null;

  const unitSuffix = commonUnitDisplay ? ` / ${commonUnitDisplay}` : '';
  const batchCount = productSummary.batches?.length || 0;

  return (
    <div
      onClick={() => onSelectProduct(productSummary)}
      className="grid grid-cols-[1fr_180px_180px_200px] items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* Colonna Prodotto */}
      <div className="flex items-center gap-2.5 min-w-0 pl-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0">
          <TagIcon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-sm">
            {productSummary.productName}
          </p>
          <p className="text-[11px] text-slate-400">
            {batchCount} {batchCount === 1 ? 'rilevazione' : 'rilevazioni'}
          </p>
        </div>
      </div>

      {/* Colonna Prezzo Più Basso */}
      <div className="w-[180px] text-center">
        {productSummary.lowestPrice != null ? (
          <div className="inline-flex flex-col items-center">
            <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 text-xs">
              <TrendDownIcon className="w-3.5 h-3.5" />
              <span>€ {productSummary.lowestPrice.toFixed(2)}{unitSuffix}</span>
            </span>
            {productSummary.lowestSupplier && (
              <span className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                {productSummary.lowestSupplier}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-300 font-bold">—</span>
        )}
      </div>

      {/* Colonna Prezzo Medio */}
      <div className="w-[180px] text-center">
        {productSummary.avgPrice != null ? (
          <span className="inline-flex items-center font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/80 text-xs">
            € {productSummary.avgPrice.toFixed(2)}{unitSuffix}
          </span>
        ) : (
          <span className="text-slate-300 font-bold">—</span>
        )}
      </div>

      {/* Colonna Prezzo Più Recente */}
      <div className="w-[200px] text-center">
        {productSummary.latestPrice != null ? (
          <div className="inline-flex flex-col items-center">
            <span className="inline-flex items-center gap-1 font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 text-xs">
              <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>€ {productSummary.latestPrice.toFixed(2)}{unitSuffix}</span>
            </span>
            {productSummary.latestDate && (
              <span className="text-[10px] text-slate-400 mt-0.5">
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
