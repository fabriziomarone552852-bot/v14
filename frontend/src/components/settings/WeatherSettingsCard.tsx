// frontend/src/components/settings/WeatherSettingsCard.tsx
import React, { useState, useEffect } from 'react';
import { useWeatherLocation } from '@/hooks/useWeatherLocation';
import { useWeather } from '@/hooks/useWeather';
import { weatherApi } from '@/api/weatherApi';
import { WeatherIcon, getWeatherDescription } from '@/components/weather/WeatherIcon';
import type { LocationSearchResult } from '@/types/weather';

export const WeatherSettingsCard: React.FC = () => {
  const {
    preference,
    isDetecting,
    geoError,
    toggleEnabled,
    setManualLocation,
    detectLocation,
  } = useWeatherLocation();

  const { current, isLoading: isWeatherLoading } = useWeather();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Ricerca con debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await weatherApi.searchLocations(trimmed);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    setManualLocation(loc.name, loc.latitude, loc.longitude);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl shrink-0">
            <WeatherIcon symbolCode="clearsky_day" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Previsioni Meteo (MET Norway)</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                Gratuito & Open Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizza temperatura, precipitazioni e icone meteo nella tua agenda (giorno e settimana).
            </p>
          </div>
        </div>

        {/* Toggle Abilitazione */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={preference.enabled}
            onChange={(e) => toggleEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-xs font-semibold text-slate-700">
            {preference.enabled ? 'Attivo' : 'Disattivato'}
          </span>
        </label>
      </div>

      {preference.enabled && (
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-4 animate-fadeIn">
          {/* Posizione Attuale Configurate & Live Preview */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200/80">
                <WeatherIcon symbolCode={current?.symbol_code || 'cloudy'} size={32} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Località Impostata
                </div>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>{preference.cityName}</span>
                  {preference.isAutoGeolocation && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-medium">
                      GPS Auto
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isWeatherLoading ? (
                    'Caricamento meteo...'
                  ) : current ? (
                    `${Math.round(current.temperature)}°C — ${getWeatherDescription(current.symbol_code)}`
                  ) : (
                    'In attesa di dati...'
                  )}
                </div>
              </div>
            </div>

            {/* Pulsante GPS */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetecting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-white text-xs font-bold text-blue-600 hover:bg-blue-50 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span>📍</span>
              <span>{isDetecting ? 'Rilevamento in corso...' : 'Usa Posizione GPS Attuale'}</span>
            </button>
          </div>

          {geoError && (
            <p className="text-xs text-rose-600 font-medium">{geoError}</p>
          )}

          {/* Ricerca Città */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Oppure Cerca e Scegli una Città:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digita il nome di una città (es. Milano, Firenze, Napoli...)"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5 text-xs text-slate-400 animate-spin">
                  ⏳
                </div>
              )}
            </div>

            {/* Risultati a comparsa */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLocation(item)}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 transition border-b border-slate-100 last:border-b-0 cursor-pointer flex flex-col"
                  >
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-[11px] text-slate-500 truncate">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
