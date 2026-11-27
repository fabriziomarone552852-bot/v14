// src/mobile/components/home/briefing/MobileRotatingBriefingStrip.tsx
import React, { useRef } from 'react';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import { WeatherDetailModal } from '@/components/weather/WeatherDetailModal';
import { getWeatherDescription } from '@/utils/weatherUtils';
import { useMobileRotatingBriefing } from './useMobileRotatingBriefing';

export const MobileRotatingBriefingStrip: React.FC = () => {
  const {
    availableSlides,
    activeSlide,
    isQuoteExpanded,
    selectSlideManually,
    handleTouchStart,
    handleTouchEnd,
    handleStripClick,
    isWeatherDetailOpen,
    closeWeatherDetail,
    quoteData,
    weatherData,
  } = useMobileRotatingBriefing();

  const quoteParagraphRef = useRef<HTMLParagraphElement | null>(null);

  const { quote } = quoteData;
  const {
    forecast,
    current,
    todayForecast,
    upcomingDaily,
    hourly,
    cityName,
    isLoading: isWeatherLoading,
  } = weatherData;

  const symbolCode = current?.symbol_code || todayForecast?.symbol_code || 'cloudy';
  const tempLabel =
    typeof current?.temperature === 'number' ? `${Math.round(current.temperature)}°` : '--°';
  const weatherDesc =
    isWeatherLoading && !current
      ? 'Caricamento meteo...'
      : getWeatherDescription(symbolCode, current?.weather_code);

  const onContainerClick = () => {
    const el = quoteParagraphRef.current;
    const isOverflowing = Boolean(el && el.scrollHeight > el.clientHeight + 1);
    handleStripClick(isOverflowing);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onContainerClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onContainerClick();
          }
        }}
        title={
          activeSlide === 'weather'
            ? 'Tocca per i dettagli meteo completi • Scorri per la citazione'
            : 'Tocca per espandere la citazione • Scorri per il meteo'
        }
        className={`w-full px-2 py-0.5 select-none shrink-0 flex flex-col justify-between cursor-pointer transition-all active:opacity-80 focus:outline-none ${
          isQuoteExpanded ? 'h-auto' : 'min-h-[48px]'
        }`}
      >
        <div
          key={activeSlide}
          className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn"
        >
          {activeSlide === 'quote' && (
            <>
              <p
                ref={quoteParagraphRef}
                className={`text-[12px] text-gray-600 italic font-medium leading-snug transition-all ${
                  isQuoteExpanded ? '' : 'line-clamp-2'
                }`}
              >
                "{quote.text}"
              </p>
              {quote.author && (
                <p className="text-[10px] text-gray-400 font-semibold tracking-wide leading-tight mt-0.5">
                  — {quote.author}
                </p>
              )}
            </>
          )}

          {activeSlide === 'weather' && (
            <>
              <div className="flex items-center justify-center gap-1.5 max-w-full">
                <WeatherIcon symbolCode={symbolCode} size={17} />
                <span className="text-[12.5px] font-extrabold text-slate-800 leading-snug tabular-nums">
                  {tempLabel}
                </span>
                <span className="text-[12px] font-semibold text-gray-600 truncate">
                  · {weatherDesc}
                  {cityName ? ` a ${cityName}` : ''}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wide leading-tight mt-0.5 truncate max-w-full">
                {typeof current?.apparent_temperature === 'number'
                  ? `Percepita ${Math.round(current.apparent_temperature)}°`
                  : 'Meteo locale'}
                {todayForecast
                  ? ` · Min ${Math.round(todayForecast.temp_min)}° / Max ${Math.round(todayForecast.temp_max)}°`
                  : ''}
                {typeof current?.precipitation_probability === 'number' &&
                current.precipitation_probability > 0
                  ? ` · 🌧️ ${current.precipitation_probability}%`
                  : ''}
              </p>
            </>
          )}
        </div>

        {/* Micro-indicatori (solo se Meteo è attivo oltre alla Citazione) */}
        {availableSlides.length > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 pt-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {availableSlides.map((slideId) => {
              const isCurrent = activeSlide === slideId;
              return (
                <button
                  key={slideId}
                  type="button"
                  onClick={() => selectSlideManually(slideId)}
                  aria-label={`Mostra ${slideId === 'quote' ? 'citazione' : 'meteo'}`}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent ? 'w-3.5 bg-blue-500/80' : 'w-1 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modale Dettaglio Meteo a Tutta Pagina su Mobile (identico per ricchezza dati alla Webpage) */}
      <WeatherDetailModal
        isOpen={isWeatherDetailOpen}
        onClose={closeWeatherDetail}
        cityName={cityName}
        isToday={true}
        current={current}
        todayForecast={todayForecast}
        hourly={hourly}
        daily={upcomingDaily}
        updatedAt={forecast?.updated_at}
        isLoading={isWeatherLoading}
      />
    </>
  );
};

export default MobileRotatingBriefingStrip;
