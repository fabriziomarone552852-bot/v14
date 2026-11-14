// frontend/src/components/weather/WeatherBadge.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useWeather } from '@/hooks/useWeather';
import { WeatherIcon } from './WeatherIcon';
import { getWeatherDescription } from '@/utils/weatherUtils';
import type { DailyForecast } from '@/types/weather';

interface WeatherBadgeProps {
  targetDateStr?: string; // YYYY-MM-DD
  isToday?: boolean;
  className?: string;
  readOnly?: boolean;
  dark?: boolean;
  /** Se true, richiede un tocco prolungato di 600ms per aprire il modale (previene tap accidentali) */
  requireLongPress?: boolean;
  /** Layout compatto a singola riga ottimizzato per smartphone */
  compact?: boolean;
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({
  targetDateStr,
  isToday = true,
  className = '',
  readOnly = false,
  dark = false,
  requireLongPress = false,
  compact = false,
}) => {
  const { current, getDailyForecastForDate, cityName, isWeatherEnabled, hourly, isLoading } = useWeather();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressing(false);
    touchStartPosRef.current = null;
  }, []);

  const startLongPress = useCallback((clientX: number, clientY: number) => {
    if (readOnly || !requireLongPress) return;
    cancelLongPress();
    touchStartPosRef.current = { x: clientX, y: clientY };
    setIsPressing(true);

    longPressTimerRef.current = setTimeout(() => {
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(35);
        }
      } catch {
        // ignore
      }
      setIsPressing(false);
      setIsModalOpen(true);
      longPressTimerRef.current = null;
    }, 600);
  }, [readOnly, requireLongPress, cancelLongPress]);

  // Pulisci il timer al disaccoppiamento
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Chiudi con il tasto Escape (solo se interattivo)
  useEffect(() => {
    if (readOnly || !isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, isModalOpen]);

  if (!isWeatherEnabled) return null;

  // Se c'è una data specifica e non è oggi, proviamo a prendere la previsione giornaliera
  const dailyForecast: DailyForecast | undefined = targetDateStr && !isToday
    ? getDailyForecastForDate(targetDateStr)
    : undefined;

  // Se è un giorno futuro fuori dall'orizzonte previsionale (oltre 10 giorni) o passato, non mostrare nulla
  if (!isToday && !dailyForecast && !isLoading) {
    return null;
  }

  const symbolCode = isToday
    ? current?.symbol_code
    : (dailyForecast?.symbol_code || 'cloudy');

  const displayTemp = isToday
    ? (typeof current?.temperature === 'number' ? `${Math.round(current.temperature)}°` : '--°')
    : (dailyForecast ? `${Math.round(dailyForecast.temp_min)}° / ${Math.round(dailyForecast.temp_max)}°` : '--°');

  const desc = isLoading && !current
    ? 'Caricamento meteo...'
    : getWeatherDescription(symbolCode);

  const modalContent = (!readOnly && isModalOpen) ? (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none"
      onClick={() => setIsModalOpen(false)}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              MET Norway Weather
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {cityName || 'Previsioni Meteo'}
            </h3>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Dati Principali */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 border border-blue-100/60">
          <div className="flex items-center gap-3">
            <WeatherIcon symbolCode={symbolCode} size={48} />
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {displayTemp}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {isToday ? `Attuale (${desc})` : `Previsto per ${targetDateStr}`}
              </div>
            </div>
          </div>

          {isToday && current && (
            <div className="text-right text-xs text-slate-500 space-y-1">
              <div>💧 Umidità: <strong className="text-slate-800">{Math.round(current.humidity)}%</strong></div>
              <div>💨 Vento: <strong className="text-slate-800">{current.wind_speed} m/s</strong></div>
              {current.precipitation_amount > 0 && (
                <div>🌧️ Pioggia: <strong className="text-blue-700">{current.precipitation_amount} mm</strong></div>
              )}
            </div>
          )}
        </div>

        {/* Previsioni Prossime Ore (se oggi) */}
        {isToday && hourly.length > 0 && (
          <div className="mt-5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Prossime Ore
            </h4>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {hourly.slice(0, 8).map((hour, idx) => {
                const timeLabel = hour.time.substring(11, 16);
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200/60 shrink-0 w-16 text-center"
                  >
                    <span className="text-[11px] font-semibold text-slate-500">{timeLabel}</span>
                    <div className="my-1">
                      <WeatherIcon symbolCode={hour.symbol_code} size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {Math.round(hour.temperature)}°
                    </span>
                    {hour.precipitation_amount > 0 && (
                      <span className="text-[10px] text-blue-600 font-semibold mt-0.5">
                        {hour.precipitation_amount}mm
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dati forniti da <strong>Meteorologisk institutt</strong></span>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition cursor-pointer text-xs"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (readOnly) {
    return (
      <div
        className={`flex items-center ${
          compact ? 'gap-1.5 px-2.5 py-1.5' : 'gap-2 px-3 py-1.5'
        } rounded-full border backdrop-blur text-left cursor-default select-none ${
          dark
            ? 'border-gray-700/80 bg-gray-800/90 text-white shadow-md'
            : 'border-slate-200/80 bg-white/90 text-slate-800 shadow-xs'
        } ${className}`}
        title={`Meteo a ${cityName || 'pos. selezionata'}: ${desc}`}
      >
        <WeatherIcon symbolCode={symbolCode} size={compact ? 18 : 20} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-xs font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
              {displayTemp}
            </span>
            {cityName && (
              <span className={`text-[10px] font-medium hidden sm:inline truncate max-w-[80px] ${dark ? 'text-gray-400' : 'text-slate-400'}`}>
                {cityName}
              </span>
            )}
          </div>
          {!compact && (
            <span className={`text-[10px] font-medium leading-none mt-0.5 truncate max-w-[110px] ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
              {desc}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (requireLongPress) return;
          setIsModalOpen(true);
        }}
        onTouchStart={(e) => {
          if (requireLongPress) {
            const touch = e.touches[0];
            startLongPress(touch.clientX, touch.clientY);
          }
        }}
        onTouchMove={(e) => {
          if (requireLongPress && touchStartPosRef.current) {
            const touch = e.touches[0];
            const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
            const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
            // Se il dito si sposta di oltre 8px (scroll elenchi), cancella il tocco prolungato
            if (dx > 8 || dy > 8) {
              cancelLongPress();
            }
          }
        }}
        onTouchEnd={() => {
          if (requireLongPress) cancelLongPress();
        }}
        onTouchCancel={() => {
          if (requireLongPress) cancelLongPress();
        }}
        onMouseDown={(e) => {
          if (requireLongPress) {
            startLongPress(e.clientX, e.clientY);
          }
        }}
        onMouseUp={() => {
          if (requireLongPress) cancelLongPress();
        }}
        onMouseLeave={() => {
          if (requireLongPress) cancelLongPress();
        }}
        className={`group flex items-center ${
          compact ? 'gap-1.5 px-2.5 py-1.5' : 'gap-2 px-3 py-1.5'
        } rounded-full border backdrop-blur text-left cursor-pointer transition-all duration-200 select-none ${
          isPressing
            ? 'scale-90 ring-2 ring-blue-500 ring-offset-2 bg-blue-50/90 border-blue-400'
            : ''
        } ${
          dark
            ? 'border-gray-700/80 bg-gray-800/90 hover:bg-gray-800 hover:border-gray-600 text-white shadow-md'
            : 'border-slate-200/90 bg-white/95 hover:bg-white hover:border-blue-300 shadow-sm hover:shadow-md'
        } ${className}`}
        title={`Meteo a ${cityName || 'pos. selezionata'}: ${desc}. ${
          requireLongPress ? 'Tieni premuto 600ms per i dettagli' : 'Clicca per dettagli'
        }`}
      >
        <WeatherIcon symbolCode={symbolCode} size={compact ? 18 : 20} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-xs font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
              {displayTemp}
            </span>
            {cityName && (
              <span className={`text-[10px] font-medium hidden sm:inline truncate max-w-[80px] ${dark ? 'text-gray-400' : 'text-slate-400'}`}>
                {cityName}
              </span>
            )}
          </div>
          {!compact && (
            <span className={`text-[10px] font-medium leading-none mt-0.5 truncate max-w-[110px] ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
              {desc}
            </span>
          )}
        </div>
      </button>

      {/* Portale Globale al Body per garantire sovrapposizione assoluta */}
      {typeof document !== 'undefined' && modalContent && createPortal(modalContent, document.body)}
    </>
  );
};
