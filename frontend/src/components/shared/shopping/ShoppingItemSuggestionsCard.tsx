// src/components/shared/shopping/ShoppingItemSuggestionsCard.tsx
import React, { useEffect, useState } from 'react';
import { fetchItemSupplierPrices } from '@/api/analyticsApi';
import type { SupplierPriceSummary } from '@/types/shopping';

interface ShoppingItemSuggestionsCardProps {
  itemId: number;
  productName: string;
  onOpenPriceHistory?: () => void;
}

const ShoppingItemSuggestionsCard: React.FC<ShoppingItemSuggestionsCardProps> = ({
  itemId,
  productName,
  onOpenPriceHistory,
}) => {
  const [summaries, setSummaries] = useState<SupplierPriceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!itemId) return;

    setIsLoading(true);
    fetchItemSupplierPrices(itemId)
      .then((data) => {
        if (isMounted) setSummaries(data);
      })
      .catch(() => {
        if (isMounted) setSummaries([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [itemId]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-xs text-blue-600 animate-pulse">
        🔍 Analisi storico prezzi per <span className="font-semibold">{productName}</span>...
      </div>
    );
  }

  if (summaries.length === 0) {
    return null; // Nessuno storico acquisti ancora registrato per questo articolo
  }

  // Troviamo il miglior prezzo in assoluto tra i fornitori
  const bestSummary = summaries.reduce<SupplierPriceSummary | null>((best, current) => {
    if (!current.bestPrice) return best;
    if (!best || !best.bestPrice || current.bestPrice < best.bestPrice) return current;
    return best;
  }, null);

  const primarySummary = summaries[0];

  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white p-3.5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-blue-100/60 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">💡</span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Suggerimenti Storici Prezzo
          </span>
        </div>

        {onOpenPriceHistory ? (
          <button
            type="button"
            onClick={onOpenPriceHistory}
            className="rounded-lg bg-blue-100/80 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-200 transition"
          >
            📊 Storico Completo
          </button>
        ) : null}
      </div>

      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {/* Miglior Prezzo */}
        {bestSummary && bestSummary.bestPrice ? (
          <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 p-2 text-emerald-900">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">🏆 Miglior Prezzo</p>
            <p className="mt-0.5 text-sm font-extrabold text-emerald-700">
              € {bestSummary.bestPrice.toFixed(2)}
            </p>
            <p className="truncate text-[10px] font-medium text-emerald-800">
              {bestSummary.supplierName}
            </p>
          </div>
        ) : null}

        {/* Prezzo Medio */}
        {primarySummary && primarySummary.avgNormalPrice ? (
          <div className="rounded-xl bg-blue-50/90 border border-blue-200 p-2 text-blue-900">
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">📈 Prezzo Medio</p>
            <p className="mt-0.5 text-sm font-extrabold text-blue-700">
              € {primarySummary.avgNormalPrice.toFixed(2)}
            </p>
            <p className="text-[10px] text-blue-800">Prezzo di listino ordinario</p>
          </div>
        ) : null}

        {/* Ultimo Prezzo */}
        {primarySummary && primarySummary.lastPrice ? (
          <div className="rounded-xl bg-slate-50/90 border border-slate-200 p-2 text-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">🕒 Ultimo Acquisto</p>
              {primarySummary.isLastPriceOnSale ? (
                <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-700">
                  Offerta
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm font-extrabold text-slate-800">
              € {primarySummary.lastPrice.toFixed(2)}
            </p>
            <p className="truncate text-[10px] text-slate-600">
              {primarySummary.supplierName}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ShoppingItemSuggestionsCard;
