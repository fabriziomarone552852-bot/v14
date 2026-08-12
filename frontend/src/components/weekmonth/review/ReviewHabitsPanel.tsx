// frontend/src/components/weekmonth/review/ReviewHabitsPanel.tsx
import React, { useState, useMemo } from 'react';
import { Pagination } from '@/components/shared/utils/Pagination';
import type { Habit } from '@/types/habits';

const HABITS_PER_PAGE = 3;

interface ReviewHabitsPanelProps {
  habits: Habit[];
  year: number;
  month: number;
}

export const ReviewHabitsPanel: React.FC<ReviewHabitsPanelProps> = ({ habits, year, month }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Dividiamo i giorni in 2 righe: 1-metà e metà+1-fine
  const midPoint = Math.ceil(daysInMonth / 2);
  const row1 = Array.from({ length: midPoint }, (_, i) => i + 1);
  const row2 = Array.from({ length: daysInMonth - midPoint }, (_, i) => midPoint + i + 1);

  const habitGrid = useMemo(() => {
    return habits.map(habit => {
      const logDates = new Set(
        habit.logs.map(log => new Date(log.data_riferimento).getDate())
      );
      return { habit, logDates, completedDays: logDates.size };
    });
  }, [habits]);

  const totalPages = Math.ceil(habitGrid.length / HABITS_PER_PAGE);
  const startIdx = (currentPage - 1) * HABITS_PER_PAGE;
  const pageHabits = habitGrid.slice(startIdx, startIdx + HABITS_PER_PAGE);

  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400 italic">Nessun habit attivo in questo mese</p>
      </div>
    );
  }

  const DayRow: React.FC<{ days: number[]; logDates: Set<number> }> = ({ days, logDates }) => (
    <div className="flex gap-1 justify-center flex-wrap">
      {days.map(day => {
        const done = logDates.has(day);
        return (
          <div
            key={day}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
              done
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-gray-200/70 text-gray-400'
            }`}
            title={`${day}/${month}/${year}${done ? ' ✓' : ''}`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-5 justify-between">
        {pageHabits.map(({ habit, logDates, completedDays }) => (
          <div key={habit.id} className="flex-1 flex flex-col gap-2 bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-0">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-sm font-bold text-gray-800">
                {habit.tipo === 'R' ? '🔁' : '⭐'} {habit.titolo}
              </span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {completedDays}/{daysInMonth}
              </span>
            </div>
            {/* Griglia giorni — 2 righe */}
            <div className="flex flex-col gap-1.5 flex-1 justify-center">
              <DayRow days={row1} logDates={logDates} />
              <DayRow days={row2} logDates={logDates} />
            </div>
          </div>
        ))}
      </div>

      {/* Paginazione */}
      <div className="shrink-0 pt-3">
        <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
      </div>
    </div>
  );
};
