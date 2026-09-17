import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useResizeObserver } from '@/hooks/useResizeObserver';

// Hooks & Contesti
import { useAgendaHome } from '@/hooks/useAgendaHome';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useEventMutations } from '@/hooks/mutations/useEventMutations';
import { useTaskModals } from '@/context/TaskModalContext';
import { useEventModals } from '@/context/EventModalContext';
import { useMobileSelection } from '../context/MobileSelectionContext';

// Utility & Tipi
import { buildTaskTreeForHome, filterAndSortTree, filterTreeByDeadlineMode } from '@/utils/taskUtils';
import { calculateYearProgress, getAgendaDateLabels, getLocalTodayStr } from '@/utils/dateUtils';
import { mapDbEventsToCalendarEvents } from '@/utils/eventUtils';
import { logger } from '@/utils/logger';
import { extractErrorMessage } from '@/utils/errorUtils';
import type { CalendarEvent, UITask } from '@/types';

export type ExpandedHomeViewMode = 'none' | 'events' | 'tasks';

export function useMobileHomeLogic() {
  const queryClient = useQueryClient();
  const [currentMonth] = useState<Date>(() => new Date());
  const todayStr = useMemo(() => getLocalTodayStr(), []);
  const { formattedDate } = useMemo(() => getAgendaDateLabels(new Date()), []);

  // Stato Filtro e Ordinamento Task
  const [sortMode, setSortMode] = useState<'chrono' | 'priority'>('chrono');
  const [showWithDeadline, setShowWithDeadline] = useState<boolean>(true);

  // Stato Finestra a Tutto Schermo per Eventi o Task
  const [expandedView, setExpandedView] = useState<ExpandedHomeViewMode>('none');

  // Gestione Selezione Multipla Globale (MobileHeader)
  const {
    state: selectionState,
    isSelectionActive,
    startSelection,
    toggleItem,
    clearSelection,
    updateAllIds,
  } = useMobileSelection();

  const isEventsSelection = isSelectionActive && selectionState.activeSection === 'home-events';
  const isTasksSelection = isSelectionActive && selectionState.activeSection === 'home-tasks';

  const handleSetExpandedView = (view: ExpandedHomeViewMode) => {
    clearSelection();
    setExpandedView(view);
  };

  // Stato Sincronizzazione Google Calendar
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Data fetching & mutations
  const { events: rawEvents, tasks: rawTasks, isLoading, isError } = useAgendaHome(currentMonth);
  const { toggleTask, deleteTask } = useTaskMutations(['tasks']);
  const { deleteEvent } = useEventMutations(['events']);

  // Modals Context
  const { openTaskDetail } = useTaskModals();
  const { openEventDetail } = useEventModals();

  // Calcolo Progresso Anno
  const yearProgress: number = useMemo(() => calculateYearProgress(), []);

  // Costruzione albero Task base (UITask)
  const rawTree: UITask[] = useMemo(() => {
    return buildTaskTreeForHome(rawTasks ?? [], todayStr);
  }, [rawTasks, todayStr]);

  // Notifica pallino rosso per Task senza data
  const showNotificationDot = useMemo(() => {
    return showWithDeadline
      ? rawTree.some((t) => !t.deadline && !t.done)
      : rawTree.some((t) => !!t.deadline && !t.done);
  }, [rawTree, showWithDeadline]);

  // Albero Task filtrato per modalità scadenza e ordinamento
  const displayedTaskTree: UITask[] = useMemo(() => {
    const deadlineFiltered = filterTreeByDeadlineMode(rawTree, showWithDeadline);
    return filterAndSortTree(deadlineFiltered, false, sortMode, todayStr);
  }, [rawTree, showWithDeadline, sortMode, todayStr]);

  // Misura dinamica dello spazio per Task compatte con indicatore •••
  const tasksListRef = useRef<HTMLDivElement>(null);
  const { clientHeight: tasksContainerHeight } = useResizeObserver(tasksListRef, 50);

  const TASK_SLOT_HEIGHT = 70;
  const INDICATOR_HEIGHT = 32;

  const maxTasksFit = useMemo(() => {
    if (tasksContainerHeight <= 0) return 2;
    if (displayedTaskTree.length * TASK_SLOT_HEIGHT <= tasksContainerHeight) {
      return displayedTaskTree.length;
    }
    const availableForItems = tasksContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(availableForItems / TASK_SLOT_HEIGHT));
  }, [tasksContainerHeight, displayedTaskTree.length]);

  const visibleTasks = useMemo(() => {
    return displayedTaskTree.slice(0, maxTasksFit);
  }, [displayedTaskTree, maxTasksFit]);

  const hasMoreTasks = displayedTaskTree.length > maxTasksFit;

  // Mappatura eventi del giorno corrente
  const todayEvents: CalendarEvent[] = useMemo(() => {
    const all = mapDbEventsToCalendarEvents(rawEvents ?? []);
    return all.filter((e) => {
      if (!e.dateStr) return true;
      const fine = e.endDateStr || e.dateStr;
      return todayStr >= e.dateStr && todayStr <= fine;
    });
  }, [rawEvents, todayStr]);

  // Handler Selezione ed Eliminazione Multipla Eventi & Task
  const allEventIds = useMemo(() => todayEvents.map((ev) => Number(ev.id)), [todayEvents]);
  const allTaskIds = useMemo(() => displayedTaskTree.map((t) => t.id), [displayedTaskTree]);

  useEffect(() => {
    if (isEventsSelection) updateAllIds(allEventIds);
    else if (isTasksSelection) updateAllIds(allTaskIds);
  }, [allEventIds, allTaskIds, isEventsSelection, isTasksSelection, updateAllIds]);

  const handleDeleteSelectedEvents = useCallback(
    async (ids?: (number | string)[]) => {
      const targetIds = ids && ids.length > 0 ? ids.map(Number) : (selectionState.selectedIds as number[]);
      if (targetIds.length === 0) return;
      if (!window.confirm(`Vuoi eliminare i ${targetIds.length} eventi selezionati?`)) return;
      for (const id of targetIds) {
        await deleteEvent(id);
      }
      clearSelection();
    },
    [deleteEvent, selectionState.selectedIds, clearSelection]
  );

  const handleToggleSelectEvent = useCallback(
    (id: number) => {
      if (isEventsSelection) {
        toggleItem(id);
      } else {
        startSelection('home-events', id, allEventIds, handleDeleteSelectedEvents);
      }
    },
    [isEventsSelection, toggleItem, startSelection, allEventIds, handleDeleteSelectedEvents]
  );

  const handleDeleteSelectedTasks = useCallback(
    (ids?: (number | string)[]) => {
      const targetIds = ids && ids.length > 0 ? ids.map(Number) : (selectionState.selectedIds as number[]);
      if (targetIds.length === 0) return;
      if (!window.confirm(`Vuoi eliminare le ${targetIds.length} task selezionate?`)) return;
      for (const id of targetIds) {
        deleteTask(id);
      }
      clearSelection();
    },
    [deleteTask, selectionState.selectedIds, clearSelection]
  );

  const handleToggleSelectTask = useCallback(
    (id: number) => {
      if (isTasksSelection) {
        toggleItem(id);
      } else {
        startSelection('home-tasks', id, allTaskIds, handleDeleteSelectedTasks);
      }
    },
    [isTasksSelection, toggleItem, startSelection, allTaskIds, handleDeleteSelectedTasks]
  );

  // Toggle stato completamento task
  const handleToggleTask = (id: number, currentStatus: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleTask({ id, isDone: !currentStatus });
  };

  // Sincronizzazione Google Calendar
  const handleSyncGoogle = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await api.post<{ message: string }>('/google-calendar/sync');
      if (res?.message) {
        setSyncFeedback(res.message);
        setTimeout(() => setSyncFeedback(null), 3500);
      }
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (err: unknown) {
      logger.error('Errore sincronizzazione Google Calendar:', err);
      const msg = extractErrorMessage(err, 'Errore durante la sincronizzazione');
      setSyncFeedback(msg);
      setTimeout(() => setSyncFeedback(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  const isInitialLoad: boolean =
    isLoading &&
    (!rawTasks || rawTasks.length === 0) &&
    (!rawEvents || rawEvents.length === 0);

  const handleRetry = () => {
    queryClient.refetchQueries();
  };

  return {
    todayEvents,
    displayedTaskTree,
    visibleTasks,
    hasMoreTasks,
    tasksListRef,
    yearProgress,
    formattedDate,
    sortMode,
    setSortMode,
    showWithDeadline,
    setShowWithDeadline,
    showNotificationDot,
    expandedView,
    setExpandedView: handleSetExpandedView,
    isSyncing,
    syncFeedback,
    clearSyncFeedback: () => setSyncFeedback(null),
    handleSyncGoogle,
    handleToggleTask,
    // Modals
    openTaskDetail,
    openEventDetail,
    // Selection
    selectionState,
    isEventsSelection,
    isTasksSelection,
    handleToggleSelectEvent,
    handleToggleSelectTask,
    // Status
    isInitialLoad,
    isError,
    handleRetry,
  };
}
