// src/mobile/components/home/briefing/useMobileRotatingBriefing.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type React from 'react';
import { useDailyQuote } from '@/hooks/useDailyQuote';
import { useWeather } from '@/hooks/useWeather';

export type ActiveStripSlideId = 'quote' | 'weather';

// 8 secondi: sweet spot UX (abbastanza calmo per leggere 2 righe di citazione senza fretta,
// ma abbastanza dinamico da mostrare anche il meteo in pochi istanti)
const ROTATION_INTERVAL_MS = 8000;
const MIN_SWIPE_DELTA_PX = 35;

export const useMobileRotatingBriefing = () => {
  const quoteData = useDailyQuote();
  const weatherData = useWeather();

  const availableSlides = useMemo<ActiveStripSlideId[]>(() => {
    const list: ActiveStripSlideId[] = ['quote'];
    if (weatherData.isWeatherEnabled) {
      list.push('weather');
    }
    return list;
  }, [weatherData.isWeatherEnabled]);

  const [rawActiveSlide, setRawActiveSlide] = useState<ActiveStripSlideId>('quote');
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [isWeatherDetailOpen, setIsWeatherDetailOpen] = useState(false);
  const [resetTick, setResetTick] = useState(0);

  const activeSlide: ActiveStripSlideId = availableSlides.includes(rawActiveSlide)
    ? rawActiveSlide
    : availableSlides[0];

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);

  const stepSlide = useCallback(
    (delta: 1 | -1) => {
      if (availableSlides.length <= 1) return;
      setIsQuoteExpanded(false);
      setRawActiveSlide((prev) => {
        const currentIdx = availableSlides.indexOf(prev);
        const safeIdx = currentIdx === -1 ? 0 : currentIdx;
        const nextIdx = (safeIdx + delta + availableSlides.length) % availableSlides.length;
        return availableSlides[nextIdx];
      });
    },
    [availableSlides]
  );

  // Rotazione automatica ogni 8s (in pausa se la citazione è allargata, il modale meteo è aperto o l'app è in background)
  useEffect(() => {
    if (availableSlides.length <= 1 || isQuoteExpanded || isWeatherDetailOpen) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      stepSlide(1);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [availableSlides, isQuoteExpanded, isWeatherDetailOpen, stepSlide, resetTick]);

  const selectSlideManually = useCallback((slide: ActiveStripSlideId) => {
    setIsQuoteExpanded(false);
    setRawActiveSlide(slide);
    setResetTick((t) => t + 1);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    swipedRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      if (Math.abs(dx) >= MIN_SWIPE_DELTA_PX && Math.abs(dx) > Math.abs(dy)) {
        swipedRef.current = true;
        stepSlide(dx < 0 ? 1 : -1);
        setResetTick((tick) => tick + 1);
      }
    },
    [stepSlide]
  );

  const handleStripClick = useCallback(
    (canExpandQuote: boolean) => {
      if (swipedRef.current) {
        swipedRef.current = false;
        return;
      }

      if (activeSlide === 'weather') {
        setIsWeatherDetailOpen(true);
        return;
      }

      // Slide citazione: ripristinato il comportamento classico (espande/richiude inline se lunga)
      if (isQuoteExpanded) {
        setIsQuoteExpanded(false);
        setResetTick((tick) => tick + 1);
      } else if (canExpandQuote) {
        setIsQuoteExpanded(true);
      }
    },
    [activeSlide, isQuoteExpanded]
  );

  return {
    availableSlides,
    activeSlide,
    isQuoteExpanded,
    selectSlideManually,
    handleTouchStart,
    handleTouchEnd,
    handleStripClick,
    isWeatherDetailOpen,
    closeWeatherDetail: () => setIsWeatherDetailOpen(false),
    quoteData,
    weatherData,
  };
};
