// src/mobile/hooks/useMobileMonthLogic.ts
import { useState, useMemo, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Logica e Hooks Centralizzati
import { useMonthPageLogic } from '@/hooks/uiMonth/useMonthPageLogic';
import { useDay } from '@/context/DayContext';
import { useCategories } from '@/hooks/useCategories';
import { useEventModals } from '@/context/EventModalContext';
import { useTaskModals } from '@/context/TaskModalContext';
import { useMobileSwipeTransition } from './useMobileSwipeTransition';
import { mapDbEventsToCalendarEvents } from '@/utils/eventUtils';
import { mapDbTaskToUITask } from '@/utils/taskUtils';
import type { DbTask, TaskSummary } from '@/types';

export const useMobileMonthLogic = () => {
  const queryClient = useQueryClient();
  const { changeDate: setTargetDate } = useDay();
  const { openEventDetail } = useEventModals();
  const { openTaskDetail } = useTaskModals();
  const { data: dbCategories = [] } = useCategories();

  const { state, apiData, handlers, review } = useMonthPageLogic();

  // 1. TITOLO MENSILE
  const monthTitle = useMemo(() => {
    return format(state.monthTargetDate, 'MMMM yyyy', { locale: it }).toUpperCase();
  }, [state.monthTargetDate]);

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      now.getMonth() === state.monthTargetDate.getMonth() &&
      now.getFullYear() === state.monthTargetDate.getFullYear()
    );
  }, [state.monthTargetDate]);

  // 2. MAPPATURA EVENTI MENSILI
  const mappedEvents = useMemo(() => {
    return mapDbEventsToCalendarEvents(apiData?.events || [], state.startStr);
  }, [apiData?.events, state.startStr]);

  // 3. STATO SLIDING & GESTURE TOUCH (0 = Grafici, 1 = Calendario, 2 = Eventi Emotivi)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1 | 2>(1);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const { swipeDirection, triggerSwipeDown, triggerSwipeUp } = useMobileSwipeTransition();

  const handlePrevMonth = useCallback(() => {
    triggerSwipeDown(() => {
      handlers.handlePrevMonth();
    });
  }, [triggerSwipeDown, handlers]);

  const handleNextMonth = useCallback(() => {
    triggerSwipeUp(() => {
      handlers.handleNextMonth();
    });
  }, [triggerSwipeUp, handlers]);

  // 4. STATO MODALE TASK ESPANSE (quando si clicca sul badge task di un giorno)
  const [expandedTasksDay, setExpandedTasksDay] = useState<{
    dateStr: string;
    tasks: DbTask[];
  } | null>(null);

  const handleToggleTask = async (id: number, currentStatus: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const allTasks = apiData?.tasks || [];
    const targetTask = allTasks.find((t) => t.id === id);
    if (targetTask) {
      await handlers.handleToggleTaskGrid(targetTask, !currentStatus);
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

  const handleToggleTaskFromCalendar = async (task: DbTask, newStatus: boolean) => {
    await handlers.handleToggleTaskGrid(task, newStatus);
    if (expandedTasksDay) {
      setExpandedTasksDay((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === task.id ? { ...t, fatto: newStatus } : t
              ),
            }
          : null
      );
    }
  };

  const handleSelectDbTask = (task: DbTask) => {
    openTaskDetail(mapDbTaskToUITask(task));
  };

  const handleSelectTaskSummary = (task: TaskSummary) => {
    openTaskDetail(task);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // 1. Swipe orizzontale -> cambio slide (0 = Grafici, 1 = Calendario, 2 = Eventi Emotivi)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swipe verso sinistra -> vai avanti
        if (activePageIndex === 0) setActivePageIndex(1);
        else if (activePageIndex === 1) setActivePageIndex(2);
      } else if (deltaX > 0) {
        // Swipe verso destra -> vai indietro
        if (activePageIndex === 2) setActivePageIndex(1);
        else if (activePageIndex === 1) setActivePageIndex(0);
      }
    }
    // 2. Swipe verticale -> cambio mese (-1 portando giù, +1 portando su) con onda blu chiaro
    else if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      if (deltaY > 0) {
        // Dall'alto verso il basso (portando giù) -> -1 (mese prima)
        handlePrevMonth();
      } else if (deltaY < 0) {
        // Dal basso verso l'alto (portando su) -> +1 (mese successivo)
        handleNextMonth();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return {
    queryClient,
    setTargetDate,
    openEventDetail,
    dbCategories,
    state,
    apiData,
    handlers,
    review,
    monthTitle,
    isCurrentMonth,
    mappedEvents,
    activePageIndex,
    setActivePageIndex,
    expandedTasksDay,
    setExpandedTasksDay,
    handleToggleTask,
    handleToggleTaskFromCalendar,
    handleSelectDbTask,
    handleSelectTaskSummary,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevMonth,
    handleNextMonth,
  };
};

export default useMobileMonthLogic;
