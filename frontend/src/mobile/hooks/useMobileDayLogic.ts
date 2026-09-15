// src/mobile/hooks/useMobileDayLogic.ts
import React, { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startOfDay, isBefore } from 'date-fns';

// Contesti & Hooks
import { useAgendaDay } from '@/hooks/useAgendaDay';
import { useTaskModals } from '@/context/TaskModalContext';
import { useEventModals } from '@/context/EventModalContext';
import { useRoutineModals } from '@/context/RoutineModalContext';
import { useModal } from '@/hooks/useModals';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useMobileDayDateNavigation } from './useMobileDayDateNavigation';
import { useMobileDayTasks, type ExpandedViewType, type TaskSortMode } from './useMobileDayTasks';
import { useMobileDaySelection } from './useMobileDaySelection';

// Tipi & Utils
import type { CalendarEvent, NoteVariant } from '@/types';
import type { HabitItem } from '@/components/day/HabitsBar';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import type { CountdownSavePayload } from '../components/modals/MobileCountdownNewModal';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { mapDbEventsToCalendarEvents, isEventInDay } from '@/utils/eventUtils';
import { mapHabitsToRoutines, mapHabitsToItems } from '@/utils/habitUtils';
import { mapToCountdownItems } from '@/utils/countdownUtils';
import { filterNotes, getRandomVariant } from '@/utils/noteUtils';

export type { ExpandedViewType, TaskSortMode };

export const useMobileDayLogic = () => {
  const queryClient = useQueryClient();

  // 1. DATA E GESTURE SWIPE
  const dateNav = useMobileDayDateNavigation();
  const { targetDateStr } = dateNav;

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

  // 3. MAPPATURA EVENTI, ROUTINE, COUNTDOWN E NOTE
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

  // 4. TASK & DIMENSIONAMENTO LISTE
  const taskLogic = useMobileDayTasks({
    tasks: dayData?.tasks,
    events: mappedEvents,
    targetDateStr,
  });

  // 5. SELEZIONE MULTIPLA
  const selectionLogic = useMobileDaySelection({
    mappedEvents,
    sortedTasks: taskLogic.sortedTasks,
    mappedRoutines,
    deleteEvent,
    deleteTask,
    deleteHabit,
  });

  const handleSetExpandedView = useCallback(
    (view: ExpandedViewType) => {
      selectionLogic.clearSelection();
      taskLogic.setExpandedView(view);
    },
    [selectionLogic, taskLogic]
  );

  // 6. MODALI
  const { openTaskDetail } = useTaskModals();
  const { openEventDetail } = useEventModals();
  const { openRoutineDetail } = useRoutineModals();

  const habitFormModal = useModal();
  const countdownHubModal = useModal();
  const countdownDetailModal = useModal<CountdownItem>();
  const countdownFormModal = useModal<CountdownItem>();

  // Note Sheet
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // 7. HANDLERS ELEMENTI
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
    targetDate: dateNav.targetDate,
    setTargetDate: dateNav.setTargetDate,
    isToday: dateNav.isToday,
    weekdayName: dateNav.weekdayName,
    formattedDateStr: dateNav.formattedDateStr,
    targetDateStr,
    handleResetToday: dateNav.handleResetToday,

    // Stato Query
    dayData,
    isLoading,
    isError,
    handleRetry,

    // Paginazione e Gesture
    activePageIndex: dateNav.activePageIndex,
    setActivePageIndex: dateNav.setActivePageIndex,
    handleTouchStart: dateNav.handleTouchStart,
    handleTouchEnd: dateNav.handleTouchEnd,
    swipeDirection: dateNav.swipeDirection,
    handlePrevDay: dateNav.handlePrevDay,
    handleNextDay: dateNav.handleNextDay,

    // Filtri e Viste
    sortMode: taskLogic.sortMode,
    setSortMode: taskLogic.setSortMode,
    showWithDeadline: taskLogic.showWithDeadline,
    setShowWithDeadline: taskLogic.setShowWithDeadline,
    showNotificationDot: taskLogic.showNotificationDot,
    expandedView: taskLogic.expandedView,
    handleSetExpandedView,

    // Dati Mappati
    sortedTasks: taskLogic.sortedTasks,
    mappedEvents,
    mappedCountdowns,
    widgetCountdowns,
    mappedRoutines,
    mappedHabits,
    mappedNotes,

    // Dimensionamento
    eventsListRef: taskLogic.eventsListRef,
    tasksListRef: taskLogic.tasksListRef,
    visibleCompactEvents: taskLogic.visibleCompactEvents,
    hasMoreEvents: taskLogic.hasMoreEvents,
    visibleCompactTasks: taskLogic.visibleCompactTasks,
    hasMoreTasks: taskLogic.hasMoreTasks,

    // Selezione
    selectionState: selectionLogic.selectionState,
    isEventsSelection: selectionLogic.isEventsSelection,
    isTasksSelection: selectionLogic.isTasksSelection,
    isRoutinesSelection: selectionLogic.isRoutinesSelection,
    handleToggleSelectEvent: selectionLogic.handleToggleSelectEvent,
    handleToggleSelectTask: selectionLogic.handleToggleSelectTask,
    handleToggleSelectRoutine: selectionLogic.handleToggleSelectRoutine,

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
