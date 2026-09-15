// src/mobile/hooks/useMobileDayDateNavigation.ts
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { useDay } from '@/context/DayContext';
import { formatDateString, getAgendaDateLabels } from '@/utils/dateUtils';
import { useMobileSwipeTransition } from './useMobileSwipeTransition';

export function useMobileDayDateNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. STATO DATA
  const { dataRiferimento: targetDate, changeDate: setTargetDate } = useDay();
  const { isToday } = getAgendaDateLabels(targetDate);
  const weekdayName = useMemo(
    () => format(targetDate, 'EEEE', { locale: it }).toUpperCase(),
    [targetDate]
  );
  const formattedDateStr = useMemo(
    () => format(targetDate, 'd MMMM yyyy', { locale: it }),
    [targetDate]
  );

  // Intercetta eventuale navigazione con state
  useEffect(() => {
    const state = location.state as { selectedDate?: string } | null;
    if (state?.selectedDate) {
      const [y, m, d] = state.selectedDate.split('-').map(Number);
      setTargetDate(new Date(y, m - 1, d));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, setTargetDate, navigate, location.pathname]);

  const targetDateStr = useMemo(() => formatDateString(targetDate), [targetDate]);

  // 2. STATO VISTA SLIDING & TOUCH SWIPE
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const { swipeDirection, triggerSwipeDown, triggerSwipeUp } = useMobileSwipeTransition();

  const handlePrevDay = useCallback(() => {
    triggerSwipeDown(() => {
      setTargetDate(addDays(targetDate, -1));
    });
  }, [triggerSwipeDown, setTargetDate, targetDate]);

  const handleNextDay = useCallback(() => {
    triggerSwipeUp(() => {
      setTargetDate(addDays(targetDate, 1));
    });
  }, [triggerSwipeUp, setTargetDate, targetDate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // 1. Swipe orizzontale -> cambio pagina / slide
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && activePageIndex === 0) {
        setActivePageIndex(1);
      } else if (deltaX > 0 && activePageIndex === 1) {
        setActivePageIndex(0);
      }
    }
    // 2. Swipe verticale -> cambio giorno (-1 portando giù, +1 portando su)
    else if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      if (deltaY > 0) {
        handlePrevDay();
      } else if (deltaY < 0) {
        handleNextDay();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleResetToday = useCallback(() => {
    setTargetDate(new Date());
  }, [setTargetDate]);

  return {
    targetDate,
    setTargetDate,
    isToday,
    weekdayName,
    formattedDateStr,
    targetDateStr,
    handleResetToday,
    activePageIndex,
    setActivePageIndex,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevDay,
    handleNextDay,
  };
}
