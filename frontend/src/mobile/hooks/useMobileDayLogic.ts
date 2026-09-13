// src/mobile/hooks/useMobileDayLogic.ts
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { startOfDay, isBefore, format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

// Contesti & Hooks
import { useDay } from '@/context/DayContext';
import { useAgendaDay } from '@/hooks/useAgendaDay';
import { useTaskModals } from '@/context/TaskModalContext';
import { useEventModals } from '@/context/EventModalContext';
import { useRoutineModals } from '@/context/RoutineModalContext';
import { useModal } from '@/hooks/useModals';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useMobileSelection } from '../context/MobileSelectionContext';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useMobileSwipeTransition } from './useMobileSwipeTransition';

// Tipi & Utils
import type { CalendarEvent, NoteVariant } from '@/types';
import type { HabitItem } from '@/components/day/HabitsBar';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import type { CountdownSavePayload } from '../components/modals/MobileCountdownNewModal';
import { formatDateString, getAgendaDateLabels, getLocalTodayStr } from '@/utils/dateUtils';
import { buildTaskTreeForDay, filterAndSortTree, filterTreeByDeadlineMode } from '@/utils/taskUtils';
import { mapDbEventsToCalendarEvents, isEventInDay } from '@/utils/eventUtils';
import { mapHabitsToRoutines, mapHabitsToItems } from '@/utils/habitUtils';
import { mapToCountdownItems } from '@/utils/countdownUtils';
import { filterNotes, getRandomVariant } from '@/utils/noteUtils';

export type ExpandedViewType = 'none' | 'events' | 'tasks' | 'routines';
export type TaskSortMode = 'chrono' | 'priority';

export const useMobileDayLogic = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. STATO DATA
  const { dataRiferimento: targetDate, changeDate: setTargetDate } = useDay();
  const { isToday } = getAgendaDateLabels(targetDate);
  const weekdayName = useMemo(() => format(targetDate, 'EEEE', { locale: it }).toUpperCase(), [targetDate]);
  const formattedDateStr = useMemo(() => format(targetDate, 'd MMMM yyyy', { locale: it }), [targetDate]);

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

  // 2. FETCH DATI GIORNO (Tutto il mazzo di carte in RAM)
  const {
    dayData,
    isLoading,
    isError,
    toggleTask,
    deleteEvent,
    deleteHabit,
    saveNote,
    deleteNote,
    updateHabitLog,
    saveCountdown,
    deleteCountdown,
    saveHabit,
    updateHabitCount,
    saveObiettivo,
    savePriorita,
  } = useAgendaDay(targetDateStr);

  const { deleteTask } = useTaskMutations(['tasks']);

  // 3. STATO VISTA SLIDING & TOUCH SWIPE
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
    // 2. Swipe verticale -> cambio giorno (-1 portando giù, +1 portando su) con onda blu chiaro
    else if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      if (deltaY > 0) {
        // Dall'alto verso il basso (portando giù) -> -1 (ieri)
        handlePrevDay();
      } else if (deltaY < 0) {
        // Dal basso verso l'alto (portando su) -> +1 (domani)
        handleNextDay();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // 4. STATO FILTRI & VISTA ESPANSA
  const [sortMode, setSortMode] = useState<TaskSortMode>('chrono');
  const [showWithDeadline, setShowWithDeadline] = useState<boolean>(true);
  const [expandedView, setExpandedView] = useState<ExpandedViewType>('none');

  // Gestione Selezione Multipla Globale (MobileHeader)
  const {
    state: selectionState,
    isSelectionActive,
    startSelection,
    toggleItem,
    clearSelection,
    updateAllIds,
  } = useMobileSelection();

  const isEventsSelection = isSelectionActive && selectionState.activeSection === 'day-events';
  const isTasksSelection = isSelectionActive && selectionState.activeSection === 'day-tasks';
  const isRoutinesSelection = isSelectionActive && selectionState.activeSection === 'day-routines';

  const handleSetExpandedView = useCallback(
    (view: ExpandedViewType) => {
      clearSelection();
      setExpandedView(view);
    },
    [clearSelection]
  );

  // Modali Eventi, Task & Routine
  const { openTaskDetail } = useTaskModals();
  const { openEventDetail } = useEventModals();
  const { openRoutineDetail } = useRoutineModals();

  // Modali Countdowns & Abitudini
  const habitFormModal = useModal();
  const countdownHubModal = useModal();
  const countdownDetailModal = useModal<CountdownItem>();
  const countdownFormModal = useModal<CountdownItem>();

  // Note Sheet
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // 5. MAPPATURA DEI DATI IN RAM (Mazzo di carte)
  const rawTree = useMemo(() => {
    return buildTaskTreeForDay(dayData?.tasks, targetDateStr);
  }, [dayData?.tasks, targetDateStr]);

  const showNotificationDot = useMemo(() => {
    return showWithDeadline
      ? rawTree.some((t) => !t.deadline && !t.done)
      : rawTree.some((t) => !!t.deadline && !t.done);
  }, [rawTree, showWithDeadline]);

  const sortedTasks = useMemo(() => {
    const deadlineFiltered = filterTreeByDeadlineMode(rawTree, showWithDeadline);
    return filterAndSortTree(deadlineFiltered, false, sortMode, targetDateStr);
  }, [rawTree, showWithDeadline, sortMode, targetDateStr]);

  const mappedEvents: CalendarEvent[] = useMemo(() => {
    const all = mapDbEventsToCalendarEvents(dayData?.events, targetDateStr);
    return all.filter((ev) => isEventInDay(ev, targetDateStr));
  }, [dayData?.events, targetDateStr]);

  const mappedCountdowns: CountdownItem[] = useMemo(() => {
    return mapToCountdownItems(dayData?.countdowns);
  }, [dayData?.countdowns]);

  const todayDateObj = startOfDay(new Date());
  const widgetCountdowns = useMemo(() => {
    return mappedCountdowns.filter((cd) => {
      const tDate = startOfDay(new Date(cd.targetDateStr));
      return !isBefore(tDate, todayDateObj);
    });
  }, [mappedCountdowns, todayDateObj]);

  const mappedRoutines: RoutineItem[] = useMemo(() => {
    return mapHabitsToRoutines(dayData?.habits ?? [], targetDateStr);
  }, [dayData?.habits, targetDateStr]);

  const mappedHabits: HabitItem[] = useMemo(() => {
    return mapHabitsToItems(dayData?.habits ?? [], targetDateStr);
  }, [dayData?.habits, targetDateStr]);

  const mappedNotes = useMemo(() => {
    return filterNotes(dayData?.note);
  }, [dayData?.note]);

  // Misura dinamica dello spazio per Eventi e Task compatte
  const eventsListRef = useRef<HTMLDivElement>(null);
  const tasksListRef = useRef<HTMLDivElement>(null);

  const { clientHeight: eventsContainerHeight } = useResizeObserver(eventsListRef, 50);
  const { clientHeight: tasksContainerHeight } = useResizeObserver(tasksListRef, 50);

  const EVENT_SLOT_HEIGHT = 50;
  const TASK_SLOT_HEIGHT = 70;
  const INDICATOR_HEIGHT = 32;

  const maxEventsFit = useMemo(() => {
    if (eventsContainerHeight <= 0) return 2;
    if (mappedEvents.length * EVENT_SLOT_HEIGHT <= eventsContainerHeight) {
      return mappedEvents.length;
    }
    const availableForItems = eventsContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(availableForItems / EVENT_SLOT_HEIGHT));
  }, [eventsContainerHeight, mappedEvents.length]);

  const visibleCompactEvents = useMemo(() => {
    return mappedEvents.slice(0, maxEventsFit);
  }, [mappedEvents, maxEventsFit]);

  const hasMoreEvents = mappedEvents.length > maxEventsFit;

  const maxTasksFit = useMemo(() => {
    if (tasksContainerHeight <= 0) return 2;
    if (sortedTasks.length * TASK_SLOT_HEIGHT <= tasksContainerHeight) {
      return sortedTasks.length;
    }
    const availableForItems = tasksContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(availableForItems / TASK_SLOT_HEIGHT));
  }, [tasksContainerHeight, sortedTasks.length]);

  const visibleCompactTasks = useMemo(() => {
    return sortedTasks.slice(0, maxTasksFit);
  }, [sortedTasks, maxTasksFit]);

  const hasMoreTasks = sortedTasks.length > maxTasksFit;

  // 6. HANDLERS
  const handleResetToday = useCallback(() => {
    setTargetDate(new Date());
  }, [setTargetDate]);

  const allEventIds = useMemo(() => mappedEvents.map((ev) => Number(ev.id)), [mappedEvents]);
  const allTaskIds = useMemo(() => sortedTasks.map((t) => t.id), [sortedTasks]);
  const allRoutineIds = useMemo(() => mappedRoutines.map((r) => r.id), [mappedRoutines]);

  useEffect(() => {
    if (isEventsSelection) updateAllIds(allEventIds);
    else if (isTasksSelection) updateAllIds(allTaskIds);
    else if (isRoutinesSelection) updateAllIds(allRoutineIds);
  }, [allEventIds, allTaskIds, allRoutineIds, isEventsSelection, isTasksSelection, isRoutinesSelection, updateAllIds]);

  const handleDeleteSelectedEvents = useCallback(async (ids?: (number | string)[]) => {
    const targetIds = ids && ids.length > 0 ? ids.map(Number) : (selectionState.selectedIds as number[]);
    if (targetIds.length === 0) return;
    if (!window.confirm(`Vuoi eliminare i ${targetIds.length} eventi selezionati?`)) return;
    for (const id of targetIds) {
      await deleteEvent(id);
    }
    clearSelection();
  }, [deleteEvent, selectionState.selectedIds, clearSelection]);

  const handleToggleSelectEvent = useCallback((id: number) => {
    if (isEventsSelection) {
      toggleItem(id);
    } else {
      startSelection('day-events', id, allEventIds, handleDeleteSelectedEvents);
    }
  }, [isEventsSelection, toggleItem, startSelection, allEventIds, handleDeleteSelectedEvents]);

  const handleDeleteSelectedTasks = useCallback((ids?: (number | string)[]) => {
    const targetIds = ids && ids.length > 0 ? ids.map(Number) : (selectionState.selectedIds as number[]);
    if (targetIds.length === 0) return;
    if (!window.confirm(`Vuoi eliminare le ${targetIds.length} task selezionate?`)) return;
    for (const id of targetIds) {
      deleteTask(id);
    }
    clearSelection();
  }, [deleteTask, selectionState.selectedIds, clearSelection]);

  const handleToggleSelectTask = useCallback((id: number) => {
    if (isTasksSelection) {
      toggleItem(id);
    } else {
      startSelection('day-tasks', id, allTaskIds, handleDeleteSelectedTasks);
    }
  }, [isTasksSelection, toggleItem, startSelection, allTaskIds, handleDeleteSelectedTasks]);

  const handleDeleteSelectedRoutines = useCallback(async (ids?: (number | string)[]) => {
    const targetIds = ids && ids.length > 0 ? ids.map(Number) : (selectionState.selectedIds as number[]);
    if (targetIds.length === 0) return;
    if (!window.confirm(`Vuoi eliminare le ${targetIds.length} routine selezionate?`)) return;
    for (const id of targetIds) {
      await deleteHabit(id);
    }
    clearSelection();
  }, [deleteHabit, selectionState.selectedIds, clearSelection]);

  const handleToggleSelectRoutine = useCallback((id: number) => {
    if (isRoutinesSelection) {
      toggleItem(id);
    } else {
      startSelection('day-routines', id, allRoutineIds, handleDeleteSelectedRoutines);
    }
  }, [isRoutinesSelection, toggleItem, startSelection, allRoutineIds, handleDeleteSelectedRoutines]);

  const handleToggleTask = useCallback(
    (id: number, currentStatus: boolean, e?: React.MouseEvent) => {
      e?.stopPropagation();
      toggleTask({ id, isDone: !currentStatus });
    },
    [toggleTask]
  );

  const handleAddNote = useCallback(() => {
    const tempId = Date.now();
    saveNote({
      id: tempId,
      data_riferimento: targetDateStr,
      testo: '',
      tipo: getRandomVariant(),
      isNew: true,
    });
    setEditingNoteId(tempId);
  }, [saveNote, targetDateStr]);

  const handleAutoSaveNote = useCallback(
    (id: number, testo: string, tipo: NoteVariant, isNew?: boolean) => {
      saveNote({ id, testo, data_riferimento: targetDateStr, tipo, isNew });
    },
    [saveNote, targetDateStr]
  );

  const handleDeleteNote = useCallback(
    (id: number) => {
      deleteNote(id);
    },
    [deleteNote]
  );

  const handleSaveCountdown = useCallback(
    (newCd: CountdownSavePayload) => {
      saveCountdown(newCd);
    },
    [saveCountdown]
  );

  const handleSaveHabit = useCallback(
    (titolo: string, immagine_url?: string) => {
      saveHabit({
        data: {
          titolo,
          tipo: 'H',
          immagine_url,
          rrule: 'FREQ=DAILY;INTERVAL=1',
          data_inizio: getLocalTodayStr(),
          target_completamenti: 1,
        },
      });
    },
    [saveHabit]
  );

  const handleToggleHabitLog = useCallback(
    (id: number) => {
      const targetHabit = mappedHabits.find((h) => h.id === id);
      if (targetHabit) {
        const delta = targetHabit.done ? -1 : 1;
        updateHabitLog({ habitId: id, delta });
      }
    },
    [mappedHabits, updateHabitLog]
  );

  const handleUpdateRoutineCount = useCallback(
    (id: number, delta: number) => {
      updateHabitCount({ habitId: id, delta });
    },
    [updateHabitCount]
  );

  const handleRetry = useCallback(() => {
    queryClient.refetchQueries({ queryKey: ['daySync', targetDateStr] });
  }, [queryClient, targetDateStr]);

  return {
    // Stato Data
    targetDate,
    setTargetDate,
    isToday,
    weekdayName,
    formattedDateStr,
    targetDateStr,
    handleResetToday,

    // Stato Query
    dayData,
    isLoading,
    isError,
    handleRetry,

    // Paginazione e Gesture
    activePageIndex,
    setActivePageIndex,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevDay,
    handleNextDay,

    // Filtri e Viste
    sortMode,
    setSortMode,
    showWithDeadline,
    setShowWithDeadline,
    showNotificationDot,
    expandedView,
    handleSetExpandedView,

    // Dati Mappati
    sortedTasks,
    mappedEvents,
    mappedCountdowns,
    widgetCountdowns,
    mappedRoutines,
    mappedHabits,
    mappedNotes,

    // Dimensionamento
    eventsListRef,
    tasksListRef,
    visibleCompactEvents,
    hasMoreEvents,
    visibleCompactTasks,
    hasMoreTasks,

    // Selezione
    selectionState,
    isEventsSelection,
    isTasksSelection,
    isRoutinesSelection,
    handleToggleSelectEvent,
    handleToggleSelectTask,
    handleToggleSelectRoutine,

    // Azioni Elementi
    handleToggleTask,
    openTaskDetail,
    openEventDetail,
    openRoutineDetail,
    handleToggleHabitLog,
    handleUpdateRoutineCount,
    saveObiettivo,
    savePriorita,

    // Modali
    habitFormModal,
    countdownHubModal,
    countdownDetailModal,
    countdownFormModal,
    handleSaveCountdown,
    deleteCountdown,
    handleSaveHabit,

    // Note Sheet
    isNotesOpen,
    setIsNotesOpen,
    editingNoteId,
    setEditingNoteId,
    handleAddNote,
    handleAutoSaveNote,
    handleDeleteNote,
  };
};
