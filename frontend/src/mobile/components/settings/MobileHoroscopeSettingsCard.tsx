// src/mobile/components/settings/MobileHoroscopeSettingsCard.tsx
import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useHoroscopePreference } from '@/hooks/useHoroscopePreference';
import {
  ZODIAC_SIGNS_LIST,
  getZodiacSignMeta,
  type ZodiacSignSlug,
} from '@/types/horoscope';
import { MobileModalSelect } from '@/mobile/components/common/MobileModalSelect';

export const MobileHoroscopeSettingsCard: React.FC = () => {
  const { preference, toggleEnabled, setSign } = useHoroscopePreference();
  const signMeta = useMemo(() => getZodiacSignMeta(preference.sign), [preference.sign]);

  const options = useMemo(
    () =>
      ZODIAC_SIGNS_LIST.map((s) => ({
        value: s.slug,
        label: `${s.symbol}  ${s.name} (${s.dateRange})`,
      })),
    []
  );

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">Oroscopo del Giorno</h3>
            <p className="text-[11px] text-gray-500">Mostra nella striscia rotante in Home</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleEnabled(!preference.enabled)}
          aria-label="Attiva o disattiva oroscopo"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            preference.enabled ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              preference.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {preference.enabled && (
        <div className="pt-3 border-t border-gray-100 animate-fadeIn">
          <MobileModalSelect
            label="Segno Zodiacale Predefinito"
            title="Scegli Segno Zodiacale"
            value={preference.sign}
            options={options}
            showAllOption={false}
            onChange={(val) => setSign(val as ZodiacSignSlug)}
            displayValueOverride={`${signMeta.symbol}  ${signMeta.name} · ${signMeta.dateRange}`}
          />
        </div>
      )}
    </div>
  );
};
