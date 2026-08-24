import React, { useState } from 'react';
import type { Habit } from '@/types/habits';
import { Pagination } from '@/components/shared/utils/Pagination';

interface YearReviewHabitsPanelProps {
  habits: Habit[];
  year: number;
}

const getLongestStreak = (logs: Habit['logs']): number => {
  if (logs.length === 0) return 0;
  const sortedDates = logs
    .map(l => l.data_riferimento.split('T')[0])
    .sort();
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
};

export const YearReviewHabitsPanel: React.FC<YearReviewHabitsPanelProps> = ({ habits, year }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(habits.length / itemsPerPage));
  
  const currentHabits = habits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const daysInYear = new Date(year, 1, 29).getDate() === 29 ? 366 : 365;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
        {currentHabits.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Nessuna abitudine tracciata quest'anno.
          </div>
        ) : (
          currentHabits.map((habit) => {
            const completedDays = habit.logs.filter(l => l.count > 0).length;
            const longestStreak = getLongestStreak(habit.logs.filter(l => l.count > 0));

            return (
              <div key={habit.id} className="flex-1 flex flex-col justify-center gap-3 bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">
                    {habit.tipo === 'R' ? '🔁' : '⭐'} {habit.titolo}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {completedDays}/{daysInYear}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((completedDays / daysInYear) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-orange-600 font-medium">
                  🔥 Streak più lunga: {longestStreak} {longestStreak === 1 ? 'giorno' : 'giorni'}
                </span>
              </div>
            );
          })
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="pt-4 border-t border-gray-100 mt-4 shrink-0 flex justify-center">
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
