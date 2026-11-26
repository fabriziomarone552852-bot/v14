// src/components/shared/shopping/BrandPreferenceRatingControl.tsx
import React, { useState, useEffect } from 'react';
import {
  parseBrandPreference,
  formatBrandPreference,
  type BrandSentiment,
} from '@/utils/shoppingBrandPreference';
import { CloseIcon, StoreIcon } from '@/components/shared/utils/Icons';

export interface BrandPreferenceRatingControlProps {
  productName: string;
  brandName: string;
  value?: string | null;
  onChange?: (newValue: string | null) => void;
  lastPrice?: number | null;
  lastSupplierName?: string | null;
  onClearBrand?: () => void;
  disabled?: boolean;
  showPrice?: boolean;
  readOnly?: boolean;
}

export const BrandPreferenceRatingControl: React.FC<BrandPreferenceRatingControlProps> = ({
  productName,
  brandName,
  value,
  onChange,
  lastPrice,
  lastSupplierName,
  onClearBrand,
  disabled = false,
  showPrice = true,
  readOnly = false,
}) => {
  const parsed = parseBrandPreference(value);
  const currentSentiment: BrandSentiment = parsed?.sentiment || 'neutral';
  const currentComment = parsed?.comment || '';

  const [commentInput, setCommentInput] = useState(currentComment);

  useEffect(() => {
    setCommentInput(parsed?.comment || '');
  }, [value, parsed?.comment]);

  if (!productName.trim() || !brandName.trim()) {
    return null;
  }

  const handleSentimentChange = (newSentiment: BrandSentiment) => {
    if (disabled || readOnly || !onChange) return;
    const effectiveSentiment: BrandSentiment =
      currentSentiment === newSentiment ? 'neutral' : newSentiment;
    const formatted = formatBrandPreference(effectiveSentiment, commentInput);
    onChange(formatted);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !onChange) return;
    const val = e.target.value;
    setCommentInput(val);
    const formatted = formatBrandPreference(currentSentiment, val);
    onChange(formatted);
  };

  const formattedPrice =
    lastPrice != null && Number(lastPrice) > 0
      ? Number(lastPrice).toLocaleString('it-IT', {
          style: 'currency',
          currency: 'EUR',
        })
      : null;

  const cardColorClass =
    currentSentiment === 'positive'
      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200/70'
      : currentSentiment === 'negative'
      ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200/70'
      : 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-100';

  if (readOnly) {
    return (
      <div className={`p-3 rounded-xl border transition-all space-y-1.5 ${cardColorClass}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm text-gray-900 capitalize truncate">
                {brandName.trim()}
              </span>
              {showPrice && formattedPrice && (
                <span className="shrink-0 text-[11px] font-bold text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200">
                  {formattedPrice}
                </span>
              )}
            </div>
            {lastSupplierName && (
              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                <StoreIcon className="w-3 h-3 text-orange-500 shrink-0" />
                <span className="truncate">{lastSupplierName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {currentSentiment === 'negative' && (
              <span
                title="Da evitare"
                className="shrink-0 w-7 h-7 rounded-lg text-sm bg-rose-100 border border-rose-200 flex items-center justify-center"
              >
                👎
              </span>
            )}
            {currentSentiment === 'positive' && (
              <span
                title="Gradito"
                className="shrink-0 w-7 h-7 rounded-lg text-sm bg-emerald-100 border border-emerald-200 flex items-center justify-center"
              >
                👍
              </span>
            )}
            {onClearBrand && !disabled && (
              <button
                type="button"
                onClick={onClearBrand}
                title="Deseleziona marchio"
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white/80 transition-colors cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {currentComment && (
          <p
            className={`text-xs italic leading-snug ${
              currentSentiment === 'negative'
                ? 'text-rose-700 font-medium'
                : currentSentiment === 'positive'
                ? 'text-emerald-800 font-medium'
                : 'text-gray-600'
            }`}
          >
            «{currentComment}»
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl border transition-all space-y-2 ${cardColorClass}`}>
      {/* Riga 1: Nome Brand + Info ultimo acquisto + Pulsanti Giudizio */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-sm text-gray-900 capitalize truncate">
              {brandName.trim()}
            </span>
            {showPrice && formattedPrice && (
              <span className="shrink-0 text-[11px] font-bold text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200">
                {formattedPrice}
              </span>
            )}
          </div>
          {lastSupplierName && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
              <StoreIcon className="w-3 h-3 text-orange-500 shrink-0" />
              <span className="truncate">{lastSupplierName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleSentimentChange('positive')}
            disabled={disabled}
            title="Segna come gradito"
            aria-label="Segna come gradito"
            className={`w-8 h-7 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
              currentSentiment === 'positive'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200'
            }`}
          >
            <span>👍</span>
          </button>

          <button
            type="button"
            onClick={() => handleSentimentChange('negative')}
            disabled={disabled}
            title="Segna come da evitare"
            aria-label="Segna come da evitare"
            className={`w-8 h-7 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
              currentSentiment === 'negative'
                ? 'bg-rose-600 border-rose-600 text-white shadow-2xs'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50 hover:border-rose-200'
            }`}
          >
            <span>👎</span>
          </button>

          {onClearBrand && !disabled && (
            <button
              type="button"
              onClick={onClearBrand}
              title="Deseleziona marchio"
              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Riga 2: Nota / Giudizio sul prodotto */}
      <input
        type="text"
        value={commentInput}
        onChange={handleCommentChange}
        disabled={disabled}
        placeholder={
          currentSentiment === 'positive'
            ? 'Giudizio sul prodotto (es. ottima resa, da ricomprare)...'
            : currentSentiment === 'negative'
            ? 'Motivo per evitarlo (es. non buono, scadente)...'
            : 'Nota o giudizio sul prodotto (opzionale)...'
        }
        className="w-full text-xs px-2.5 py-1.5 bg-white/95 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
      />
    </div>
  );
};

export default BrandPreferenceRatingControl;
