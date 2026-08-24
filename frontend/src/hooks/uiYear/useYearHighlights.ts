// frontend/src/hooks/uiYear/useYearHighlights.ts
import { useMemo } from 'react';
import type { DbEvent } from '@/types/events';
import type { DbTask } from '@/types/tasks';

export interface UseYearHighlightsResult {
  events: DbEvent[];
  tasks: DbTask[];
  taskDays: Set<string>;
  eventDays: Set<string>;
  highlightedDays: Set<string>;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const useYearHighlights = (
  year: number,
  events: DbEvent[] = [],
  tasks: DbTask[] = []
): UseYearHighlightsResult => {
  return useMemo(() => {
    const taskDays = new Set<string>();
    const eventDays = new Set<string>();
    const highlightedDays = new Set<string>();

    // 1. EVENTI: campionamento date da data_inizio a data_fine (copre tutti i giorni di eventi multi-giorno)
    (events || []).forEach((event: DbEvent) => {
      const startStr = event.data_inizio;
      const endStr = event.data_fine || startStr;

      if (startStr) {
        const startParts = String(startStr).split('T')[0].split('-');
        const endParts = String(endStr).split('T')[0].split('-');

        if (startParts.length === 3) {
          const start = new Date(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));
          const end = endParts.length === 3 
            ? new Date(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]))
            : start;

          const curr = new Date(start);
          curr.setHours(0, 0, 0, 0);
          const endDay = new Date(end);
          endDay.setHours(0, 0, 0, 0);

          while (curr <= endDay) {
            if (curr.getFullYear() === year) {
              const dateStr = `${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`;
              eventDays.add(dateStr);
              highlightedDays.add(dateStr);
            }
            curr.setDate(curr.getDate() + 1);
          }
        }
      }
    });

    // 2. TASK: campionamento date per scadenza/deadline
    (tasks || []).forEach((task: DbTask) => {
      const dueStr = task.data_scadenza;
      if (dueStr) {
        const parts = String(dueStr).split('T')[0].split('-');
        if (parts.length === 3) {
          const yNum = Number(parts[0]);
          if (yNum === year) {
            const dateStr = `${parts[0]}-${pad(Number(parts[1]))}-${pad(Number(parts[2]))}`;
            taskDays.add(dateStr);
            highlightedDays.add(dateStr);
          }
        }
      }
    });

    return { events, tasks, taskDays, eventDays, highlightedDays };
  }, [year, events, tasks]);
};
