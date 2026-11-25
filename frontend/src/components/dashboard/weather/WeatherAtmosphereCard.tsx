// frontend/src/components/dashboard/weather/WeatherAtmosphereCard.tsx
import React, { useMemo, useState } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { getWeatherDescription } from '@/utils/weatherUtils';
import { getMoonPhaseInfo } from '@/utils/moonPhaseUtils';
import { WeatherDetailModal } from '@/components/weather/WeatherDetailModal';
import fairytaleHill from '@/assets/fairytale-hill.svg';
import {
  ATMOSPHERE_PRESETS,
  resolveAtmosphereType,
} from './weatherAtmosphereTypes';
import { WEATHER_KEYFRAMES_CSS } from './WeatherScenePrimitives';
import { WeatherAtmosphereScene } from './WeatherAtmosphereScenes';

export const WeatherAtmosphereCard: React.FC = () => {
  const {
    forecast,
    current,
    todayForecast,
    upcomingDaily,
    hourly,
    cityName,
    isWeatherEnabled,
    isLoading,
  } = useWeather();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const symbolCode = current?.symbol_code;
  const temp = typeof current?.temperature === 'number' ? Math.round(current.temperature) : null;
  const weatherDesc = isLoading && !current
    ? 'Caricamento...'
    : getWeatherDescription(symbolCode, current?.weather_code);

  const atmosphereType = useMemo(
    () => resolveAtmosphereType(symbolCode, current?.weather_code, current?.is_day),
    [symbolCode, current?.weather_code, current?.is_day]
  );

  const moonPhase = useMemo(() => getMoonPhaseInfo(new Date()), []);

  // Se il meteo è disattivato dall'utente nelle Impostazioni, mostra l'Oasi Naturale originale
  if (!isWeatherEnabled) {
    return (
      <div className="xl:col-span-7 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-white rounded-xl shadow-sm border border-gray-200 h-full relative overflow-hidden flex items-end justify-end group select-none">
        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-emerald-50/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-3.5 left-4 z-20 pointer-events-none opacity-85">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/95 px-3 py-1 rounded-lg shadow-2xs">
            🌸 Oasi di Ispirazione & Focus
          </span>
        </div>
        <img
          src={fairytaleHill}
          alt="Collina fatata fiorita"
          className="h-full w-full object-cover object-right-bottom drop-shadow-xs transition-transform duration-700 ease-out group-hover:scale-[1.02] select-none pointer-events-none"
        />
      </div>
    );
  }

  const atmosphere = ATMOSPHERE_PRESETS[atmosphereType];
  const isNightScene =
    atmosphere.type === 'clear_night' || atmosphere.type === 'partly_cloudy_night';

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        title={`Meteo a ${cityName || 'posizione selezionata'}: ${weatherDesc} — clicca per i dettagli`}
        className={`xl:col-span-7 bg-gradient-to-r ${atmosphere.bgGradient} rounded-xl shadow-sm hover:shadow-md border border-gray-200/80 hover:border-blue-300/80 h-full relative overflow-hidden flex items-center justify-center select-none group cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
      >
        <style>{WEATHER_KEYFRAMES_CSS}</style>

        {/* Badge Sovraimposto: Località, Temperatura, Stato + Fase Lunare nelle viste notturne */}
        <div className="absolute top-3 left-4 right-24 z-20 flex items-center gap-2 flex-wrap pointer-events-none">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg shadow-xs border text-[11px] font-bold transition-transform duration-200 group-hover:scale-[1.02] ${atmosphere.badgeBg}`}
          >
            <span className="text-sm leading-none">{atmosphere.icon}</span>
            <span className="font-extrabold tracking-wide uppercase">
              {cityName || 'Meteo'}
            </span>
            {temp !== null && (
              <span className="font-black px-1.5 py-0.5 rounded bg-black/10 leading-none">
                {temp}°C
              </span>
            )}
            <span className="font-medium opacity-90 hidden sm:inline">
              • {weatherDesc}
            </span>
          </div>

          {isNightScene && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-700/70 bg-slate-900/90 text-amber-100 text-[11px] font-bold shadow-xs">
              <span className="text-xs leading-none">{moonPhase.icon}</span>
              <span>{moonPhase.label}</span>
              <span className="px-1 py-0.2 rounded bg-white/10 text-[10px] font-extrabold tabular-nums">
                {moonPhase.illuminationPct}%
              </span>
            </div>
          )}
        </div>

        {/* Scena Paesaggistica 100% Opaca */}
        <WeatherAtmosphereScene type={atmosphere.type} moonPhase={moonPhase} />
      </div>

      <WeatherDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cityName={cityName}
        isToday={true}
        current={current}
        todayForecast={todayForecast}
        hourly={hourly}
        daily={upcomingDaily}
        updatedAt={forecast?.updated_at}
        isLoading={isLoading}
      />
    </>
  );
};
