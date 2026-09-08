import React, { useState, useMemo } from 'react';
import type { Habit } from '@/types/habits';
import { Pagination } from '@/components/shared/utils/Pagination';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { format } from 'date-fns';

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

const getHabitActiveDaysInYear = (habit: Habit, yr: number): number => {
  const startOfYear = new Date(yr, 0, 1);
  const endOfYear = new Date(yr, 11, 31);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const effectiveEnd = yr === today.getFullYear() ? (endOfYear > today ? today : endOfYear) : endOfYear;

  if (!habit.periods || habit.periods.length === 0) {
    if (yr > today.getFullYear()) return 0;
    const diffTime = effectiveEnd.getTime() - startOfYear.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  }

  let count = 0;
  const cur = new Date(startOfYear);
  cur.setHours(0, 0, 0, 0);
  while (cur <= effectiveEnd) {
    const dStr = format(cur, 'yyyy-MM-dd');
    const isActive = habit.periods.some((p) => {
      const start = p.data_inizio ? p.data_inizio.split('T')[0] : '1970-01-01';
      const end = p.data_fine ? p.data_fine.split('T')[0] : '9999-12-31';
      return start <= dStr && end >= dStr;
    });
    if (isActive) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

export const YearReviewHabitsPanel: React.FC<YearReviewHabitsPanelProps> = ({ habits, year }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const activeHabitsInYear = useMemo(() => {
    return habits
      .map((habit) => {
        const activeDays = getHabitActiveDaysInYear(habit, year);
        const yearLogs = habit.logs.filter((l) => {
          if (l.count <= 0) return false;
          const dStr = l.data_riferimento.split('T')[0];
          const y = parseInt(dStr.split('-')[0], 10);
          return y === year;
        });
        const completedDays = yearLogs.length;
        const longestStreak = getLongestStreak(yearLogs);
        const pct = activeDays > 0 ? Math.min((completedDays / activeDays) * 100, 100) : 0;

        return {
          habit,
          activeDays,
          completedDays,
          longestStreak,
          pct,
        };
      })
      .filter((h) => h.activeDays > 0);
  }, [habits, year]);

  const totalPages = Math.max(1, Math.ceil(activeHabitsInYear.length / itemsPerPage));
  const currentHabits = activeHabitsInYear.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {currentHabits.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <EmptyState message={`Nessuna routine o abitudine attiva nel ${year}`} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-rows-3 gap-4">
          {currentHabits.map(({ habit, activeDays, completedDays, longestStreak, pct }) => (
            <div
              key={habit.id}
              className="flex flex-col justify-center gap-2.5 bg-gray-50 rounded-xl p-5 border border-gray-200 min-h-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  {habit.tipo === 'R' ? '🔁' : '⭐'} {habit.titolo}
                </span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {completedDays}/{activeDays} gg
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-orange-600 font-medium">
                  🔥 Streak più lunga: {longestStreak} {longestStreak === 1 ? 'giorno' : 'giorni'}
                </span>
                <span className="font-semibold text-gray-600">{pct.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pt-3 border-t border-gray-100 mt-3 shrink-0 flex justify-center">
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
