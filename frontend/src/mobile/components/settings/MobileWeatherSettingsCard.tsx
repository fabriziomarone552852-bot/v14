// src/mobile/components/settings/MobileWeatherSettingsCard.tsx
import React, { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { useWeatherLocation } from '@/hooks/useWeatherLocation';
import { useWeather } from '@/hooks/useWeather';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import { getWeatherDescription } from '@/utils/weatherUtils';
import { MobileWeatherCityModal } from './MobileWeatherCityModal';

export const MobileWeatherSettingsCard: React.FC = () => {
  const {
    preference,
    isDetecting,
    geoError,
    toggleEnabled,
    setManualLocation,
    detectLocation,
  } = useWeatherLocation();

  const { current, isLoading: isWeatherLoading } = useWeather();
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
              <WeatherIcon symbolCode={current?.symbol_code || 'clearsky_day'} size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">Previsioni Meteo</h3>
              <p className="text-[11px] text-gray-500">Open-Meteo · Home, Giorno, Settimana e Mese</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleEnabled(!preference.enabled)}
            aria-label="Attiva o disattiva previsioni meteo"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              preference.enabled ? 'bg-blue-600' : 'bg-gray-300'
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
          <div className="pt-3 border-t border-gray-100 space-y-3 animate-fadeIn">
            {/* Riepilogo Località Attuale */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-sky-50/50 border border-slate-200/70 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-900 truncate">
                    {preference.cityName}
                  </span>
                  {preference.isAutoGeolocation && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 shrink-0">
                      GPS Auto
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {isWeatherLoading
                    ? 'Aggiornamento meteo...'
                    : current
                    ? `${Math.round(current.temperature)}°C · ${getWeatherDescription(
                        current.symbol_code,
                        current.weather_code
                      )}`
                    : 'Dati in arrivo...'}
                </div>
              </div>
            </div>

            {geoError && (
              <p className="text-[11px] text-rose-600 font-semibold">{geoError}</p>
            )}

            {/* Azioni Posizione: GPS o Modale Cerca Città */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={detectLocation}
                disabled={isDetecting}
                className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                {isDetecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                <span>{isDetecting ? 'Rilevo...' : 'Usa GPS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-gray-500" />
                <span>Cerca Città</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <MobileWeatherCityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentCityName={preference.cityName}
        onSelectLocation={(loc) => setManualLocation(loc.name, loc.latitude, loc.longitude)}
      />
    </>
  );
};
