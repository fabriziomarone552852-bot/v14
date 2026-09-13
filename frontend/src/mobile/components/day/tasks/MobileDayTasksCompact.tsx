// src/mobile/components/day/tasks/MobileDayTasksCompact.tsx
import React from 'react';
import {
  TaskListIcon,
  CalendarIcon,
  CalendarXIcon,
  SwitchIcon,
} from '@/components/shared/utils/Icons';
import { TaskItem } from '@/components/shared/tasks/TaskItem';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import type { UITask, TaskSummary } from '@/types';
import type { TaskSortMode } from '@/mobile/hooks/useMobileDayLogic';

export interface MobileDayTasksCompactProps {
  tasks: UITask[];
  visibleTasks: UITask[];
  hasMoreTasks: boolean;
  tasksListRef: React.RefObject<HTMLDivElement | null>;
  showWithDeadline: boolean;
  showNotificationDot: boolean;
  sortMode: TaskSortMode;
  onToggleDeadlineFilter: () => void;
  onToggleSortMode: () => void;
  onExpandTasks: () => void;
  onOpenTaskDetail: (task: TaskSummary) => void;
  onToggleTask: (id: number, currentStatus: boolean, e?: React.MouseEvent) => void;
}

export const MobileDayTasksCompact: React.FC<MobileDayTasksCompactProps> = ({
  tasks,
  visibleTasks,
  hasMoreTasks,
  tasksListRef,
  showWithDeadline,
  showNotificationDot,
  sortMode,
  onToggleDeadlineFilter,
  onToggleSortMode,
  onExpandTasks,
  onOpenTaskDetail,
  onToggleTask,
}) => {
  return (
    <div
      onClick={onExpandTasks}
      className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2.5 overflow-hidden cursor-pointer active:border-emerald-300 transition-colors select-none"
      title="Tocca per espandere le task a schermo intero"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <TaskListIcon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Task
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

        {/* Tasti Filtro & Ordinamento */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <div className="relative flex">
            <button
              type="button"
              onClick={onToggleDeadlineFilter}
              className="p-1 rounded-lg border transition-colors flex items-center justify-center w-6 h-6 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
              title={showWithDeadline ? 'Mostra Senza Data' : 'Mostra Con Data'}
              aria-label="Filtra scadenza"
            >
              {showWithDeadline ? (
                <CalendarIcon className="h-3 w-3" />
              ) : (
                <CalendarXIcon className="h-3 w-3" />
              )}
            </button>
            {showNotificationDot && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-xs border border-white pointer-events-none">
                !
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleSortMode}
            className="p-1 rounded-lg border transition-colors flex items-center justify-center w-6 h-6 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
            title={sortMode === 'priority' ? 'Ordinato per Priorità' : 'Ordinato Cronologicamente'}
            aria-label="Cambia ordinamento"
          >
            <SwitchIcon sortMode={sortMode} className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div
        ref={tasksListRef}
        className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden pt-1.5"
      >
        <div className="flex flex-col gap-1.5 overflow-hidden">
          {visibleTasks.map((task) => (
            <div key={task.id} onClick={(e) => e.stopPropagation()} className="shrink-0">
              <TaskItem
                task={task}
                onSelect={onOpenTaskDetail}
                onToggle={onToggleTask}
              />
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center py-2">
              <EmptyState message="Nessuna task per questo giorno" />
            </div>
          )}
        </div>

        {hasMoreTasks && (
          <div className="shrink-0 h-7 flex items-center justify-center select-none pt-0.5">
            <span className="text-xl font-black tracking-widest text-emerald-500 hover:text-emerald-600 leading-none">
              •••
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
