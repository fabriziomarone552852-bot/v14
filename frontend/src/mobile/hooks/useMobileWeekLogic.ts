// src/mobile/hooks/useMobileWeekLogic.ts
import { useState, useMemo, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Logica e Hooks Centralizzati
import { useWeekPageLogic } from '@/hooks/uiWeek/useWeekPageLogic';
import { useMobileSwipeTransition } from './useMobileSwipeTransition';
import type { DbTask, TaskSummary } from '@/types';

export const useMobileWeekLogic = () => {
  const queryClient = useQueryClient();
  const { state, data, moodBoard, handlers, goals } = useWeekPageLogic();

  // 1. FORMATTAZIONE TITOLO & SOTTOTITOLO SETTIMANALE
  const formattedPeriodTitle = useMemo(() => {
    const startStr = format(state.monday, 'd MMM', { locale: it });
    const endStr = format(state.sunday, 'd MMM yyyy', { locale: it });
    return `${startStr} - ${endStr}`;
  }, [state.monday, state.sunday]);

  const subtitleStr = useMemo(() => {
    return state.isCurrentWeek
      ? `QUESTA SETTIMANA • SETT. ${state.weekNumber}`
      : `SETTIMANA ${state.weekNumber}`;
  }, [state.isCurrentWeek, state.weekNumber]);

  // 2. STATO SLIDING & GESTURE TOUCH (0 = Calendario, 1 = Mood Events)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const { swipeDirection, triggerSwipeDown, triggerSwipeUp } = useMobileSwipeTransition();

  const handlePrevWeek = useCallback(() => {
    triggerSwipeDown(() => {
      handlers.handlePrevWeek();
    });
  }, [triggerSwipeDown, handlers]);

  const handleNextWeek = useCallback(() => {
    triggerSwipeUp(() => {
      handlers.handleNextWeek();
    });
  }, [triggerSwipeUp, handlers]);

  // 3. STATO MODALE TASK ESPANSE (quando un giorno ha > 1 task)
  const [expandedTasksDay, setExpandedTasksDay] = useState<{
    dateStr: string;
    tasks: DbTask[];
  } | null>(null);

  const handleToggleTask = async (id: number, currentStatus: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetTask = data.filteredTasks.find((t) => t.id === id);
    if (targetTask) {
      await handlers.handleToggleTaskFromGrid(targetTask, !currentStatus);
      if (expandedTasksDay) {
        setExpandedTasksDay((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((t) =>
                  t.id === id ? { ...t, fatto: !currentStatus } : t
                ),
              }
            : null
        );
      }
    }
  };

  const handleSelectTaskSummary = (task: TaskSummary) => {
    handlers.handleSelectTask(task);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // 1. Swipe orizzontale -> cambio slide (0 = Calendario, 1 = Mood Events)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && activePageIndex === 0) {
        setActivePageIndex(1); // Swipe sinistra -> Pagina 2 (Mood Events)
      } else if (deltaX > 0 && activePageIndex === 1) {
        setActivePageIndex(0); // Swipe destra -> Pagina 1 (Calendario)
      }
    }
    // 2. Swipe verticale -> cambio settimana (-1 portando giù, +1 portando su) con onda blu chiaro
    else if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      if (deltaY > 0) {
        // Dall'alto verso il basso (portando giù) -> -1 (settimana prima)
        handlePrevWeek();
      } else if (deltaY < 0) {
        // Dal basso verso l'alto (portando su) -> +1 (settimana successiva)
        handleNextWeek();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return {
    queryClient,
    state,
    data,
    moodBoard,
    handlers,
    goals,
    formattedPeriodTitle,
    subtitleStr,
    activePageIndex,
    setActivePageIndex,
    expandedTasksDay,
    setExpandedTasksDay,
    handleToggleTask,
    handleSelectTaskSummary,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevWeek,
    handleNextWeek,
  };
};

export default useMobileWeekLogic;
