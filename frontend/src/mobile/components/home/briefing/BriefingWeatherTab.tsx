// src/mobile/components/home/briefing/BriefingWeatherTab.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import type {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
} from '@/types/weather';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import {
  ATMOSPHERE_PRESETS,
  resolveAtmosphereType,
} from '@/components/dashboard/weather/weatherAtmosphereTypes';
import { WEATHER_KEYFRAMES_CSS } from '@/components/dashboard/weather/WeatherScenePrimitives';
import { WeatherAtmosphereScene } from '@/components/dashboard/weather/WeatherAtmosphereScenes';
import { getMoonPhaseInfo } from '@/utils/moonPhaseUtils';
import { extractTimeHHMM, getWeatherDescription } from '@/utils/weatherUtils';

export interface BriefingWeatherTabProps {
  isWeatherEnabled: boolean;
  isLoading: boolean;
  cityName?: string | null;
  current?: CurrentWeather;
  todayForecast?: DailyForecast;
  hourly: HourlyForecast[];
  onOpenFullWeather: () => void;
  onCloseBriefing: () => void;
}

export const BriefingWeatherTab: React.FC<BriefingWeatherTabProps> = ({
  isWeatherEnabled,
  isLoading,
  cityName,
  current,
  todayForecast,
  hourly,
  onOpenFullWeather,
  onCloseBriefing,
}) => {
  const navigate = useNavigate();
  const moonPhase = useMemo(() => getMoonPhaseInfo(new Date()), []);

  const atmosphereType = useMemo(
    () => resolveAtmosphereType(current?.symbol_code, current?.weather_code, current?.is_day),
    [current?.symbol_code, current?.weather_code, current?.is_day]
  );

  const currentTime = current?.time;
  const upcomingHours = useMemo(() => {
    const prefix = currentTime ? currentTime.substring(0, 13) : '';
    const filtered = prefix ? hourly.filter((h) => h.time.substring(0, 13) >= prefix) : hourly;
    return filtered.slice(0, 6);
  }, [hourly, currentTime]);

  if (!isWeatherEnabled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center space-y-3 animate-fadeIn">
        <p className="text-xs font-bold text-slate-700">
          Le previsioni meteo sono disattivate nelle impostazioni.
        </p>
        <button
          type="button"
          onClick={() => {
            onCloseBriefing();
            navigate('/settings/sync');
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition"
        >
          Configura Meteo
        </button>
      </div>
    );
  }

  const atmosphere = ATMOSPHERE_PRESETS[atmosphereType];
  const isNightScene =
    atmosphere.type === 'clear_night' || atmosphere.type === 'partly_cloudy_night';
  const temp = typeof current?.temperature === 'number' ? `${Math.round(current.temperature)}°` : '--°';
  const desc = isLoading && !current
    ? 'Caricamento meteo...'
    : getWeatherDescription(current?.symbol_code, current?.weather_code);

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* 1. Finestra Paesaggistica Atmosferica Mobile */}
      <div
        onClick={onOpenFullWeather}
        className={`relative h-[132px] w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-gradient-to-r ${atmosphere.bgGradient} cursor-pointer active:scale-[0.99] transition`}
      >
        <style>{WEATHER_KEYFRAMES_CSS}</style>
        <WeatherAtmosphereScene type={atmosphere.type} moonPhase={moonPhase} />

        {/* Overlay Dati Principali */}
        <div className="absolute inset-0 z-20 p-3.5 flex flex-col justify-between pointer-events-none">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-extrabold shadow-2xs ${atmosphere.badgeBg}`}
            >
              <MapPin className="w-3 h-3" />
              <span className="uppercase tracking-wide">{cityName || 'Meteo'}</span>
            </span>

            {isNightScene && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-indigo-700/70 bg-slate-900/90 text-amber-100 text-[10px] font-bold">
                <span>{moonPhase.icon}</span>
                <span>{moonPhase.label}</span>
              </span>
            )}
          </div>

          <div className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs border border-white/80 shadow-xs self-start">
            <span className="text-2xl font-black text-slate-900 leading-none">{temp}</span>
            <span className="text-xs font-bold text-slate-700">{desc}</span>
            {todayForecast && (
              <span className="text-[11px] font-semibold text-slate-500">
                · {Math.round(todayForecast.temp_min)}°/{Math.round(todayForecast.temp_max)}°
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Striscia Rapida Prossime 6 Ore */}
      {upcomingHours.length > 0 && (
        <div className="grid grid-cols-6 gap-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 p-2">
          {upcomingHours.map((h, idx) => (
            <div
              key={h.time}
              className="flex flex-col items-center justify-center py-1 rounded-xl bg-white border border-slate-100 shadow-2xs"
            >
              <span className="text-[9px] font-bold text-slate-500">
                {idx === 0 ? 'Ora' : extractTimeHHMM(h.time)}
              </span>
              <div className="my-0.5">
                <WeatherIcon symbolCode={h.symbol_code} size={18} />
              </div>
              <span className="text-[11px] font-black text-slate-800 tabular-nums">
                {Math.round(h.temperature)}°
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Pulsante Apertura WeatherDetailModal Completo (16gg + 6 Metriche) */}
      <button
        type="button"
        onClick={onOpenFullWeather}
        className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.99]"
      >
        <span>Previsioni complete, ore e 16 giorni</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
