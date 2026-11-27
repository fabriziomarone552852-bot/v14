// frontend/src/components/weather/WeatherBadge.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { WeatherIcon } from './WeatherIcon';
import { WeatherDetailModal } from './WeatherDetailModal';
import { getWeatherDescription } from '@/utils/weatherUtils';
import type { DailyForecast } from '@/types/weather';

export interface WeatherBadgeProps {
  targetDateStr?: string; // YYYY-MM-DD
  isToday?: boolean;
  className?: string;
  readOnly?: boolean;
  dark?: boolean;
  /** Se true, richiede un tocco prolungato di 600ms per aprire il modale (previene tap accidentali) */
  requireLongPress?: boolean;
  /** Layout compatto a singola riga ottimizzato per smartphone */
  compact?: boolean;
  /** Mostra solo icona meteo e temperatura, senza località né previsione testuale */
  minimal?: boolean;
  /** Mostra esclusivamente l'icona meteo pulita senza bordo né sfondo (es. celle vista Mese) */
  iconOnly?: boolean;
  /** Scala dimensionale per la modalità minimal ('sm' per testate colonna, 'xs' per intestazioni griglia settimana) */
  size?: 'xs' | 'sm';
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({
  targetDateStr,
  isToday = true,
  className = '',
  readOnly = false,
  dark = false,
  requireLongPress = false,
  compact = false,
  minimal = false,
  iconOnly = false,
  size = 'sm',
}) => {
  const {
    forecast,
    current,
    todayForecast,
    upcomingDaily,
    hourly,
    getDailyForecastForDate,
    getHourlyForecastForDate,
    cityName,
    isWeatherEnabled,
    isLoading,
  } = useWeather(undefined, undefined, undefined, !isToday ? targetDateStr : undefined);

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

  // Pulisci il timer allo smontaggio
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  if (!isWeatherEnabled) return null;

  const dailyForecast: DailyForecast | undefined = targetDateStr && !isToday
    ? getDailyForecastForDate(targetDateStr)
    : undefined;

  if (!isToday && !dailyForecast) {
    return null;
  }

  const symbolCode = isToday
    ? (current?.symbol_code || todayForecast?.symbol_code || 'cloudy')
    : (dailyForecast?.symbol_code || 'cloudy');

  const weatherCode = isToday
    ? (current?.weather_code ?? todayForecast?.weather_code)
    : dailyForecast?.weather_code;

  const isXsMinimal = minimal && size === 'xs';

  const displayTemp = isToday
    ? (typeof current?.temperature === 'number' ? `${Math.round(current.temperature)}°` : '--°')
    : (dailyForecast
        ? isXsMinimal
          ? `${Math.round(dailyForecast.temp_min)}°/${Math.round(dailyForecast.temp_max)}°`
          : `${Math.round(dailyForecast.temp_min)}° / ${Math.round(dailyForecast.temp_max)}°`
        : '--°');

  const desc = isLoading && !current
    ? 'Caricamento meteo...'
    : getWeatherDescription(symbolCode, weatherCode);

  const modalHourly = isToday
    ? hourly
    : (targetDateStr ? getHourlyForecastForDate(targetDateStr) : hourly);

  const spacingClass = iconOnly
    ? 'p-0.5 normal-case tracking-normal'
    : minimal
    ? isXsMinimal
      ? 'h-5 gap-1 px-1.5 normal-case tracking-normal'
      : 'h-7 gap-1.5 px-2.5 normal-case tracking-normal'
    : compact
    ? 'gap-1.5 px-2.5 py-1.5'
    : 'gap-2 px-3 py-1.5';

  const badgeInnerContent = iconOnly ? (
    <WeatherIcon symbolCode={symbolCode} size={18} />
  ) : minimal ? (
    <>
      <WeatherIcon symbolCode={symbolCode} size={isXsMinimal ? 14 : 18} />
      <span
        className={`${
          isXsMinimal ? 'text-[10px]' : 'text-xs'
        } font-bold leading-none tabular-nums whitespace-nowrap transition-colors ${
          dark ? 'text-white' : 'text-slate-700 group-hover:text-blue-600'
        }`}
      >
        {displayTemp}
      </span>
    </>
  ) : (
    <>
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
    </>
  );

  if (readOnly) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        className={`flex items-center justify-center shrink-0 ${spacingClass} ${
          iconOnly
            ? 'rounded-md'
            : dark
            ? 'rounded-full border backdrop-blur border-gray-700/80 bg-gray-800/90 text-white shadow-md'
            : 'rounded-full border backdrop-blur border-slate-200/80 bg-white/90 text-slate-800 shadow-xs'
        } text-left cursor-default select-none ${className}`}
        title={`Meteo a ${cityName || 'pos. selezionata'}: ${desc} (${displayTemp})`}
      >
        {badgeInnerContent}
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
        onDoubleClick={(e) => e.stopPropagation()}
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
        className={`group flex items-center justify-center shrink-0 ${spacingClass} text-left cursor-pointer select-none focus:outline-none ${
          isPressing
            ? 'scale-90 ring-2 ring-blue-500 ring-offset-2 bg-blue-50/90 border-blue-400'
            : ''
        } ${
          iconOnly
            ? 'rounded-md bg-transparent border-0 transition-transform duration-150 hover:scale-125 active:scale-95'
            : dark
            ? 'rounded-full border backdrop-blur transition-all duration-200 border-gray-700/80 bg-gray-800/90 hover:bg-gray-800 hover:border-gray-600 text-white shadow-md'
            : minimal
            ? 'rounded-full border backdrop-blur transition-all duration-200 border-slate-200/90 bg-slate-50/80 hover:bg-white hover:border-blue-300 shadow-2xs hover:shadow-xs'
            : 'rounded-full border backdrop-blur transition-all duration-200 border-slate-200/90 bg-white/95 hover:bg-white hover:border-blue-300 shadow-sm hover:shadow-md'
        } ${className}`}
        title={`Meteo a ${cityName || 'pos. selezionata'}: ${desc} (${displayTemp}). ${
          requireLongPress ? 'Tieni premuto 600ms per i dettagli' : 'Clicca per dettagli'
        }`}
      >
        {badgeInnerContent}
      </button>

      <WeatherDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cityName={cityName}
        isToday={isToday}
        targetDateStr={targetDateStr}
        current={current}
        todayForecast={todayForecast}
        targetDailyForecast={dailyForecast}
        hourly={modalHourly}
        daily={upcomingDaily}
        updatedAt={forecast?.updated_at}
        isLoading={isLoading}
      />
    </>
  );
};
