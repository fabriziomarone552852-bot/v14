// src/mobile/components/home/tasks/MobileHomeTasksCompact.tsx
import React from 'react';
import { TaskItem } from '@/components/shared/tasks/TaskItem';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import {
  CalendarXIcon,
  SwitchIcon,
  TaskListIcon,
} from '@/components/shared/utils/Icons';
import type { UITask, TaskSummary } from '@/types';

export interface MobileHomeTasksCompactProps {
  displayedTaskTree: UITask[];
  showWithDeadline: boolean;
  setShowWithDeadline: React.Dispatch<React.SetStateAction<boolean>>;
  sortMode: 'chrono' | 'priority';
  setSortMode: React.Dispatch<React.SetStateAction<'chrono' | 'priority'>>;
  showNotificationDot: boolean;
  onExpand: () => void;
  onToggleTask: (id: number, currentStatus: boolean, e?: React.MouseEvent) => void;
  onOpenDetail: (t: TaskSummary) => void;
}

export const MobileHomeTasksCompact: React.FC<MobileHomeTasksCompactProps> = ({
  displayedTaskTree,
  showWithDeadline,
  setShowWithDeadline,
  sortMode,
  setSortMode,
  showNotificationDot,
  onExpand,
  onToggleTask,
  onOpenDetail,
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3 overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0 select-none">
        <div
          onClick={onExpand}
          className="flex items-center gap-2 cursor-pointer flex-1"
          title="Tocca per visualizzare tutte le task a schermo intero"
        >
          <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <TaskListIcon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Task
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {displayedTaskTree.length}
          </span>
        </div>

        {/* Azioni Filtro / Ordinamento */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Tasto 1: Toggle Filtro Scadenza */}
          <button
            type="button"
            onClick={() => setShowWithDeadline((prev) => !prev)}
            className={`relative p-1.5 rounded-lg border transition-all cursor-pointer ${
              showWithDeadline
                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-2xs'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
            title={
              showWithDeadline
                ? 'Mostra task senza data'
                : 'Mostra task con data di scadenza'
            }
          >
            <CalendarXIcon className="w-3.5 h-3.5" />
            {showNotificationDot && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Tasto 2: Toggle Ordinamento Priorità / Cronologico */}
          <button
            type="button"
            onClick={() =>
              setSortMode((prev) => (prev === 'chrono' ? 'priority' : 'chrono'))
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              sortMode === 'priority'
                ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-2xs'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
            title={`Ordinamento attuale: ${
              sortMode === 'priority' ? 'Priorità' : 'Data di scadenza'
            }`}
          >
            <SwitchIcon className="w-3 h-3 rotate-90" sortMode={sortMode} />
            <span>{sortMode === 'priority' ? 'Priorità' : 'Data'}</span>
          </button>
        </div>
      </div>

      {/* Lista Task Compatte */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1 pt-1.5 pr-0.5">
        {displayedTaskTree.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onSelect={onOpenDetail}
          />
        ))}

        {displayedTaskTree.length === 0 && (
          <div className="h-full flex items-center justify-center py-6">
            <EmptyState message="Nessuna task trovata" />
          </div>
        )}
      </div>
    </div>
  );
};
