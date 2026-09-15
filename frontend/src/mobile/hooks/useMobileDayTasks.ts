// src/mobile/hooks/useMobileDayTasks.ts
import { useState, useMemo, useRef } from 'react';
import type { Task, CalendarEvent } from '@/types';
import { buildTaskTreeForDay, filterAndSortTree, filterTreeByDeadlineMode } from '@/utils/taskUtils';
import { useResizeObserver } from '@/hooks/useResizeObserver';

export type ExpandedViewType = 'none' | 'events' | 'tasks' | 'routines';
export type TaskSortMode = 'chrono' | 'priority';

export interface UseMobileDayTasksProps {
  tasks: Task[] | undefined;
  events: CalendarEvent[];
  targetDateStr: string;
}

export function useMobileDayTasks({
  tasks,
  events,
  targetDateStr,
}: UseMobileDayTasksProps) {
  const [sortMode, setSortMode] = useState<TaskSortMode>('chrono');
  const [showWithDeadline, setShowWithDeadline] = useState<boolean>(true);
  const [expandedView, setExpandedView] = useState<ExpandedViewType>('none');

  // Costruzione albero task per il giorno
  const rawTree = useMemo(() => {
    return buildTaskTreeForDay(tasks, targetDateStr);
  }, [tasks, targetDateStr]);

  const showNotificationDot = useMemo(() => {
    return showWithDeadline
      ? rawTree.some((t) => !t.deadline && !t.done)
      : rawTree.some((t) => !!t.deadline && !t.done);
  }, [rawTree, showWithDeadline]);

  const sortedTasks = useMemo(() => {
    const deadlineFiltered = filterTreeByDeadlineMode(rawTree, showWithDeadline);
    return filterAndSortTree(deadlineFiltered, false, sortMode, targetDateStr);
  }, [rawTree, showWithDeadline, sortMode, targetDateStr]);

  // Dimensionamento dinamico per liste compatte
  const eventsListRef = useRef<HTMLDivElement>(null);
  const tasksListRef = useRef<HTMLDivElement>(null);

  const { clientHeight: eventsContainerHeight } = useResizeObserver(eventsListRef, 50);
  const { clientHeight: tasksContainerHeight } = useResizeObserver(tasksListRef, 50);

  const EVENT_SLOT_HEIGHT = 50;
  const TASK_SLOT_HEIGHT = 70;
  const INDICATOR_HEIGHT = 32;

  const maxEventsFit = useMemo(() => {
    if (eventsContainerHeight <= 0) return 2;
    if (events.length * EVENT_SLOT_HEIGHT <= eventsContainerHeight) {
      return events.length;
    }
    const availableForItems = eventsContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(availableForItems / EVENT_SLOT_HEIGHT));
  }, [eventsContainerHeight, events.length]);

  const visibleCompactEvents = useMemo(() => {
    return events.slice(0, maxEventsFit);
  }, [events, maxEventsFit]);

  const hasMoreEvents = events.length > maxEventsFit;

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

  return {
    sortMode,
    setSortMode,
    showWithDeadline,
    setShowWithDeadline,
    showNotificationDot,
    expandedView,
    setExpandedView,
    rawTree,
    sortedTasks,
    eventsListRef,
    tasksListRef,
    visibleCompactEvents,
    hasMoreEvents,
    visibleCompactTasks,
    hasMoreTasks,
  };
}
