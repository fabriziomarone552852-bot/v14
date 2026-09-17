// src/mobile/hooks/useMobileDaySelection.ts
import { useEffect, useCallback, useMemo } from 'react';
import { useMobileSelection } from '../context/MobileSelectionContext';
import type { CalendarEvent, UITask } from '@/types';
import type { RoutineItem } from '@/components/day/RoutineColumn';

export interface UseMobileDaySelectionProps {
  mappedEvents: CalendarEvent[];
  sortedTasks: UITask[];
  mappedRoutines: RoutineItem[];
  deleteEvent: (id: string | number) => void | Promise<void>;
  deleteTask: (id: number) => void;
  deleteHabit: (id: number) => void | Promise<unknown>;
}

export function useMobileDaySelection({
  mappedEvents,
  sortedTasks,
  mappedRoutines,
  deleteEvent,
  deleteTask,
  deleteHabit,
}: UseMobileDaySelectionProps) {
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

  const allEventIds = useMemo(() => mappedEvents.map((ev) => Number(ev.id)), [mappedEvents]);
  const allTaskIds = useMemo(() => sortedTasks.map((t) => t.id), [sortedTasks]);
  const allRoutineIds = useMemo(() => mappedRoutines.map((r) => r.id), [mappedRoutines]);

  useEffect(() => {
    if (isEventsSelection) updateAllIds(allEventIds);
    else if (isTasksSelection) updateAllIds(allTaskIds);
    else if (isRoutinesSelection) updateAllIds(allRoutineIds);
  }, [allEventIds, allTaskIds, allRoutineIds, isEventsSelection, isTasksSelection, isRoutinesSelection, updateAllIds]);

  // Utility batch delete: confirm → loop → clearSelection
  // Nota: non usa useCallback perché è una factory che crea funzioni (non un hook)
  const batchDelete = (
    label: string,
    deleteFn: (id: number) => void | Promise<unknown>
  ) =>
    async (ids?: (number | string)[]) => {
      const targetIds = ids && ids.length > 0 ? ids.map(Number) : (selectionState.selectedIds as number[]);
      if (targetIds.length === 0) return;
      if (!window.confirm(`Vuoi eliminare ${targetIds.length} ${label}?`)) return;
      for (const id of targetIds) {
        await deleteFn(id);
      }
      clearSelection();
    };

  const handleDeleteSelectedEvents = useCallback(batchDelete('eventi selezionati', deleteEvent), [deleteEvent, selectionState.selectedIds, clearSelection]);
  const handleDeleteSelectedTasks = useCallback(batchDelete('task selezionate', deleteTask), [deleteTask, selectionState.selectedIds, clearSelection]);
  const handleDeleteSelectedRoutines = useCallback(batchDelete('routine selezionate', deleteHabit), [deleteHabit, selectionState.selectedIds, clearSelection]);


  const handleToggleSelectEvent = useCallback(
    (id: number) => {
      if (isEventsSelection) toggleItem(id);
      else startSelection('day-events', id, allEventIds, handleDeleteSelectedEvents);
    },
    [isEventsSelection, toggleItem, startSelection, allEventIds, handleDeleteSelectedEvents]
  );

  const handleToggleSelectTask = useCallback(
    (id: number) => {
      if (isTasksSelection) toggleItem(id);
      else startSelection('day-tasks', id, allTaskIds, handleDeleteSelectedTasks);
    },
    [isTasksSelection, toggleItem, startSelection, allTaskIds, handleDeleteSelectedTasks]
  );

  const handleToggleSelectRoutine = useCallback(
    (id: number) => {
      if (isRoutinesSelection) toggleItem(id);
      else startSelection('day-routines', id, allRoutineIds, handleDeleteSelectedRoutines);
    },
    [isRoutinesSelection, toggleItem, startSelection, allRoutineIds, handleDeleteSelectedRoutines]
  );


  return {
    selectionState,
    isEventsSelection,
    isTasksSelection,
    isRoutinesSelection,
    handleToggleSelectEvent,
    handleToggleSelectTask,
    handleToggleSelectRoutine,
    clearSelection,
  };
}
