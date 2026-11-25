// frontend/src/components/weather/WeatherDetailModal.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
} from '@/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { WeatherMetricsSidebar } from './WeatherMetricsSidebar';
import { WeatherHourlyStrip } from './WeatherHourlyStrip';
import { WeatherDailyList } from './WeatherDailyList';
import {
  formatItalianDayHeader,
  formatUpdatedAtHHMM,
  getWeatherDescription,
} from '@/utils/weatherUtils';

export interface WeatherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName?: string | null;
  isToday?: boolean;
  targetDateStr?: string;
  current?: CurrentWeather;
  todayForecast?: DailyForecast;
  targetDailyForecast?: DailyForecast;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  updatedAt?: string;
  isLoading?: boolean;
}

export const WeatherDetailModal: React.FC<WeatherDetailModalProps> = ({
  isOpen,
  onClose,
  cityName,
  isToday = true,
  targetDateStr,
  current,
  todayForecast,
  targetDailyForecast,
  hourly,
  daily,
  updatedAt,
}) => {
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const [showBottomFade, setShowBottomFade] = useState(true);

  const updateBodyFade = useCallback(() => {
    const el = bodyScrollRef.current;
    if (!el) return;
    setShowBottomFade(el.scrollTop + el.clientHeight < el.scrollHeight - 6);
  }, []);

  // Chiusura rapida con tasto Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const rafId = requestAnimationFrame(updateBodyFade);
    window.addEventListener('resize', updateBodyFade);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateBodyFade);
    };
  }, [isOpen, updateBodyFade, daily.length, hourly.length]);

  if (!isOpen || typeof document === 'undefined') return null;

  const activeDaily = isToday ? todayForecast : targetDailyForecast;
  const symbolCode = isToday
    ? (current?.symbol_code || todayForecast?.symbol_code || 'cloudy')
    : (targetDailyForecast?.symbol_code || 'cloudy');
  const weatherCode = isToday
    ? (current?.weather_code ?? todayForecast?.weather_code)
    : targetDailyForecast?.weather_code;
  const weatherDesc = getWeatherDescription(symbolCode, weatherCode);

  const displayTemp = isToday
    ? (typeof current?.temperature === 'number' ? `${Math.round(current.temperature)}°` : '--°')
    : (targetDailyForecast
        ? `${Math.round(targetDailyForecast.temp_min)}° / ${Math.round(targetDailyForecast.temp_max)}°`
        : '--°');

  const updatedLabel = formatUpdatedAtHHMM(updatedAt);

  // Per Oggi parte dall'ora corrente in avanti; per qualsiasi altro giorno filtra le 24 ore di quella data
  const currentHourPrefix = current?.time ? current.time.substring(0, 13) : '';
  const relevantHourly = isToday
    ? (currentHourPrefix
        ? hourly.filter((h) => h.time.substring(0, 13) >= currentHourPrefix)
        : hourly)
    : (targetDateStr ? hourly.filter((h) => h.time.startsWith(targetDateStr)) : []);

  const heroHumidity = isToday ? current?.humidity : targetDailyForecast?.humidity_mean;
  const heroRainProb = isToday
    ? current?.precipitation_probability
    : targetDailyForecast?.precipitation_probability_max;
  const heroRainAmount = isToday
    ? (current?.precipitation_amount ?? 0)
    : (targetDailyForecast?.precipitation_total ?? 0);

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_148px] grid-rows-[auto_minmax(0,1fr)_auto_auto] sm:grid-rows-[auto_minmax(0,1fr)_auto] rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur pointer-events-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {/* Header Fisso */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 sm:col-start-1 sm:row-start-1">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Open-Meteo Weather
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {cityName || 'Previsioni Meteo'}
            </h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Corpo Scorrevole con leggera sfumatura sopra il footer */}
        <div className="relative min-h-0 flex flex-col sm:col-start-1 sm:row-start-2">
          <div
            ref={bodyScrollRef}
            onScroll={updateBodyFade}
            className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 space-y-4 modal-scrollbar"
          >
            {/* 1. Card Principale (Hero — senza vento) */}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 border border-blue-100/60">
              <div className="flex items-center gap-3 min-w-0">
                <WeatherIcon symbolCode={symbolCode} size={50} />
                <div className="min-w-0">
                  <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {displayTemp}
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-1">
                    {isToday ? (
                      <>
                        {typeof current?.apparent_temperature === 'number' && (
                          <span>Percepita {Math.round(current.apparent_temperature)}°</span>
                        )}
                        {todayForecast && (
                          <span className="text-slate-500">
                            {typeof current?.apparent_temperature === 'number' ? ' · ' : ''}
                            {Math.round(todayForecast.temp_min)}° / {Math.round(todayForecast.temp_max)}°
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-700">
                          {targetDateStr ? formatItalianDayHeader(targetDateStr) : ''}
                          {weatherDesc ? ` · ${weatherDesc}` : ''}
                        </div>
                        {typeof targetDailyForecast?.apparent_temp_min === 'number' &&
                          typeof targetDailyForecast?.apparent_temp_max === 'number' && (
                            <div className="text-slate-500">
                              Percepita {Math.round(targetDailyForecast.apparent_temp_min)}° /{' '}
                              {Math.round(targetDailyForecast.apparent_temp_max)}°
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(typeof heroHumidity === 'number' || heroRainAmount > 0 || (heroRainProb ?? 0) > 0) && (
                <div className="text-right text-xs text-slate-500 space-y-1 shrink-0">
                  {typeof heroHumidity === 'number' && (
                    <div>
                      💧 Umidità: <strong className="text-slate-800">{Math.round(heroHumidity)}%</strong>
                    </div>
                  )}
                  {(heroRainAmount > 0 || (heroRainProb ?? 0) > 0) && (
                    <div>
                      🌧️ Pioggia:{' '}
                      <strong className="text-blue-700">
                        {typeof heroRainProb === 'number' ? `${heroRainProb}%` : ''}
                        {heroRainAmount > 0
                          ? `${typeof heroRainProb === 'number' ? ' · ' : ''}${heroRainAmount} mm`
                          : ''}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Prossime Ore (striscia per Oggi, griglia 4x6 completa 00-23 per altri giorni) */}
            <WeatherHourlyStrip
              hourly={relevantHourly}
              isToday={isToday}
              layout={isToday ? 'strip' : 'grid'}
            />

            {/* 3. Prossimi Giorni (mostrato solo aprendo il meteo di Oggi) */}
            {isToday && (
              <WeatherDailyList
                daily={daily}
                excludeToday={true}
              />
            )}
          </div>

          {/* Leggera sfumatura sopra il footer durante lo scorrimento */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/95 via-white/70 to-transparent z-10 transition-opacity duration-200 ${
              showBottomFade ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Barra Laterale a Tutta Altezza con i 6 Riquadri Illustrati */}
        <WeatherMetricsSidebar
          isToday={isToday}
          current={current}
          activeDaily={activeDaily}
          className="sm:col-start-2 sm:row-start-1 sm:row-span-3"
        />

        {/* Footer Fisso (senza pulsante Chiudi) */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white/90 flex items-center justify-between text-[11px] text-slate-400 sm:col-start-1 sm:row-start-3">
          <span>
            Dati forniti da <strong>Open-Meteo</strong>
            {updatedLabel ? ` · Agg. ${updatedLabel}` : ''}
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
