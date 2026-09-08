import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
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
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const isCurrentMonth =
    year === today.getFullYear() &&
    month === today.getMonth() + 1;

  const effectiveEnd = isCurrentMonth ? (endOfMonth > today ? today : endOfMonth) : endOfMonth;

  const habitGrid = useMemo(() => {
    return habits
      .map((habit) => {
        const activeDayNumbers: number[] = [];
        if (!habit.periods || habit.periods.length === 0) {
          const cur = new Date(startOfMonth);
          while (cur <= effectiveEnd) {
            activeDayNumbers.push(cur.getDate());
            cur.setDate(cur.getDate() + 1);
          }
        } else {
          const cur = new Date(startOfMonth);
          cur.setHours(0, 0, 0, 0);
          while (cur <= effectiveEnd) {
            const dStr = format(cur, 'yyyy-MM-dd');
            const isActive = habit.periods.some((p) => {
              const start = p.data_inizio ? p.data_inizio.split('T')[0] : '1970-01-01';
              const end = p.data_fine ? p.data_fine.split('T')[0] : '9999-12-31';
              return start <= dStr && end >= dStr;
            });
            if (isActive) {
              activeDayNumbers.push(cur.getDate());
            }
            cur.setDate(cur.getDate() + 1);
          }
        }

        const currentMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
        const logDates = new Set(
          habit.logs
            .filter((log) => log.count > 0 && log.data_riferimento.startsWith(currentMonthPrefix))
            .map((log) => parseInt(log.data_riferimento.split('-')[2], 10))
        );
        const completedDays = logDates.size;
        const activeDays = activeDayNumbers.length;

        return {
          habit,
          activeDays,
          activeDayNumbers,
          completedDays,
          logDates,
        };
      })
      .filter((h) => h.activeDays > 0);
  }, [habits, year, month]);

  const totalPages = Math.ceil(habitGrid.length / HABITS_PER_PAGE);
  const startIdx = (currentPage - 1) * HABITS_PER_PAGE;
  const pageHabits = habitGrid.slice(startIdx, startIdx + HABITS_PER_PAGE);

  if (habitGrid.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400 italic">Nessun habit attivo in questo mese</p>
      </div>
    );
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const midPoint = Math.ceil(daysInMonth / 2);
  const row1 = Array.from({ length: midPoint }, (_, i) => i + 1);
  const row2 = Array.from({ length: daysInMonth - midPoint }, (_, i) => midPoint + i + 1);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-rows-3 gap-4">
        {pageHabits.map(({ habit, activeDays, activeDayNumbers, logDates, completedDays }) => (
          <div key={habit.id} className="flex flex-col gap-2 bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-0 justify-between">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-sm font-bold text-gray-800">
                {habit.tipo === 'R' ? '🔁' : '⭐'} {habit.titolo}
              </span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {completedDays}/{activeDays} gg
              </span>
            </div>
            {/* Griglia giorni — 2 righe con giorni non attivi invisibili per mantenere l'allineamento perfetto */}
            <div className="flex flex-col gap-1.5 flex-1 justify-center">
              <div className="flex gap-1 justify-center flex-wrap">
                {row1.map((day) => {
                  const isActive = activeDayNumbers.includes(day);
                  const done = logDates.has(day);

                  if (!isActive) {
                    return (
                      <div
                        key={day}
                        className="w-9 h-9 rounded-lg invisible pointer-events-none"
                        aria-hidden="true"
                      />
                    );
                  }

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

              <div className="flex gap-1 justify-center flex-wrap">
                {row2.map((day) => {
                  const isActive = activeDayNumbers.includes(day);
                  const done = logDates.has(day);

                  if (!isActive) {
                    return (
                      <div
                        key={day}
                        className="w-9 h-9 rounded-lg invisible pointer-events-none"
                        aria-hidden="true"
                      />
                    );
                  }

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
