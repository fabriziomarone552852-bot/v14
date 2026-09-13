// src/mobile/components/modals/review/YearReviewTasksRecap.tsx
import React from 'react';
import { MonthBarChartMobile, WeekdayBarChartMobile } from './ReviewSharedComponents';

interface YearReviewTasksRecapProps {
  tasksCompleted: number;
  tasksTotal: number;
  year: number;
  tasksByMonth: Record<number, number>;
  tasksByWeekday: Record<number, number>;
}

export const YearReviewTasksRecap: React.FC<YearReviewTasksRecapProps> = ({
  tasksCompleted,
  tasksTotal,
  year,
  tasksByMonth,
  tasksByWeekday,
}) => {
  const taskProgress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 pb-[max(env(safe-area-inset-bottom,0px),20px)] space-y-3 flex flex-col justify-between">
      {/* Banner Riassuntivo */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3.5 text-white shadow-xs flex flex-col items-center shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 mb-0.5">
          Task Completate
        </span>
        <div className="text-3xl font-extrabold mb-1">
          {tasksCompleted} <span className="text-lg text-blue-200">/ {tasksTotal}</span>
        </div>
        <div className="w-full max-w-xs bg-blue-800/40 rounded-full h-2 mt-1 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${taskProgress}%` }}
          />
        </div>
        <span className="text-[11px] text-blue-100 mt-1.5 font-medium">
          {taskProgress.toFixed(0)}% di completamento del {year}
        </span>
      </div>

      {/* Riga 1: Mese più Produttivo */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs flex-1 min-h-[160px] flex flex-col justify-between">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-1 text-center shrink-0">
          Mese più Produttivo
        </h4>
        <div className="flex-1 min-h-0 flex items-center justify-center w-full">
          <MonthBarChartMobile data={tasksByMonth} />
        </div>
      </div>

      {/* Riga 2: Giorno più Produttivo */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs flex-1 min-h-[160px] flex flex-col justify-between">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-1 text-center shrink-0">
          Giorno più Produttivo
        </h4>
        <div className="flex-1 min-h-0 flex items-center justify-center w-full">
          <WeekdayBarChartMobile data={tasksByWeekday} />
        </div>
      </div>
    </div>
  );
};
