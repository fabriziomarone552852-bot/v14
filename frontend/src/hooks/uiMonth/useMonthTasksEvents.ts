// frontend/src/hooks/uiMonth/useMonthTasksEvents.ts
import { useMemo, useCallback } from 'react';
import { useTaskModals } from '@/context/TaskModalContext';
import { useEventModals } from '@/context/EventModalContext';
import { mapDbEventsToCalendarEvents } from '@/utils/eventUtils';
// 🪄 Importiamo la funzione per costruire l'albero e il tipo corretto
import { buildTaskTreeForMonth } from '@/utils/taskUtils'; 
import type { DbTask, CalendarEvent, UITask } from '@/types';
import type { SyncMonthResponse } from '@/types';

type ToggleTaskFn = (payload: { id: number; isDone: boolean }) => void;

export const useMonthTasksEvents = (
  monthData: SyncMonthResponse | undefined,
  firstDay: Date,
  lastDay: Date,
  toggleTask: ToggleTaskFn
) => {
  const { openTaskDetail } = useTaskModals(); 
  const { openEventDetail } = useEventModals();

  const firstDayStr = useMemo(() => firstDay.toISOString().substring(0, 10), [firstDay]);
  const lastDayStr = useMemo(() => lastDay.toISOString().substring(0, 10), [lastDay]);

  const filteredTasks = useMemo((): DbTask[] => {
    if (!monthData?.tasks) return [];
    return monthData.tasks.filter((t: DbTask) => {
      if (!t.data_scadenza) return true;
      const taskDateStr = t.data_scadenza.substring(0, 10);
      return taskDateStr >= firstDayStr && taskDateStr <= lastDayStr;
    });
  }, [monthData?.tasks, firstDayStr, lastDayStr]);

  // 🪄 TRADUZIONE RIGOROSA PER MONTHPAGE: Applica l'albero di famiglia con scadenza più imminente
  const mappedTasks = useMemo((): UITask[] => {
    return buildTaskTreeForMonth(monthData?.tasks, firstDayStr, lastDayStr);
  }, [monthData?.tasks, firstDayStr, lastDayStr]);

  const mappedEvents = useMemo((): CalendarEvent[] => {
    return mapDbEventsToCalendarEvents(monthData?.events ?? [], firstDay.toISOString());
  }, [monthData?.events, firstDay]);

  const handleToggleTaskFromGrid = useCallback(async (task: DbTask, newStatus: boolean): Promise<void> => {
    toggleTask({ id: task.id, isDone: newStatus });
  }, [toggleTask]);

  // 🪄 Aggiornato per cercare dentro i task UI
  const handleSelectTask = useCallback((task: { id: number }): void => {
    // La ricerca su un albero potrebbe richiedere una funzione ricorsiva se il task è annidato,
    // ma per l'apertura base cerchiamo il task nell'array principale.
    const uiTask = mappedTasks.find((t: UITask) => t.id === task.id);
    if (uiTask) openTaskDetail(uiTask);
  }, [mappedTasks, openTaskDetail]);

  const handleSelectEvent = useCallback((ev: CalendarEvent): void => {
    openEventDetail(ev);
  }, [openEventDetail]);

  return {
    filteredTasks,
    mappedTasks, // Esportiamo rigorosamente UITask[]
    mappedEvents,
    handleToggleTaskFromGrid,
    handleSelectTask,
    handleSelectEvent
  };
};