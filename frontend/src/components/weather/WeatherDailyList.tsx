// frontend/src/components/weather/WeatherDailyList.tsx
import React, { useMemo, useState } from 'react';
import type { DailyForecast } from '@/types/weather';
import { WeatherIcon } from './WeatherIcon';
import {
  extractTimeHHMM,
  formatShortItalianDay,
  getUvLevelInfo,
  getWeatherDescription,
} from '@/utils/weatherUtils';

interface WeatherDailyListProps {
  daily: DailyForecast[];
  highlightDateStr?: string;
  excludeToday?: boolean;
}

interface DayDetailPill {
  id: string;
  label: string;
  value: string;
  valueClass?: string;
}

export const WeatherDailyList: React.FC<WeatherDailyListProps> = ({
  daily,
  highlightDateStr,
  excludeToday = true,
}) => {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const visibleDays = useMemo(() => {
    const startIdx = excludeToday ? 1 : 0;
    return daily.slice(startIdx).map((day, offset) => ({
      day,
      originalIndex: startIdx + offset,
    }));
  }, [daily, excludeToday]);

  const { globalMin, globalSpan } = useMemo(() => {
    if (visibleDays.length === 0) return { globalMin: 0, globalSpan: 1 };
    const min = Math.min(...visibleDays.map((item) => item.day.temp_min));
    const max = Math.max(...visibleDays.map((item) => item.day.temp_max));
    return {
      globalMin: min,
      globalSpan: Math.max(max - min, 1),
    };
  }, [visibleDays]);

  if (visibleDays.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        Prossimi Giorni
      </h4>

      <div className="rounded-2xl bg-slate-50/80 border border-slate-200/60 divide-y divide-slate-200/50 overflow-hidden">
        {visibleDays.map(({ day, originalIndex }) => {
          const isHighlighted = highlightDateStr === day.date;
          const isExpanded = expandedDate === day.date;
          const leftPct = ((day.temp_min - globalMin) / globalSpan) * 100;
          const rawWidthPct = ((day.temp_max - day.temp_min) / globalSpan) * 100;
          const widthPct = Math.max(rawWidthPct, 8);
          const rainProb = day.precipitation_probability_max;
          const hasRainChance = typeof rainProb === 'number' && rainProb > 0;
          const uvInfo = getUvLevelInfo(day.uv_index_max);

          const detailPills: DayDetailPill[] = [];
          if (day.sunrise && day.sunset) {
            detailPills.push({
              id: 'sun',
              label: '🌅 Alba / Tram.',
              value: `${extractTimeHHMM(day.sunrise)} - ${extractTimeHHMM(day.sunset)}`,
            });
          }
          if (typeof day.wind_speed_max === 'number') {
            detailPills.push({
              id: 'wind',
              label: '💨 Vento max',
              value: `${Math.round(day.wind_speed_max)} km/h`,
            });
          }
          if (day.precipitation_total > 0) {
            detailPills.push({
              id: 'rain',
              label: '🌧️ Pioggia',
              value: `${day.precipitation_total} mm`,
              valueClass: 'text-blue-700',
            });
          }
          if (typeof day.uv_index_max === 'number') {
            detailPills.push({
              id: 'uv',
              label: '☀️ Indice UV',
              value: `${day.uv_index_max.toFixed(1)} · ${uvInfo.label}`,
              valueClass: uvInfo.badgeClass,
            });
          }

          return (
            <div
              key={day.date}
              className={isHighlighted ? 'bg-blue-50/60' : undefined}
            >
              <button
                type="button"
                onClick={() => setExpandedDate(isExpanded ? null : day.date)}
                className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/70 transition cursor-pointer"
                aria-expanded={isExpanded}
              >
                {/* Giorno */}
                <span
                  className={`text-xs font-bold w-16 shrink-0 truncate ${
                    isHighlighted ? 'text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {formatShortItalianDay(day.date, originalIndex)}
                </span>

                {/* Icona + Probabilità pioggia */}
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <WeatherIcon symbolCode={day.symbol_code} size={20} />
                  {hasRainChance ? (
                    <span className="text-[10px] font-bold text-blue-600">
                      💧{rainProb}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300">—</span>
                  )}
                </div>

                {/* Barra escursione termica */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-[11px] font-semibold text-slate-400 w-7 text-right shrink-0">
                    {Math.round(day.temp_min)}°
                  </span>
                  <div className="flex-1 min-w-[36px] max-w-[84px] h-1.5 rounded-full bg-slate-200/80 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-orange-500"
                      style={{
                        left: `${Math.min(leftPct, 92)}%`,
                        width: `${Math.min(widthPct, 100 - Math.min(leftPct, 92))}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 w-7 text-right shrink-0">
                    {Math.round(day.temp_max)}°
                  </span>
                </div>
              </button>

              {/* Dettagli giornalieri espandibili bilanciati da margine a margine */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-2 bg-white/85 border-t border-slate-100 text-[11px] text-slate-600 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">
                      {getWeatherDescription(day.symbol_code, day.weather_code)}
                    </span>
                    {typeof day.apparent_temp_min === 'number' &&
                      typeof day.apparent_temp_max === 'number' && (
                        <span className="text-[10px] font-medium text-slate-500">
                          Percepita {Math.round(day.apparent_temp_min)}° / {Math.round(day.apparent_temp_max)}°
                        </span>
                      )}
                  </div>

                  {detailPills.length > 0 && (
                    <div className="flex items-stretch justify-between gap-1.5 w-full">
                      {detailPills.map((pill) => (
                        <div
                          key={pill.id}
                          className="flex-1 min-w-0 rounded-lg bg-slate-50 border border-slate-200/60 px-1.5 py-1.5 flex flex-col items-center justify-center text-center"
                        >
                          <span className="text-[9px] font-semibold text-slate-400 leading-tight truncate max-w-full">
                            {pill.label}
                          </span>
                          <span
                            className={`text-[10px] font-bold leading-tight mt-0.5 truncate max-w-full ${
                              pill.valueClass || 'text-slate-700'
                            }`}
                          >
                            {pill.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
