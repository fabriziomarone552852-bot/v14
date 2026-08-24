// frontend/src/components/weekmonth/review/ReviewTasksPanel.tsx
import React from 'react';
import type { DbTask } from '@/types/tasks';

interface ReviewTasksPanelProps {
  completedTasks: DbTask[];
  tasksCompleted: number;
  tasksTotal: number;
}

export const ReviewTasksPanel: React.FC<ReviewTasksPanelProps> = ({
  completedTasks, tasksCompleted, tasksTotal,
}) => {
  const percentage = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Stats Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shrink-0">
        <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3">Statistiche Task</p>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-black text-blue-700">{tasksCompleted}</span>
          <span className="text-lg font-medium text-blue-500 mb-1">/ {tasksTotal} task completate</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-blue-200/50 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-blue-600 mt-2 font-semibold">{percentage}% completamento</p>
      </div>

      {/* Task completate — 2 colonne */}
      {completedTasks.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 shrink-0">Task completate</h4>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-2">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-sm px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 break-words">
                  <span className="text-green-500 font-bold shrink-0">✓</span>
                  <span>{task.titolo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tasksTotal === 0 && (
        <p className="text-sm text-gray-400 italic text-center py-8">Nessuna task completata in questo mese</p>
      )}
    </div>
  );
};
