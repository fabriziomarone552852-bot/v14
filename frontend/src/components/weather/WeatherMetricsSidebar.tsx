// frontend/src/components/weather/WeatherMetricsSidebar.tsx
import React from 'react';
import type { CurrentWeather, DailyForecast } from '@/types/weather';
import {
  extractTimeHHMM,
  formatWindDirection,
  getUvLevelInfo,
} from '@/utils/weatherUtils';
import {
  WeatherMetricTileArt,
  type WeatherMetricArtKind,
} from './WeatherMetricTileArt';

interface WeatherMetricsSidebarProps {
  isToday: boolean;
  current?: CurrentWeather;
  activeDaily?: DailyForecast;
  className?: string;
}

interface SidebarTileItem {
  id: string;
  art: WeatherMetricArtKind;
  bottomValue: string;
  tooltip: string;
  pressureHpa?: number | null;
}

const formatUvNumber = (uv?: number | null): string => {
  if (typeof uv !== 'number' || Number.isNaN(uv)) return '--';
  return Number.isInteger(uv) ? String(uv) : uv.toFixed(1);
};

export const WeatherMetricsSidebar: React.FC<WeatherMetricsSidebarProps> = ({
  isToday,
  current,
  activeDaily,
  className = '',
}) => {
  // 1. Alba - Tramonto (solo orari separati da "-")
  const sunriseStr = extractTimeHHMM(activeDaily?.sunrise);
  const sunsetStr = extractTimeHHMM(activeDaily?.sunset);
  const sunValue = `${sunriseStr} - ${sunsetStr}`;

  // 2. Indice UV (solo il numero)
  const uvVal = isToday
    ? (current?.uv_index ?? activeDaily?.uv_index_max)
    : activeDaily?.uv_index_max;
  const uvNumberStr = formatUvNumber(uvVal);
  const uvInfo = getUvLevelInfo(uvVal);

  // 3. Vento ("X km/h DIREZIONE")
  const windSpeed = isToday ? current?.wind_speed : activeDaily?.wind_speed_max;
  const windDir = formatWindDirection(
    isToday ? current?.wind_direction : activeDaily?.wind_direction_dominant
  );
  const windGusts = isToday ? current?.wind_gusts : activeDaily?.wind_gusts_max;
  const windValue =
    typeof windSpeed === 'number'
      ? `${Math.round(windSpeed)} km/h${windDir ? ` ${windDir}` : ''}`
      : '-- km/h';

  // 4. Pioggia (percentuale o accumulo mm per archivio storico)
  const rainProb = isToday
    ? (current?.precipitation_probability ?? activeDaily?.precipitation_probability_max)
    : activeDaily?.precipitation_probability_max;
  const rainTotalMm = activeDaily?.precipitation_total ?? 0;
  const rainValue =
    typeof rainProb === 'number'
      ? `${rainProb}%`
      : (!isToday && activeDaily ? `${rainTotalMm} mm` : '--%');

  // 5. Pressione con unità di misura hPa
  const pressureVal = isToday
    ? (current?.pressure_msl ?? activeDaily?.pressure_msl_mean)
    : activeDaily?.pressure_msl_mean;
  const pressureValue =
    typeof pressureVal === 'number' ? `${Math.round(pressureVal)} hPa` : '-- hPa';

  // 6. Nuvolosità
  const cloudVal = isToday
    ? (current?.cloud_area_fraction ?? activeDaily?.cloud_area_fraction_mean)
    : activeDaily?.cloud_area_fraction_mean;
  const cloudValue =
    typeof cloudVal === 'number' ? `${Math.round(cloudVal)}%` : '--%';

  const tiles: SidebarTileItem[] = [
    {
      id: 'sunrise',
      art: 'sunrise',
      bottomValue: sunValue,
      tooltip: `Alba ${sunriseStr} · Tramonto ${sunsetStr}`,
    },
    {
      id: 'uv',
      art: 'uv',
      bottomValue: uvNumberStr,
      tooltip: `Indice UV: ${uvNumberStr} (${uvInfo.label})`,
    },
    {
      id: 'wind',
      art: 'wind',
      bottomValue: windValue,
      tooltip:
        typeof windGusts === 'number'
          ? `Vento: ${windValue} (Raffiche ${Math.round(windGusts)} km/h)`
          : `Vento: ${windValue}`,
    },
    {
      id: 'rain',
      art: 'rain',
      bottomValue: rainValue,
      tooltip:
        rainTotalMm > 0
          ? `Probabilità di pioggia: ${rainValue} · Accumulo: ${rainTotalMm} mm`
          : `Probabilità di pioggia: ${rainValue}`,
    },
    {
      id: 'pressure',
      art: 'pressure',
      bottomValue: pressureValue,
      tooltip:
        typeof pressureVal === 'number'
          ? `Pressione atmosferica${isToday ? '' : ' media'}: ${Math.round(pressureVal)} hPa`
          : 'Pressione non disponibile',
      pressureHpa: pressureVal,
    },
    {
      id: 'clouds',
      art: 'clouds',
      bottomValue: cloudValue,
      tooltip: `Nuvolosità${isToday ? '' : ' media'}: ${cloudValue}`,
    },
  ];

  return (
    <aside
      className={`border-t sm:border-t-0 sm:border-l border-slate-200/70 bg-slate-50/75 p-2.5 grid grid-cols-3 sm:flex sm:flex-col gap-2 ${className}`}
      aria-label="Dettagli atmosferici"
    >
      {tiles.map((tile) => (
        <div
          key={tile.id}
          title={tile.tooltip}
          className="relative flex-1 min-h-[72px] sm:min-h-0 rounded-2xl overflow-hidden border border-white/80 shadow-xs flex flex-col justify-end"
        >
          <WeatherMetricTileArt kind={tile.art} pressureHpa={tile.pressureHpa} />

          {/* Sfumatura morbida estesa verso l'alto per fondersi dolcemente col riquadro */}
          <div
            className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* Valore nitido sul margine inferiore */}
          <div className="relative z-20 px-1.5 pb-1.5 pt-3 text-center">
            <span className="block text-[11px] font-extrabold text-white tracking-tight leading-tight drop-shadow-xs whitespace-nowrap">
              {tile.bottomValue}
            </span>
          </div>
        </div>
      ))}
    </aside>
  );
};
