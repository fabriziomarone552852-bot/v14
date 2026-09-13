// src/mobile/components/day/tasks/MobileDayTasksExpanded.tsx
import React from 'react';
import {
  TaskListIcon,
  CalendarIcon,
  CalendarXIcon,
  SwitchIcon,
  CloseIcon,
} from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { ExpandedTaskRow } from '../rows/ExpandedTaskRow';
import type { UITask, TaskSummary } from '@/types';
import type { TaskSortMode } from '@/mobile/hooks/useMobileDayLogic';

export interface MobileDayTasksExpandedProps {
  tasks: UITask[];
  showWithDeadline: boolean;
  showNotificationDot: boolean;
  sortMode: TaskSortMode;
  isTasksSelection: boolean;
  selectedIds: (number | string)[];
  onToggleDeadlineFilter: () => void;
  onToggleSortMode: () => void;
  onToggleSelectTask: (id: number) => void;
  onOpenTaskDetail: (task: TaskSummary) => void;
  onToggleTask: (id: number, currentStatus: boolean, e: React.MouseEvent) => void;
  onCloseExpanded: () => void;
}

export const MobileDayTasksExpanded: React.FC<MobileDayTasksExpandedProps> = ({
  tasks,
  showWithDeadline,
  showNotificationDot,
  sortMode,
  isTasksSelection,
  selectedIds,
  onToggleDeadlineFilter,
  onToggleSortMode,
  onToggleSelectTask,
  onOpenTaskDetail,
  onToggleTask,
  onCloseExpanded,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
            <TaskListIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Tutte le Task ({tasks.length})
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {showWithDeadline ? 'Con Scadenza' : 'Senza Scadenza'} •{' '}
              {sortMode === 'priority' ? 'Per Priorità' : 'Cronologico'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex">
            <button
              type="button"
              onClick={onToggleDeadlineFilter}
              className="p-1.5 rounded-lg border transition-colors flex items-center justify-center w-8 h-8 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
              title={showWithDeadline ? 'Mostra Senza Data' : 'Mostra Con Data'}
            >
              {showWithDeadline ? (
                <CalendarIcon className="h-4 w-4" />
              ) : (
                <CalendarXIcon className="h-4 w-4" />
              )}
            </button>
            {showNotificationDot && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs border-2 border-white pointer-events-none">
                !
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleSortMode}
            className="p-1.5 rounded-lg border transition-colors flex items-center justify-center w-8 h-8 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
            title={sortMode === 'priority' ? 'Ordinato per Priorità' : 'Ordinato Cronologicamente'}
          >
            <SwitchIcon sortMode={sortMode} className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onCloseExpanded}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer ml-1"
            title="Chiudi visualizzazione estesa"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 px-2 pb-3">
        {tasks.map((task) => (
          <ExpandedTaskRow
            key={task.id}
            task={task}
            isSelected={isTasksSelection && selectedIds.includes(task.id)}
            isSelectionMode={isTasksSelection}
            onToggleSelect={onToggleSelectTask}
            onOpenDetail={(t) => {
              onCloseExpanded();
              onOpenTaskDetail(t);
            }}
            onToggle={onToggleTask}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center py-8">
            <EmptyState message="Nessuna task in programma per questo giorno" />
          </div>
        )}
      </div>
    </div>
  );
};
