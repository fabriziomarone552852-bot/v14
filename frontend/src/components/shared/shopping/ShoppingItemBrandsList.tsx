// src/components/shared/shopping/ShoppingItemBrandsList.tsx
import React from 'react';
import { StoreIcon } from '@/components/shared/utils/Icons';
import {
  parseBrandPreference,
  type BrandSentiment,
} from '@/utils/shoppingBrandPreference';
import type { RelatedBrandInfo } from './item/useItemRelatedBrands';

export interface ShoppingItemBrandsListProps {
  relatedBrands: RelatedBrandInfo[];
  editingBrandKey: string | null;
  draftSentiment: BrandSentiment;
  setDraftSentiment: React.Dispatch<React.SetStateAction<BrandSentiment>>;
  draftComment: string;
  setDraftComment: React.Dispatch<React.SetStateAction<string>>;
  onOpenEdit: (entry: RelatedBrandInfo) => void;
  onCancelEdit: () => void;
  onSaveEdit: (entry: RelatedBrandInfo) => void;
}

export const ShoppingItemBrandsList: React.FC<ShoppingItemBrandsListProps> = ({
  relatedBrands,
  editingBrandKey,
  draftSentiment,
  setDraftSentiment,
  draftComment,
  setDraftComment,
  onOpenEdit,
  onCancelEdit,
  onSaveEdit,
}) => {
  if (relatedBrands.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-gray-400">
        Nessun marchio associato a questo prodotto.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {relatedBrands.map((entry) => {
        const isEditing = editingBrandKey === entry.key;
        const pref = parseBrandPreference(entry.notes);
        const activeSentiment = isEditing ? draftSentiment : (pref?.sentiment ?? 'neutral');
        const isPos = activeSentiment === 'positive';
        const isNeg = activeSentiment === 'negative';
        const displayComment = pref?.comment || '';

        const bgClass = isNeg
          ? 'bg-rose-50/70'
          : isPos
          ? 'bg-emerald-50/70'
          : entry.isCurrentItemBrand
          ? 'bg-blue-50/30'
          : 'bg-gray-50/80';

        const borderClass = entry.isCurrentItemBrand
          ? 'border-2 border-blue-500 ring-2 ring-blue-500/15'
          : isNeg
          ? 'border border-rose-200 hover:border-rose-300'
          : isPos
          ? 'border border-emerald-200 hover:border-emerald-300'
          : 'border border-gray-200 hover:border-blue-300';

        if (isEditing) {
          return (
            <div
              key={entry.key}
              className={`p-3 rounded-xl space-y-2 transition-all ${bgClass} ${borderClass}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-gray-900 capitalize truncate">
                  {entry.brandName}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setDraftSentiment((prev) =>
                        prev === 'positive' ? 'neutral' : 'positive'
                      )
                    }
                    title="Segna come gradito"
                    aria-label="Segna come gradito"
                    className={`w-8 h-7 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
                      draftSentiment === 'positive'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200'
                    }`}
                  >
                    👍
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDraftSentiment((prev) =>
                        prev === 'negative' ? 'neutral' : 'negative'
                      )
                    }
                    title="Segna come da evitare"
                    aria-label="Segna come da evitare"
                    className={`w-8 h-7 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
                      draftSentiment === 'negative'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-2xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50 hover:border-rose-200'
                    }`}
                  >
                    👎
                  </button>
                </div>
              </div>

              <input
                type="text"
                autoFocus
                value={draftComment}
                onChange={(e) => setDraftComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSaveEdit(entry);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancelEdit();
                  }
                }}
                placeholder="Aggiungi o modifica commento..."
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
              />

              <div className="flex items-center justify-end gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => onSaveEdit(entry)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                >
                  Salva
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={entry.key}
            role="button"
            tabIndex={0}
            onClick={() => onOpenEdit(entry)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenEdit(entry);
              }
            }}
            title="Clicca per modificare giudizio e commento"
            className={`p-3 rounded-xl space-y-1.5 transition-all cursor-pointer ${bgClass} ${borderClass}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-gray-900 capitalize truncate block">
                  {entry.brandName}
                </span>

                {entry.lastSupplierName && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                    <StoreIcon className="w-3 h-3 text-orange-500 shrink-0" />
                    <span className="truncate">{entry.lastSupplierName}</span>
                  </div>
                )}
              </div>

              {isNeg ? (
                <span
                  title="Da evitare (clicca per modificare)"
                  className="shrink-0 w-7 h-7 rounded-lg text-sm bg-rose-100 border border-rose-200 flex items-center justify-center"
                >
                  👎
                </span>
              ) : isPos ? (
                <span
                  title="Gradito (clicca per modificare)"
                  className="shrink-0 w-7 h-7 rounded-lg text-sm bg-emerald-100 border border-emerald-200 flex items-center justify-center"
                >
                  👍
                </span>
              ) : (
                <span className="shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white text-gray-500 border border-gray-200">
                  Valuta
                </span>
              )}
            </div>

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
          </div>
        );
      })}
    </div>
  );
};

export default ShoppingItemBrandsList;
