// src/mobile/components/modals/review/MonthReviewHabitsRecap.tsx
import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import type { ActiveHabitInMonth } from './monthReview.utils';

interface MonthReviewHabitsRecapProps {
  activeHabitsInMonth: ActiveHabitInMonth[];
  allMonthDays: number[];
}

export const MonthReviewHabitsRecap: React.FC<MonthReviewHabitsRecapProps> = ({
  activeHabitsInMonth,
  allMonthDays,
}) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 pb-[max(env(safe-area-inset-bottom,0px),20px)] space-y-2.5">
      {activeHabitsInMonth.map(({ habit, activeDays, activeDayNumbers, completedDays, logDates }) => {
        return (
          <div
            key={habit.id}
            className="bg-gray-50 rounded-2xl p-2.5 border border-gray-200 shadow-2xs space-y-1.5"
          >
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-900 truncate flex items-center gap-1">
                <span>{habit.tipo === 'R' ? '🔁' : '⭐'}</span>
                <span className="truncate">{habit.titolo}</span>
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
                {completedDays}/{activeDays} gg
              </span>
            </div>

            {/* Griglia giorni: Tutti i giorni del mese mantengono la posizione precisa, i giorni non attivi sono invisibili */}
            <div className="flex gap-0.5 items-center w-full justify-between pt-0.5">
              {allMonthDays.map((day) => {
                const isActive = activeDayNumbers.includes(day);
                const done = logDates.has(day);

                if (!isActive) {
                  return (
                    <div
                      key={`d-${day}`}
                      className="flex-1 min-w-0 aspect-square max-h-6 invisible pointer-events-none"
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <div
                    key={`d-${day}`}
                    className={`flex-1 min-w-0 aspect-square max-h-6 rounded-[3px] flex items-center justify-center text-[7.5px] font-bold transition-colors ${
                      done
                        ? 'bg-green-500 text-white shadow-2xs'
                        : 'bg-gray-200/70 text-gray-400'
                    }`}
                    title={`Giorno ${day}${done ? ' ✓' : ''}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {activeHabitsInMonth.length === 0 && (
        <div className="flex items-center justify-center h-full min-h-[220px] p-4">
          <EmptyState message="Nessuna routine o abitudine attiva per questo mese" />
        </div>
      )}
    </div>
  );
};
