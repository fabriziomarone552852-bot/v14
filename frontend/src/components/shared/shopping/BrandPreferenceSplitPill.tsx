// src/components/shared/shopping/BrandPreferenceSplitPill.tsx
import React, { useState, useEffect, useRef, memo } from 'react';
import {
  parseBrandPreference,
  formatBrandPreference,
  type BrandSentiment,
} from '@/utils/shoppingBrandPreference';

export interface BrandPreferenceSplitPillProps {
  value?: string | null;
  onChange: (newValue: string | null) => void;
  disabled?: boolean;
  className?: string;
  titlePrefix?: string;
}

export const BrandPreferenceSplitPill: React.FC<BrandPreferenceSplitPillProps> = memo(({
  value,
  onChange,
  disabled = false,
  className = '',
  titlePrefix = 'Valutazione',
}) => {
  const parsed = parseBrandPreference(value);
  const currentSentiment: BrandSentiment = parsed?.sentiment || 'neutral';
  const currentComment = parsed?.comment || '';
  const hasCustomComment = currentComment.trim().length > 0;

  // Stato per il popover di inserimento nota al doppio click
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempComment, setTempComment] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Aggiorna stato locale quando cambia il valore esterno
  useEffect(() => {
    setTempComment(currentComment);
  }, [currentComment]);

  // Focus automatico sull'input all'apertura del popover
  useEffect(() => {
    if (isNoteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isNoteOpen]);

  // Gestione click esterno per chiusura popover
  useEffect(() => {
    if (!isNoteOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsNoteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNoteOpen]);

  // Click su Pollice Su (Toggle on/off)
  const handleTogglePositive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (currentSentiment === 'positive') {
      // Se era positivo e non c'è commento personalizzato, torna neutro (null)
      const formatted = hasCustomComment ? formatBrandPreference('neutral', currentComment) : null;
      onChange(formatted);
    } else {
      const formatted = formatBrandPreference('positive', currentComment);
      onChange(formatted);
    }
  };

  // Click su Pollice Giù (Toggle on/off)
  const handleToggleNegative = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (currentSentiment === 'negative') {
      // Se era negativo e non c'è commento personalizzato, torna neutro (null)
      const formatted = hasCustomComment ? formatBrandPreference('neutral', currentComment) : null;
      onChange(formatted);
    } else {
      const formatted = formatBrandPreference('negative', currentComment);
      onChange(formatted);
    }
  };

  // Doppio click: apre l'editor della nota al volo
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setTempComment(currentComment);
    setIsNoteOpen(true);
  };

  // Salvataggio nota da popover
  const handleSaveNote = () => {
    const clean = tempComment.trim();
    const effectiveSentiment: BrandSentiment = currentSentiment === 'neutral' ? 'positive' : currentSentiment;
    const formatted = formatBrandPreference(effectiveSentiment, clean);
    onChange(formatted);
    setIsNoteOpen(false);
  };

  // Annullamento / Rimozione nota
  const handleClearNote = () => {
    setTempComment('');
    const formatted = formatBrandPreference(currentSentiment, '');
    onChange(formatted);
    setIsNoteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveNote();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsNoteOpen(false);
    }
  };

  // Tooltip descrittivo
  const getTooltip = () => {
    const parts: string[] = [];
    if (currentSentiment === 'positive') parts.push('👍 Consigliato / Da ricomprare');
    else if (currentSentiment === 'negative') parts.push('👎 Da evitare / Non ricomprare');
    else parts.push('⚪ Non valutato');

    if (hasCustomComment) {
      parts.push(`Nota: "${currentComment}"`);
    } else {
      parts.push('(Doppio click per aggiungere una nota)');
    }
    return `${titlePrefix}: ${parts.join(' - ')}`;
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Micro Split-Pill */}
      <div
        onDoubleClick={handleDoubleClick}
        title={getTooltip()}
        className={`inline-flex items-center rounded-lg border p-0.5 select-none transition shadow-2xs ${
          currentSentiment === 'positive'
            ? 'border-emerald-300 bg-emerald-50/60'
            : currentSentiment === 'negative'
            ? 'border-rose-300 bg-rose-50/60'
            : 'border-slate-200 bg-slate-50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'}`}
      >
        {/* Pulsante Pollice Su */}
        <button
          type="button"
          onClick={handleTogglePositive}
          disabled={disabled}
          className={`px-1.5 py-0.5 rounded text-[11px] leading-none transition cursor-pointer flex items-center justify-center ${
            currentSentiment === 'positive'
              ? 'bg-emerald-500 text-white shadow-xs font-bold'
              : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-100/60'
          }`}
          title="Consigliato / Da ricomprare (Click per attivare/disattivare)"
        >
          <span>👍</span>
        </button>

        {/* Separatore sottile */}
        <span className="w-px h-3 bg-slate-200 mx-0.5" />

        {/* Pulsante Pollice Giù */}
        <button
          type="button"
          onClick={handleToggleNegative}
          disabled={disabled}
          className={`px-1.5 py-0.5 rounded text-[11px] leading-none transition cursor-pointer flex items-center justify-center ${
            currentSentiment === 'negative'
              ? 'bg-rose-500 text-white shadow-xs font-bold'
              : 'text-slate-400 hover:text-rose-700 hover:bg-rose-100/60'
          }`}
          title="Da evitare / Non ricomprare (Click per attivare/disattivare)"
        >
          <span>👎</span>
        </button>

        {/* Indicatore micro-fumetto se è presente una nota testuale personalizzata */}
        {hasCustomComment && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setIsNoteOpen(true);
            }}
            className="ml-0.5 px-0.5 text-[10px] text-sky-600 hover:text-sky-800 transition cursor-pointer"
            title={`Nota: ${currentComment} (Click o doppio click per modificare)`}
          >
            💬
          </button>
        )}
      </div>

      {/* Popover / Micro-dialog per inserimento nota al doppio click */}
      {isNoteOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1.5 w-64 rounded-2xl bg-white border border-slate-200 p-3 shadow-xl text-left animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <span>✍️ Nota Valutazione Brand</span>
            </span>
            <button
              type="button"
              onClick={() => setIsNoteOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={tempComment}
              onChange={(e) => setTempComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Es. ottimo gusto, poco lievitato..."
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-sky-500 focus:bg-white transition"
            />

            <div className="flex items-center justify-between pt-1">
              {hasCustomComment ? (
                <button
                  type="button"
                  onClick={handleClearNote}
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  Rimuovi nota
                </button>
              ) : (
                <span className="text-[10px] text-slate-400">Invio per salvare</span>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsNoteOpen(false)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition cursor-pointer"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

BrandPreferenceSplitPill.displayName = 'BrandPreferenceSplitPill';
