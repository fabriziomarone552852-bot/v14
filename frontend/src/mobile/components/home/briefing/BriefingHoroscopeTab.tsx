// src/mobile/components/home/briefing/BriefingHoroscopeTab.tsx
import React, { useMemo } from 'react';
import { Heart, Briefcase, Sparkles, Activity } from 'lucide-react';
import {
  ZODIAC_SIGNS_LIST,
  type HoroscopeSignEntry,
  type ZodiacSignSlug,
  type ZodiacSignMeta,
} from '@/types/horoscope';
import { MobileModalSelect } from '@/mobile/components/common/MobileModalSelect';

export interface BriefingHoroscopeTabProps {
  isHoroscopeEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
  activeSign: ZodiacSignSlug;
  activeSignMeta: ZodiacSignMeta;
  entry?: HoroscopeSignEntry;
  onChangeSign: (sign: ZodiacSignSlug) => void;
  onToggleEnabled: (enabled: boolean) => void;
}

export const BriefingHoroscopeTab: React.FC<BriefingHoroscopeTabProps> = ({
  isHoroscopeEnabled,
  isLoading,
  isError,
  activeSign,
  activeSignMeta,
  entry,
  onChangeSign,
  onToggleEnabled,
}) => {
  const signOptions = useMemo(
    () =>
      ZODIAC_SIGNS_LIST.map((s) => ({
        value: s.slug,
        label: `${s.symbol}  ${s.name} (${s.dateRange})`,
      })),
    []
  );

  if (!isHoroscopeEnabled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center space-y-3 animate-fadeIn">
        <p className="text-xs font-bold text-slate-700">
          L'oroscopo giornaliero è attualmente disattivato.
        </p>
        <button
          type="button"
          onClick={() => onToggleEnabled(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition"
        >
          Attiva Oroscopo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Selettore Segno Zodiacale (Regola d'Oro Mobile: Modale Centrato a 0ms) */}
      <MobileModalSelect
        label="Il tuo Segno Zodiacale"
        title="Scegli Segno Zodiacale"
        value={activeSign}
        options={signOptions}
        showAllOption={false}
        onChange={(val) => onChangeSign(val as ZodiacSignSlug)}
        displayValueOverride={`${activeSignMeta.symbol}  ${activeSignMeta.name} · ${activeSignMeta.dateRange}`}
      />

      {isLoading && !entry ? (
        <div className="py-8 text-center text-xs font-semibold text-slate-400 animate-pulse">
          Lettura delle stelle per {activeSignMeta.name}...
        </div>
      ) : isError || !entry ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-center text-xs font-semibold text-rose-700">
          Oroscopo temporaneamente non disponibile. Riprova tra poco.
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* 1. Quadro Generale */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white border border-indigo-100 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quadro Astrale</span>
              </span>
              {entry.date_label && (
                <span className="text-[10px] font-semibold text-slate-400 capitalize">
                  {entry.date_label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {entry.general}
            </p>
          </div>

          {/* 2. Amore ed Eros */}
          {entry.love && (
            <div className="rounded-2xl bg-rose-50/50 border border-rose-100/90 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-rose-700">
                <Heart className="w-3.5 h-3.5" />
                <span>Amore ed Eros</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{entry.love}</p>
            </div>
          )}

          {/* 3. Lavoro e Denaro */}
          {entry.work && (
            <div className="rounded-2xl bg-amber-50/50 border border-amber-100/90 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Lavoro e Denaro</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{entry.work}</p>
            </div>
          )}

          {/* 4. Benessere */}
          {entry.wellness && (
            <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100/90 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                <Activity className="w-3.5 h-3.5" />
                <span>Benessere</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{entry.wellness}</p>
            </div>
          )}

          <div className="text-right text-[10px] text-slate-400 font-medium pt-0.5">
            Fonte: {entry.source}
          </div>
        </div>
      )}
    </div>
  );
};
