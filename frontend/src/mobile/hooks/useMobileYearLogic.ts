// src/mobile/hooks/useMobileYearLogic.ts
import { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Contesti & Hooks Centralizzati
import { useDay } from '@/context/DayContext';
import { useYearPageLogic } from '@/hooks/uiYear/useYearPageLogic';
import { useMobileSwipeTransition } from './useMobileSwipeTransition';
import type { PriorityLikeEntry } from '../components/MobileGoalsAndPrioritiesChips';

export const useMobileYearLogic = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { changeDate } = useDay();
  const { state, handlers, nav, apiData, highlights, bingo, review } = useYearPageLogic();

  // 1. STATO SLIDING & GESTURE TOUCH (0 = Calendario 12 Mesi, 1 = Bingo & Propositi)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const { swipeDirection, triggerSwipeDown, triggerSwipeUp } = useMobileSwipeTransition();

  const handlePrevYear = useCallback(() => {
    triggerSwipeDown(() => {
      handlers.handlePrevYear();
    });
  }, [triggerSwipeDown, handlers]);

  const handleNextYear = useCallback(() => {
    triggerSwipeUp(() => {
      handlers.handleNextYear();
    });
  }, [triggerSwipeUp, handlers]);

  // 2. STATO MODALE BINGO
  const [isBingoModalOpen, setIsBingoModalOpen] = useState(false);

  // 3. MAPPATURA PRIORITÀ PER LE CHIPS
  const mappedPriorities: (PriorityLikeEntry | null)[] = useMemo(() => {
    return apiData.entries.priorita.map((p) =>
      p ? { id: p.id, testo: p.yearly_field ?? null } : null
    );
  }, [apiData.entries.priorita]);

  // Handlers Navigazione Calendario
  const handleMonthClick = (yr: number, monthIndex: number) => {
    const d = new Date(yr, monthIndex, 1);
    changeDate(d);
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    navigate(`/mese?date=${yr}-${monthStr}-01`);
  };

  const handleSavePriority = (id: number | undefined, text: string, index?: number) => {
    const idx =
      typeof index === 'number'
        ? index
        : apiData.entries.priorita.findIndex((p) => p?.id === id);
    if (idx >= 0) {
      apiData.entries.handleSavePriority(idx, id, text);
    }
  };

  // Touch Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // 1. Swipe orizzontale -> cambio slide (0 = Calendario 12 Mesi, 1 = Bingo & Propositi)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && activePageIndex === 0) {
        setActivePageIndex(1); // Swipe sinistra -> Pagina 2 (Bingo & Propositi)
      } else if (deltaX > 0 && activePageIndex === 1) {
        setActivePageIndex(0); // Swipe destra -> Pagina 1 (Calendario Annuale)
      }
    }
    // 2. Swipe verticale -> cambio anno (-1 portando giù, +1 portando su) con onda blu chiaro
    else if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      if (deltaY > 0) {
        // Dall'alto verso il basso (portando giù) -> -1 (anno prima)
        handlePrevYear();
      } else if (deltaY < 0) {
        // Dal basso verso l'alto (portando su) -> +1 (anno successivo)
        handleNextYear();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return {
    queryClient,
    state,
    handlers,
    nav,
    apiData,
    highlights,
    bingo,
    review,
    activePageIndex,
    setActivePageIndex,
    isBingoModalOpen,
    setIsBingoModalOpen,
    mappedPriorities,
    handleMonthClick,
    handleSavePriority,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevYear,
    handleNextYear,
  };
};

export default useMobileYearLogic;
