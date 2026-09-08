// src/mobile/components/modals/shopping/MobileShoppingProductPriceModal.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import MobileBaseModal from '../MobileBaseModal';
import {
  TagIcon,
  CalendarIcon,
  TrendDownIcon,
  ClockIcon,
  StoreIcon,
  ShoppingIcon,
} from '@/components/shared/utils/Icons';
import { fetchCommunityPrices, type CommunityPriceRecord } from '@/api/shoppingApi';
import type { ProductPriceSummary } from '@/components/archive/shopping/ShoppingPriceTableRow';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import LookbackUnitSelect, { type LookbackUnit } from '@/components/shared/shopping/LookbackUnitSelect';
import {
  computeCutoffDate,
  computePriceStatistics,
} from '@/components/shared/shopping/shoppingPriceUtils';
import { formatToItalianShortDate } from '@/utils/dateUtils';

export type { LookbackUnit };
type PriceSourceTab = 'personal' | 'community';

interface MobileShoppingProductPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSummary: ProductPriceSummary | null;
  zIndexClass?: string;
}

export const MobileShoppingProductPriceModal: React.FC<MobileShoppingProductPriceModalProps> = ({
  isOpen,
  onClose,
  productSummary,
  zIndexClass = 'z-[10010]',
}) => {
  const [lookbackValue, setLookbackValue] = useState<number>(1);
  const [lookbackUnit, setLookbackUnit] = useState<LookbackUnit>('years');
  const [view, setView] = useState<PriceSourceTab>('personal');

  const productId = productSummary?.productId ?? 0;

  // Caricamento prezzi dalla community
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

  // Unità condivisa
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

  // Calcolo statistiche
  const stats = useMemo(() => {
    const sourceRecords = view === 'personal' ? personalBatches : communityPrices;
    return computePriceStatistics(sourceRecords, cutoffDate);
  }, [view, personalBatches, communityPrices, cutoffDate]);

  if (!isOpen || !productSummary) return null;

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="truncate">Statistiche Prezzo</span>
        </div>
      }
    >
      <div className="space-y-3.5 text-xs max-w-lg mx-auto pb-6">
        {/* Info Principale Prodotto */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200/90 shadow-2xs">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-200 bg-emerald-100 text-emerald-700 text-lg font-extrabold shrink-0">
            <TagIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {productSummary.productName}
            </h3>
            {commonUnitDisplay && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                Unità registrata: <span className="font-bold text-gray-700">{commonUnitDisplay}</span>
              </p>
            )}
          </div>
        </div>

        {/* Selettore Periodo di Riferimento */}
        <div className="p-3 bg-white rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Periodo di Calcolo</span>
          </span>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-gray-500 font-medium shrink-0">Ultimi</span>
            <input
              type="number"
              min={1}
              max={999}
              value={lookbackValue}
              onChange={(e) => setLookbackValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-14 px-2 py-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl text-center focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <LookbackUnitSelect
              value={lookbackUnit}
              onChange={(newUnit) => setLookbackUnit(newUnit)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Card Statistiche Prezzi */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 space-y-2.5 shadow-2xs">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1.5">
            Sintesi Prezzi ({view === 'personal' ? 'I Miei Acquisti' : 'Community'})
          </h4>

          <div className="grid grid-cols-3 gap-2">
            {/* Prezzo Migliore */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                <span>Minimo</span>
                <TrendDownIcon className="w-3 h-3" />
              </div>
              <div className="mt-1">
                <p className="text-sm font-extrabold text-emerald-900">
                  {stats.bestPrice != null ? `€${stats.bestPrice.toFixed(2)}` : '—'}
                </p>
                {stats.bestSupplier ? (
                  <p className="text-[9px] text-emerald-700 font-medium truncate mt-0.5" title={stats.bestSupplier}>
                    {stats.bestSupplier}
                  </p>
                ) : (
                  <p className="text-[9px] text-emerald-600/70 mt-0.5">—</p>
                )}
              </div>
            </div>

            {/* Prezzo Medio */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-800 text-[9px] font-bold uppercase tracking-wider">
                <span>Medio</span>
                <TagIcon className="w-3 h-3" />
              </div>
              <div className="mt-1">
                <p className="text-sm font-extrabold text-blue-900">
                  {stats.avg != null ? `€${stats.avg.toFixed(2)}` : '—'}
                </p>
                <p className="text-[9px] text-blue-600 font-medium mt-0.5">
                  {stats.count > 0 ? `${stats.count} acq.` : 'Nessun dato'}
                </p>
              </div>
            </div>

            {/* Prezzo Più Recente */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-700 text-[9px] font-bold uppercase tracking-wider">
                <span>Ultimo</span>
                <ClockIcon className="w-3 h-3" />
              </div>
              <div className="mt-1">
                <p className="text-sm font-extrabold text-gray-900">
                  {stats.latestPrice != null ? `€${stats.latestPrice.toFixed(2)}` : '—'}
                </p>
                {stats.latestDate ? (
                  <p className="text-[9px] text-gray-500 font-medium truncate mt-0.5">
                    {formatToItalianShortDate(stats.latestDate)}
                  </p>
                ) : (
                  <p className="text-[9px] text-gray-400 mt-0.5">—</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Switcher Schede Storico */}
        <div className="space-y-2">
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setView('personal')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
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
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                view === 'community'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Community ({communityPrices.length})
            </button>
          </div>

          {/* Elenco Rilevazioni Storiche */}
          <div className="space-y-2">
            {view === 'personal' ? (
              personalBatches.length === 0 ? (
                <p className="py-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-xl">
                  Nessun acquisto personale registrato.
                </p>
              ) : (
                personalBatches.map((b) => {
                  const uPrice = b.unitPrice != null ? b.unitPrice : b.purchasePrice;
                  const bUnit = formatUnitForQuantity(b.unitName, 1) || (b.unitName ? b.unitName : 'unità');
                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-2xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-gray-500 uppercase pb-1 border-b border-gray-100">
                        <span className="flex items-center gap-1.5 truncate">
                          <ShoppingIcon className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{b.listName || 'Senza Lista'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal shrink-0">
                          {formatToItalianShortDate(b.purchaseDate)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span className="font-semibold text-gray-800 truncate text-xs">
                            {b.supplierName || 'Negozio non spec.'}
                          </span>
                          {b.notes && (
                            <span className="text-[10px] text-gray-400 truncate italic">
                              · {b.notes}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {b.isOnSale && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                              Offerta
                            </span>
                          )}
                          <span className="font-extrabold text-gray-900 text-xs sm:text-sm">
                            €{uPrice != null ? uPrice.toFixed(2) : '—'}
                            <span className="text-[10px] font-normal text-gray-500">/{bUnit}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : isLoadingCommunity ? (
              <p className="py-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-xl">
                Caricamento storico prezzi community...
              </p>
            ) : communityPrices.length === 0 ? (
              <p className="py-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-xl">
                Nessun prezzo dalla community per questo prodotto.
              </p>
            ) : (
              communityPrices.map((cp, idx) => {
                const cpUnit = formatUnitForQuantity(cp.unitName, 1) || (cp.unitName ? cp.unitName : 'unità');
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-2xs text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span className="font-semibold text-gray-800 truncate text-xs">
                          {cp.supplierName || 'Negozio'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal shrink-0">
                          · {formatToItalianShortDate(cp.purchaseDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {cp.isOnSale && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                            Offerta
                          </span>
                        )}
                        <span className="font-extrabold text-gray-900 text-xs sm:text-sm">
                          €{cp.unitPrice.toFixed(2)}
                          <span className="text-[10px] font-normal text-gray-500">/{cpUnit}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MobileBaseModal>
  );
};

export default MobileShoppingProductPriceModal;
