// frontend/src/components/weather/WeatherHourlyStrip.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { HourlyForecast } from '@/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { extractTimeHHMM, getShortWeekdayFromIso } from '@/utils/weatherUtils';

interface WeatherHourlyStripProps {
  hourly: HourlyForecast[];
  isToday: boolean;
  layout?: 'strip' | 'grid';
}

export const WeatherHourlyStrip: React.FC<WeatherHourlyStripProps> = ({
  hourly,
  isToday,
  layout = 'strip',
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(true);

  const displayedHours = hourly.slice(0, 24);
  const isGrid = layout === 'grid';

  const updateEdgeFades = useCallback(() => {
    if (isGrid) return;
    const el = scrollRef.current;
    if (!el) return;
    setFadeLeft(el.scrollLeft > 4);
    setFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, [isGrid]);

  useEffect(() => {
    if (isGrid) return;
    const rafId = requestAnimationFrame(updateEdgeFades);
    window.addEventListener('resize', updateEdgeFades);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateEdgeFades);
    };
  }, [isGrid, updateEdgeFades, displayedHours.length]);

  if (displayedHours.length === 0) return null;

  const renderHourCard = (hour: HourlyForecast, idx: number) => {
    const hhmm = extractTimeHHMM(hour.time);
    const isNowCard = isToday && idx === 0;
    const prevDate = idx > 0 ? displayedHours[idx - 1].time.substring(0, 10) : null;
    const currDate = hour.time.substring(0, 10);
    const isNewDay = prevDate !== null && currDate !== prevDate;
    const dayTag = isNewDay ? getShortWeekdayFromIso(hour.time) : null;

    const hasRainProb =
      typeof hour.precipitation_probability === 'number' &&
      hour.precipitation_probability > 0;
    const hasRainMm = hour.precipitation_amount > 0;

    return (
      <div
        key={hour.time}
        className={`flex flex-col items-center justify-center rounded-xl border text-center transition ${
          isGrid ? 'w-full py-1.5 px-1 sm:py-2 sm:px-1.5' : 'p-2 shrink-0 w-16'
        } ${
          isNowCard
            ? 'bg-blue-50/80 border-blue-300/80 shadow-2xs'
            : 'bg-slate-50 border-slate-200/60'
        }`}
      >
        <span
          className={`text-[10px] font-bold leading-tight ${
            isNowCard ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          {isNowCard ? 'Ora' : dayTag ? `${dayTag} ${hhmm.slice(0, 2)}` : hhmm}
        </span>

        <div className={isGrid ? 'my-0.5 sm:my-1' : 'my-1.5'}>
          <WeatherIcon symbolCode={hour.symbol_code} size={isGrid ? 20 : 22} />
        </div>

        <span className="text-xs font-extrabold text-slate-800 leading-tight">
          {Math.round(hour.temperature)}°
        </span>

        {(hasRainProb || hasRainMm) && (
          <span className="text-[9.5px] sm:text-[10px] text-blue-600 font-semibold mt-0.5 leading-tight whitespace-nowrap">
            {hasRainProb ? `💧${hour.precipitation_probability}%` : `${hour.precipitation_amount}mm`}
          </span>
        )}
      </div>
    );
  };

  if (isGrid) {
    return (
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Dettaglio Orario
        </h4>
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {displayedHours.map((hour, idx) => renderHourCard(hour, idx))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        {isToday ? 'Prossime Ore' : 'Dettaglio Orario'}
      </h4>

      <div className="relative">
        {/* Sfumatura leggera bordo sinistro */}
        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-2 w-7 bg-gradient-to-r from-white/95 via-white/60 to-transparent z-10 transition-opacity duration-200 ${
            fadeLeft ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Sfumatura leggera bordo destro */}
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-2 w-7 bg-gradient-to-l from-white/95 via-white/60 to-transparent z-10 transition-opacity duration-200 ${
            fadeRight ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          onScroll={updateEdgeFades}
          className="flex gap-2 overflow-x-auto pb-2 modal-scrollbar"
        >
          {displayedHours.map((hour, idx) => renderHourCard(hour, idx))}
        </div>
      </div>
    </div>
  );
};
