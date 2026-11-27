// src/components/shared/shopping/ShoppingItemBrandSidePanel.tsx
import React, { useMemo } from 'react';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import { parseBrandPreference } from '@/utils/shoppingBrandPreference';
import { TagIcon, StoreIcon } from '@/components/shared/utils/Icons';
import BrandPreferenceRatingControl from './BrandPreferenceRatingControl';

export interface TriedBrandEntry {
  key: string;
  brandId: number;
  brandName: string;
  notes: string | null;
  lastPrice: number | null;
  lastSupplierName: string | null;
}

export function extractTriedBrandsForProduct(
  productName: string,
  products: ShoppingProductOption[],
  brands: ShoppingSupplierOption[]
): TriedBrandEntry[] {
  const pName = (productName || '').trim().toLowerCase();
  if (!pName) return [];

  const matched = products.find(
    (p) => (p?.displayName || p?.nameNormalized || '').trim().toLowerCase() === pName
  );
  if (!matched?.productBrands || matched.productBrands.length === 0) {
    return [];
  }

  const entries: TriedBrandEntry[] = [];
  const seenNames = new Set<string>();

  for (const pb of matched.productBrands) {
    const resolvedName = (
      pb.brand?.nameNormalized ||
      brands.find((b) => b.id === pb.brandId)?.name ||
      ''
    ).trim();
    if (!resolvedName) continue;

    const lowerName = resolvedName.toLowerCase();
    if (seenNames.has(lowerName)) continue;
    seenNames.add(lowerName);

    entries.push({
      key: String(pb.id || pb.brandId || lowerName),
      brandId: pb.brandId,
      brandName: resolvedName,
      notes: pb.notes ?? null,
      lastPrice: pb.lastPrice != null ? Number(pb.lastPrice) : null,
      lastSupplierName: pb.lastSupplierName ?? null,
    });
  }

  // Ordina mettendo prima i graditi (👍), poi i neutri, infine i da evitare (👎), e a parità A-Z
  const sentimentRank = (notes: string | null): number => {
    const pref = parseBrandPreference(notes);
    if (pref?.sentiment === 'positive') return 0;
    if (pref?.sentiment === 'negative') return 2;
    return 1;
  };

  return entries.sort((a, b) => {
    const rankDiff = sentimentRank(a.notes) - sentimentRank(b.notes);
    if (rankDiff !== 0) return rankDiff;
    return a.brandName.localeCompare(b.brandName, 'it');
  });
}

export function shouldShowBrandSidePanel(
  productName: string,
  brandName: string,
  products: ShoppingProductOption[],
  brands: ShoppingSupplierOption[],
  readOnly = false
): boolean {
  if (!productName.trim()) return false;
  const tried = extractTriedBrandsForProduct(productName, products, brands);
  if (tried.length > 0) return true;
  if (!readOnly && brandName.trim()) return true;
  return false;
}

export interface ShoppingBrandJudgmentsListProps {
  productName: string;
  brandName: string;
  brandNotes?: string | null;
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  disabled?: boolean;
  readOnly?: boolean;
  onSelectBrand: (entry: TriedBrandEntry) => void;
  onClearBrand: () => void;
  onBrandNotesChange: (notes: string | null) => void;
}

export const ShoppingBrandJudgmentsList: React.FC<ShoppingBrandJudgmentsListProps> = ({
  productName,
  brandName,
  brandNotes,
  products,
  brands,
  disabled = false,
  readOnly = false,
  onSelectBrand,
  onClearBrand,
  onBrandNotesChange,
}) => {
  const triedBrands = useMemo(
    () => extractTriedBrandsForProduct(productName, products, brands),
    [productName, products, brands]
  );

  const trimmedBrand = brandName.trim();
  const lowerSelectedBrand = trimmedBrand.toLowerCase();

  const selectedTriedEntry = useMemo(
    () =>
      lowerSelectedBrand
        ? triedBrands.find((b) => b.brandName.toLowerCase() === lowerSelectedBrand) ?? null
        : null,
    [triedBrands, lowerSelectedBrand]
  );

  const otherTriedBrands = useMemo(
    () =>
      lowerSelectedBrand
        ? triedBrands.filter((b) => b.brandName.toLowerCase() !== lowerSelectedBrand)
        : triedBrands,
    [triedBrands, lowerSelectedBrand]
  );

  if (!trimmedBrand && otherTriedBrands.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3.5">
      {/* 1. SEZIONE IN ALTO: Marchio scelto (spostato in cima con lo stesso schema) */}
      {trimmedBrand && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
            Marchio scelto
          </div>
          <BrandPreferenceRatingControl
            productName={productName}
            brandName={trimmedBrand}
            value={brandNotes}
            onChange={onBrandNotesChange}
            lastPrice={selectedTriedEntry?.lastPrice}
            lastSupplierName={selectedTriedEntry?.lastSupplierName}
            onClearBrand={onClearBrand}
            disabled={disabled}
            readOnly={readOnly}
          />
        </div>
      )}

      {/* 2. LISTA VERTICALE: Note e marchi già provati (uno sotto l'altro) */}
      {otherTriedBrands.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            {trimmedBrand ? 'Altri marchi già provati' : 'Marchi già provati'}
          </div>

          <div className="flex flex-col gap-2">
            {otherTriedBrands.map((entry) => {
              const pref = parseBrandPreference(entry.notes);
              const isPos = pref?.sentiment === 'positive';
              const isNeg = pref?.sentiment === 'negative';
              const displayComment = pref?.comment || '';

              const formattedPrice =
                entry.lastPrice != null && entry.lastPrice > 0
                  ? entry.lastPrice.toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR',
                    })
                  : null;

              const rowColorClass = isNeg
                ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 hover:border-rose-300'
                : isPos
                ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70 hover:border-emerald-300'
                : 'bg-gray-50/80 border-gray-200 hover:bg-blue-50/50 hover:border-blue-200';

              return (
                <button
                  key={entry.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectBrand(entry)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed space-y-1.5 ${rowColorClass}`}
                >
                  {/* Riga 1: Nome Brand + Prezzo/Negozio + Badge Giudizio */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-sm text-gray-900 capitalize truncate">
                          {entry.brandName}
                        </span>
                        {formattedPrice && (
                          <span className="shrink-0 text-[11px] font-bold text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200">
                            {formattedPrice}
                          </span>
                        )}
                      </div>
                      {entry.lastSupplierName && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                          <StoreIcon className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate">{entry.lastSupplierName}</span>
                        </div>
                      )}
                    </div>

                    {isNeg ? (
                      <span
                        title="Da evitare"
                        className="shrink-0 w-7 h-7 rounded-lg text-sm bg-rose-100 border border-rose-200 flex items-center justify-center"
                      >
                        👎
                      </span>
                    ) : isPos ? (
                      <span
                        title="Gradito"
                        className="shrink-0 w-7 h-7 rounded-lg text-sm bg-emerald-100 border border-emerald-200 flex items-center justify-center"
                      >
                        👍
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white text-gray-500 border border-gray-200">
                        Già provato
                      </span>
                    )}
                  </div>

                  {/* Riga 2: Eventuale giudizio/nota testuale sul prodotto */}
                  {displayComment && (
                    <p
                      className={`text-xs italic leading-snug ${
                        isNeg
                          ? 'text-rose-700 font-medium'
                          : isPos
                          ? 'text-emerald-800 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      «{displayComment}»
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const ShoppingItemBrandSidePanel: React.FC<ShoppingBrandJudgmentsListProps> = (props) => {
  const triedCount = useMemo(
    () => extractTriedBrandsForProduct(props.productName, props.products, props.brands).length,
    [props.productName, props.products, props.brands]
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col w-full max-h-[90vh] animate-fadeIn">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h4 className="flex items-center gap-2 text-base font-bold text-gray-800 uppercase tracking-wider truncate">
          <TagIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="truncate">Note e Marchi Provati</span>
        </h4>
        {triedCount > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            {triedCount}
          </span>
        )}
      </div>

      <div className="p-5 overflow-y-auto modal-scrollbar">
        <ShoppingBrandJudgmentsList {...props} />
      </div>
    </div>
  );
};

export default ShoppingItemBrandSidePanel;
