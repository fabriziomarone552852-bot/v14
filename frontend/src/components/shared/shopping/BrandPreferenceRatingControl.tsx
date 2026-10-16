// src/components/shared/shopping/BrandPreferenceRatingControl.tsx
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  parseBrandPreference,
  formatBrandPreference,
  type BrandSentiment,
} from '@/utils/shoppingBrandPreference';
import { saveProductBrandPreference } from '@/api/shopping/shoppingConfigApi';
import { shoppingQueryKeys } from '@/api/shoppingApi';
import { Check } from 'lucide-react';

export interface BrandPreferenceRatingControlProps {
  productName: string;
  brandName: string;
  value?: string | null;
  onChange: (newValue: string | null) => void;
  productId?: number | null;
  brandId?: number | null;
  disabled?: boolean;
}

export const BrandPreferenceRatingControl: React.FC<BrandPreferenceRatingControlProps> = ({
  productName,
  brandName,
  value,
  onChange,
  productId,
  brandId,
  disabled = false,
}) => {
  const queryClient = useQueryClient();
  const parsed = parseBrandPreference(value);
  const currentSentiment: BrandSentiment = parsed?.sentiment || 'neutral';
  const currentComment = parsed?.comment || '';

  const [commentInput, setCommentInput] = useState(currentComment);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setCommentInput(parsed?.comment || '');
  }, [value]);

  if (!productName.trim() || !brandName.trim()) {
    return null;
  }

  const handleSentimentChange = (newSentiment: BrandSentiment) => {
    if (disabled) return;
    const effectiveSentiment = currentSentiment === newSentiment && newSentiment !== 'neutral'
      ? 'neutral'
      : newSentiment;
    const formatted = formatBrandPreference(effectiveSentiment, commentInput);
    onChange(formatted);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommentInput(val);
    const formatted = formatBrandPreference(currentSentiment, val);
    onChange(formatted);
  };

  const handleInstantSave = async () => {
    if (!productId || !brandId || disabled || isSaving) return;
    setIsSaving(true);
    try {
      const formatted = formatBrandPreference(currentSentiment, commentInput);
      await saveProductBrandPreference({
        productId,
        brandId,
        notes: formatted,
      });
      await queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (err) {
      console.error('Errore durante il salvataggio rapido della preferenza brand:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasDirectSave = Boolean(productId && brandId);

  return (
    <div className="mt-3 p-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-indigo-100 rounded-xl space-y-2 animate-fadeIn">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <span>⭐ Valutazione Marchio per questo Prodotto</span>
        </label>
        {hasDirectSave && (
          <button
            type="button"
            onClick={handleInstantSave}
            disabled={disabled || isSaving}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
              justSaved
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
            }`}
          >
            {justSaved ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Memorizzato!</span>
              </>
            ) : isSaving ? (
              <span>Salvataggio...</span>
            ) : (
              <span>Memorizza ora</span>
            )}
          </button>
        )}
      </div>

      {/* Pulsanti Rapidi Sentiment: 👍 Gradito / 👎 Da evitare / ⚪ Neutro */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => handleSentimentChange('positive')}
          disabled={disabled}
          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            currentSentiment === 'positive'
              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-2xs ring-1 ring-emerald-400'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'
          }`}
        >
          <span className="text-sm">👍</span>
          <span>Gradito</span>
        </button>

        <button
          type="button"
          onClick={() => handleSentimentChange('negative')}
          disabled={disabled}
          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            currentSentiment === 'negative'
              ? 'bg-rose-100 border-rose-400 text-rose-900 shadow-2xs ring-1 ring-rose-400'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200'
          }`}
        >
          <span className="text-sm">👎</span>
          <span>Da evitare</span>
        </button>

        <button
          type="button"
          onClick={() => handleSentimentChange('neutral')}
          disabled={disabled}
          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
            currentSentiment === 'neutral'
              ? 'bg-slate-200/80 border-slate-300 text-slate-800 shadow-2xs'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span>Neutro</span>
        </button>
      </div>

      {/* Dettaglio / Commento Libero */}
      <div>
        <input
          type="text"
          value={commentInput}
          onChange={handleCommentChange}
          disabled={disabled}
          placeholder={
            currentSentiment === 'positive'
              ? 'Es. Buona da ricomprare, ottima tenuta...'
              : currentSentiment === 'negative'
              ? 'Es. Non buono, non ricomprare, troppo amaro...'
              : 'Commento su questo marchio (opzionale)...'
          }
          className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
        />
      </div>

      <div className="text-[10px] text-gray-400 flex items-center justify-between">
        <span>
          💡 Rimarrà memorizzato per <strong>{productName}</strong> ({brandName})
        </span>
        {currentSentiment === 'negative' && (
          <span className="text-rose-600 font-semibold flex items-center gap-0.5">
            ⚠️ Verrà segnalato in rosso nelle future liste
          </span>
        )}
        {currentSentiment === 'positive' && (
          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
            ✓ Verrà evidenziato come gradito
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandPreferenceRatingControl;
