// src/components/archive/shopping/ShoppingProductPriceModal.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseModal from '@/components/shared/dialog/BaseModal';
import {
  TagIcon,
  CalendarIcon,
  TrendDownIcon,
  ClockIcon,
  StoreIcon,
  ShoppingIcon,
} from '@/components/shared/utils/Icons';
import { fetchCommunityPrices, type CommunityPriceRecord } from '@/api/shoppingApi';
import type { ProductPriceSummary } from './ShoppingPriceTableRow';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import LookbackUnitSelect, { type LookbackUnit } from '@/components/shared/shopping/LookbackUnitSelect';
import {
  computeCutoffDate,
  computePriceStatistics,
} from '@/components/shared/shopping/shoppingPriceUtils';
import { formatToItalianShortDate } from '@/utils/dateUtils';

export type { LookbackUnit };
type PriceSourceTab = 'personal' | 'community';

interface ShoppingProductPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSummary: ProductPriceSummary | null;
}

export const ShoppingProductPriceModal: React.FC<ShoppingProductPriceModalProps> = ({
  isOpen,
  onClose,
  productSummary,
}) => {
  const [lookbackValue, setLookbackValue] = useState<number>(1);
  const [lookbackUnit, setLookbackUnit] = useState<LookbackUnit>('years');
  const [view, setView] = useState<PriceSourceTab>('personal');

  const productId = productSummary?.productId ?? 0;

  // Caricamento prezzi dalla community (Lazy loading)
  const { data: communityPrices = [], isLoading: isLoadingCommunity } = useQuery<CommunityPriceRecord[]>({
    queryKey: ['community_prices', productId],
    queryFn: () => (productId ? fetchCommunityPrices(productId) : Promise.resolve([])),
    enabled: isOpen && Boolean(productId),
    staleTime: 60_000,
  });

  // Data limite per il calcolo delle statistiche
  const cutoffDate = useMemo(() => {
    return computeCutoffDate(lookbackValue, lookbackUnit);
  }, [lookbackValue, lookbackUnit]);

  const personalBatches = productSummary?.batches || [];

  // Verifica se i record condividono una sola unità
  const uniqueUnits = useMemo(() => {
    const set = new Set<string>();
    for (const b of personalBatches) {
      if (b.unitName) set.add(b.unitName);
    }
    return Array.from(set);
  }, [personalBatches]);

  const isSingleUnit = uniqueUnits.length === 1;
  const commonUnit = isSingleUnit ? uniqueUnits[0] : null;
  const commonUnitDisplay = commonUnit ? formatUnitForQuantity(commonUnit, 1) || commonUnit : null;

  // Calcolo statistiche per la vista attiva (Miei acquisti vs Community)
  const stats = useMemo(() => {
    const sourceRecords = view === 'personal' ? personalBatches : communityPrices;
    return computePriceStatistics(sourceRecords, cutoffDate);
  }, [view, personalBatches, communityPrices, cutoffDate]);

  if (!isOpen || !productSummary) return null;

  // Finestra Laterale (Side Panel)
  const sidePanel = (
    <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 flex flex-col h-full w-full text-xs overflow-hidden">
      <div className="pb-2 border-b border-gray-100 mb-3 flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Storico Rilevazioni
        </h4>
        <span className="text-[11px] font-semibold text-gray-400">
          {view === 'personal' ? personalBatches.length : communityPrices.length} registrati
        </span>
      </div>

      {/* Switcher Schede Storico */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-3 shrink-0">
        <button
          type="button"
          onClick={() => setView('personal')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            view === 'personal'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          I miei acquisti ({personalBatches.length})
        </button>
        <button
          type="button"
          onClick={() => setView('community')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            view === 'community'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Community ({communityPrices.length})
        </button>
      </div>

      {/* Lista Prezzi Storici con stile card a 3 colonne */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
        {view === 'personal' ? (
          personalBatches.length === 0 ? (
            <p className="py-16 text-center text-xs text-gray-400">Nessun acquisto personale registrato.</p>
          ) : (
            personalBatches.map((b) => {
              const uPrice = b.unitPrice != null ? b.unitPrice : b.purchasePrice;
              const bUnit = formatUnitForQuantity(b.unitName, 1) || (b.unitName ? b.unitName : 'unità');
              return (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100/70 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-200/60">
                    <span className="flex items-center gap-1.5 truncate">
                      <ShoppingIcon className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">Lista: {b.listName || 'Senza Lista'}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-[1.3fr_1fr_1fr] sm:grid-cols-[1.4fr_1fr_1fr] items-center gap-2 text-xs">
                    <div className="text-left text-gray-500 font-medium text-[11px] truncate flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0">{formatToItalianShortDate(b.purchaseDate)}</span>
                      {b.notes && (
                        <span
                          className="text-[11px] text-gray-400 font-normal truncate italic"
                          title={b.notes}
                        >
                          · {b.notes}
                        </span>
                      )}
                    </div>
                    <div className="text-center font-semibold text-gray-700 flex items-center justify-center gap-1 min-w-0 truncate">
                      <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{b.supplierName || '—'}</span>
                    </div>
                    <div className="text-right flex items-center justify-end gap-1.5">
                      {b.isOnSale && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                          Offerta
                        </span>
                      )}
                      <span className="font-extrabold text-gray-900 text-xs sm:text-sm shrink-0">
                        € {uPrice != null ? uPrice.toFixed(2) : '—'} / {bUnit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : isLoadingCommunity ? (
          <p className="py-16 text-center text-xs text-gray-400">Caricamento storico prezzi community...</p>
        ) : communityPrices.length === 0 ? (
          <p className="py-16 text-center text-xs text-gray-400">Nessun prezzo dalla community per questo prodotto.</p>
        ) : (
          communityPrices.map((cp, idx) => {
            const cpUnit = formatUnitForQuantity(cp.unitName, 1) || (cp.unitName ? cp.unitName : 'unità');
            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100/70 transition-colors text-xs"
              >
                <div className="grid grid-cols-3 items-center gap-2 text-xs">
                  <div className="text-left text-gray-500 font-medium text-[11px] truncate">
                    {formatToItalianShortDate(cp.purchaseDate)}
                  </div>
                  <div className="text-center font-semibold text-gray-700 flex items-center justify-center gap-1 min-w-0 truncate">
                    <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="truncate">{cp.supplierName || '—'}</span>
                  </div>
                  <div className="text-right flex items-center justify-end gap-1.5">
                    {cp.isOnSale && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                        Offerta
                      </span>
                    )}
                    <span className="font-extrabold text-gray-900 text-xs sm:text-sm shrink-0">
                      € {cp.unitPrice.toFixed(2)} / {cpUnit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-base font-bold text-gray-800">
          <TagIcon className="w-5 h-5 text-blue-600" />
          <span>Statistiche Prodotto</span>
        </span>
      }
      sidePanel={sidePanel}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {/* Info Principale Prodotto */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-200 bg-emerald-100 text-emerald-700 text-xl font-extrabold shrink-0 shadow-2xs">
            <TagIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {productSummary.productName}
            </h3>
            {commonUnitDisplay && (
              <p className="text-xs text-gray-500 mt-0.5">
                Unità registrata: <span className="font-bold text-gray-700">{commonUnitDisplay}</span>
              </p>
            )}
          </div>
        </div>

        {/* Selettore Periodo di Riferimento */}
        <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Periodo di Calcolo</span>
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-gray-500 font-medium shrink-0">Ultimi</span>
            <input
              type="number"
              min={1}
              max={999}
              value={lookbackValue}
              onChange={(e) => setLookbackValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-16 px-2 py-1 text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <LookbackUnitSelect
              value={lookbackUnit}
              onChange={(newUnit) => setLookbackUnit(newUnit)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Card Statistiche Prezzi (Stile ShoppingItemDetailModal) */}
        <div className="bg-white rounded-xl border border-gray-200 p-3.5 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Statistiche Prezzo ({view === 'personal' ? 'I Miei Acquisti' : 'Community'})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Prezzo Migliore */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                <span>Migliore</span>
                <TrendDownIcon className="w-3.5 h-3.5" />
              </div>
              <div className="mt-1">
                <p className="text-base font-extrabold text-emerald-900">
                  {stats.bestPrice != null ? `€ ${stats.bestPrice.toFixed(2)}` : '—'}
                </p>
                {stats.bestSupplier ? (
                  <p className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
                    {stats.bestSupplier} · {formatToItalianShortDate(stats.bestDate)}
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-600/70 mt-0.5">—</p>
                )}
              </div>
            </div>

            {/* Prezzo Medio */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                <span>Medio</span>
                <TagIcon className="w-3.5 h-3.5" />
              </div>
              <div className="mt-1">
                <p className="text-base font-extrabold text-blue-900">
                  {stats.avg != null ? `€ ${stats.avg.toFixed(2)}` : '—'}
                </p>
                <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                  {stats.count > 0 ? `Su ${stats.count} acquisti` : 'Nessun dato'}
                </p>
              </div>
            </div>

            {/* Prezzo Più Recente */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-700 text-[10px] font-bold uppercase tracking-wider">
                <span>Più Recente</span>
                <ClockIcon className="w-3.5 h-3.5" />
              </div>
              <div className="mt-1">
                <p className="text-base font-extrabold text-gray-900">
                  {stats.latestPrice != null ? `€ ${stats.latestPrice.toFixed(2)}` : '—'}
                </p>
                {stats.latestDate ? (
                  <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                    {stats.latestSupplier ? `${stats.latestSupplier} · ` : ''}{formatToItalianShortDate(stats.latestDate)}
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-0.5">—</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ShoppingProductPriceModal;
