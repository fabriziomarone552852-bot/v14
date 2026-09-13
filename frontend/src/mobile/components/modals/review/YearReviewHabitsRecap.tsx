// src/mobile/components/modals/review/YearReviewHabitsRecap.tsx
import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import type { Habit } from '@/types/habits';

export interface ActiveHabitInYear {
  habit: Habit;
  activeDays: number;
  completedDays: number;
  longestStreak: number;
  pct: number;
}

interface YearReviewHabitsRecapProps {
  activeHabitsInYear: ActiveHabitInYear[];
  year: number;
}

export const YearReviewHabitsRecap: React.FC<YearReviewHabitsRecapProps> = ({
  activeHabitsInYear,
  year,
}) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 pb-[max(env(safe-area-inset-bottom,0px),20px)] space-y-2">
      {activeHabitsInYear.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[220px] p-4">
          <EmptyState message={`Nessuna routine o abitudine attiva nel ${year}`} />
        </div>
      ) : (
        activeHabitsInYear.map(({ habit, activeDays, completedDays, longestStreak, pct }) => (
          <div
            key={habit.id}
            className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                <span className="text-sm shrink-0">{habit.tipo === 'R' ? '🔁' : '⭐'}</span>
                <span className="text-xs font-bold text-gray-900 truncate">{habit.titolo}</span>
              </div>
              <span className="text-[10.5px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
                {completedDays}/{activeDays} gg
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10.5px] text-gray-500 font-medium pt-0.5">
              <span>
                🔥 Streak più lunga: <strong className="text-orange-600">{longestStreak} gg</strong>
              </span>
              <span className="font-semibold text-gray-600">{pct.toFixed(0)}%</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
