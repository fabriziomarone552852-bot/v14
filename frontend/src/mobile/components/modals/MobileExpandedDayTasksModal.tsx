// src/mobile/components/modals/MobileExpandedDayTasksModal.tsx
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { DbTask, TaskSummary } from '@/types';
import { mapDbTaskToUITask } from '@/utils/taskUtils';
import { TaskItem } from '@/components/shared/tasks/TaskItem';
import { TaskListIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';

export interface MobileExpandedDayTasksModalProps {
  expandedTasksDay: {
    dateStr: string;
    tasks: DbTask[];
  } | null;
  onClose: () => void;
  onSelectTask: (task: TaskSummary) => void;
  onToggleTask: (id: number, currentStatus: boolean, e?: React.MouseEvent) => Promise<void> | void;
}

export const MobileExpandedDayTasksModal: React.FC<MobileExpandedDayTasksModalProps> = ({
  expandedTasksDay,
  onClose,
  onSelectTask,
  onToggleTask,
}) => {
  const formattedDate = useMemo(() => {
    if (!expandedTasksDay?.dateStr) return '';
    const [y, m, d] = expandedTasksDay.dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = format(dateObj, 'EEEE d MMMM yyyy', { locale: it });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [expandedTasksDay?.dateStr]);

  if (!expandedTasksDay) return null;

  return (
    <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
            <TaskListIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Task ({expandedTasksDay.tasks.length})
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {formattedDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
          title="Chiudi visualizzazione task"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 pr-1">
        {expandedTasksDay.tasks.map((task) => {
          const uiTask = mapDbTaskToUITask(task);
          return (
            <TaskItem
              key={task.id}
              task={uiTask}
              onSelect={(t) => {
                onClose();
                onSelectTask(t);
              }}
              onToggle={onToggleTask}
            />
          );
        })}

        {expandedTasksDay.tasks.length === 0 && (
          <div className="h-full flex items-center justify-center py-8">
            <EmptyState message="Nessuna task in programma per questo giorno" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileExpandedDayTasksModal;
