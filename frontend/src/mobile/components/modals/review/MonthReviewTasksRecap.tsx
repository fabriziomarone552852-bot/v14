// src/mobile/components/modals/review/MonthReviewTasksRecap.tsx
import React from 'react';
import type { Task } from '@/types/tasks';
import { formatShortDate } from './monthReview.utils';

interface MonthReviewTasksRecapProps {
  tasksCompleted: number;
  tasksTotal: number;
  completedTasks: Task[];
}

export const MonthReviewTasksRecap: React.FC<MonthReviewTasksRecapProps> = ({
  tasksCompleted,
  tasksTotal,
  completedTasks,
}) => {
  const tasksPercentage = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 pb-[max(env(safe-area-inset-bottom,0px),20px)] space-y-3.5">
      {/* Banner Riassuntivo */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-xs flex flex-col items-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 mb-0.5">
          Task Completate
        </span>
        <div className="text-3xl font-extrabold mb-1">
          {tasksCompleted} <span className="text-lg text-blue-200">/ {tasksTotal}</span>
        </div>
        <div className="w-full max-w-xs bg-blue-800/40 rounded-full h-2 mt-1 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${tasksPercentage}%` }}
          />
        </div>
        <span className="text-[11px] text-blue-100 mt-1.5 font-medium">
          {tasksPercentage}% di completamento mensile
        </span>
      </div>

      {/* Elenco Dettagliato Task */}
      <div className="bg-white rounded-2xl p-3.5 border border-gray-200/90 shadow-2xs flex flex-col gap-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 pb-1 border-b border-gray-100">
          Elenco Task Concluse
        </h4>

        <div className="space-y-1.5">
          {completedTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-800"
            >
              <span className="text-green-500 font-bold">✓</span>
              <span className="flex-1 min-w-0 font-medium truncate">{t.titolo}</span>
              {t.data_scadenza && (
                <span className="text-[10px] text-gray-400 font-medium shrink-0">
                  {formatShortDate(t.data_scadenza)}
                </span>
              )}
            </div>
          ))}

          {completedTasks.length === 0 && (
            <p className="text-xs text-gray-400 italic text-center py-6">
              Nessuna task completata questo mese
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
