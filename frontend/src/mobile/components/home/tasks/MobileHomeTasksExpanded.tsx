// src/mobile/components/home/tasks/MobileHomeTasksExpanded.tsx
import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import {
  CalendarIcon,
  CalendarXIcon,
  CloseIcon,
  SwitchIcon,
  TaskListIcon,
} from '@/components/shared/utils/Icons';
import { MobileHomeExpandedTaskRow } from '../MobileHomeExpandedRows';
import type { UITask, TaskSummary } from '@/types';

export interface MobileHomeTasksExpandedProps {
  displayedTaskTree: UITask[];
  showWithDeadline: boolean;
  setShowWithDeadline: React.Dispatch<React.SetStateAction<boolean>>;
  sortMode: 'chrono' | 'priority';
  setSortMode: React.Dispatch<React.SetStateAction<'chrono' | 'priority'>>;
  showNotificationDot: boolean;
  onCloseExpanded: () => void;
  onToggleTask: (id: number, currentStatus: boolean, e?: React.MouseEvent) => void;
  onOpenDetail: (t: TaskSummary) => void;
  isTasksSelection: boolean;
  selectedIds: (number | string)[];
  onToggleSelectTask: (id: number) => void;
}

export const MobileHomeTasksExpanded: React.FC<MobileHomeTasksExpandedProps> = ({
  displayedTaskTree,
  showWithDeadline,
  setShowWithDeadline,
  sortMode,
  setSortMode,
  showNotificationDot,
  onCloseExpanded,
  onToggleTask,
  onOpenDetail,
  isTasksSelection,
  selectedIds,
  onToggleSelectTask,
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
              Tutte le Task ({displayedTaskTree.length})
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
              onClick={() => setShowWithDeadline((prev) => !prev)}
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
            onClick={() =>
              setSortMode((prev) => (prev === 'chrono' ? 'priority' : 'chrono'))
            }
            className="p-1.5 rounded-lg border transition-colors flex items-center justify-center w-8 h-8 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
            title={
              sortMode === 'priority'
                ? 'Ordinato per Priorità'
                : 'Ordinato Cronologicamente'
            }
          >
            <SwitchIcon sortMode={sortMode} className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onCloseExpanded}
            className="p-2 rounded-xl bg-gray-200/80 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer ml-1"
            title="Chiudi visualizzazione estesa"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pt-3 px-2 pb-3">
        {displayedTaskTree.map((task) => (
          <MobileHomeExpandedTaskRow
            key={task.id}
            task={task}
            isSelected={isTasksSelection && selectedIds.includes(task.id)}
            isSelectionMode={isTasksSelection}
            onToggleSelect={onToggleSelectTask}
            onOpenDetail={(t) => {
              onCloseExpanded();
              onOpenDetail(t);
            }}
            onToggle={onToggleTask}
          />
        ))}

        {displayedTaskTree.length === 0 && (
          <div className="h-full flex items-center justify-center py-8">
            <EmptyState message="Nessuna task presente" />
          </div>
        )}
      </div>
    </div>
  );
};
