// src/mobile/hooks/useMobileDaySelection.ts
import { useEffect, useCallback, useMemo } from 'react';
import { useMobileSelection } from '../context/MobileSelectionContext';
import type { CalendarEvent, UITask } from '@/types';
import type { RoutineItem } from '@/components/day/RoutineColumn';

export interface UseMobileDaySelectionProps {
  mappedEvents: CalendarEvent[];
  sortedTasks: UITask[];
  mappedRoutines: RoutineItem[];
  deleteEvent: (id: string | number) => void | Promise<unknown>;
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
        startSelection('day-events', id, allEventIds, handleDeleteSelectedEvents);
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
        startSelection('day-tasks', id, allTaskIds, handleDeleteSelectedTasks);
      }
    },
    [isTasksSelection, toggleItem, startSelection, allTaskIds, handleDeleteSelectedTasks]
  );

  const handleDeleteSelectedRoutines = useCallback(
    async (ids?: (number | string)[]) => {
      const targetIds = ids && ids.length > 0 ? ids.map(Number) : (selectionState.selectedIds as number[]);
      if (targetIds.length === 0) return;
      if (!window.confirm(`Vuoi eliminare le ${targetIds.length} routine selezionate?`)) return;
      for (const id of targetIds) {
        await deleteHabit(id);
      }
      clearSelection();
    },
    [deleteHabit, selectionState.selectedIds, clearSelection]
  );

  const handleToggleSelectRoutine = useCallback(
    (id: number) => {
      if (isRoutinesSelection) {
        toggleItem(id);
      } else {
        startSelection('day-routines', id, allRoutineIds, handleDeleteSelectedRoutines);
      }
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
