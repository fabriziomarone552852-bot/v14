// src/mobile/components/modals/review/MonthReviewHabitsRecap.tsx
import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const [expandedHabits, setExpandedHabits] = useState<Record<number, boolean>>({});

  const toggleHabitExpand = (habitId: number) => {
    setExpandedHabits((prev) => ({
      ...prev,
      [habitId]: !prev[habitId],
    }));
  };

  // Calcolo suddivisione giorni per vista espansa a 2 righe
  const { row1, row2 } = useMemo(() => {
    const midPoint = Math.ceil(allMonthDays.length / 2);
    return {
      row1: allMonthDays.slice(0, midPoint),
      row2: allMonthDays.slice(midPoint),
    };
  }, [allMonthDays]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 pb-[max(env(safe-area-inset-bottom,0px),20px)] space-y-2.5">
      {activeHabitsInMonth.map(({ habit, activeDays, activeDayNumbers, completedDays, dayProgressMap }) => {
        const isExpanded = Boolean(expandedHabits[habit.id]);

        const renderDayBox = (day: number, expanded: boolean) => {
          const isActive = activeDayNumbers.includes(day);
          const progress = dayProgressMap?.[day];
          const isCompleted = progress?.isCompleted ?? false;
          const isPartial = progress?.isPartial ?? false;
          const count = progress?.count ?? 0;
          const target = progress?.target ?? 1;

          let bgClass = 'bg-gray-100/80 text-gray-300 font-medium';
          let titleText = `Giorno ${day} - Non programmata`;

          if (isCompleted) {
            bgClass = 'bg-green-500 text-white font-bold shadow-2xs';
            titleText = `Giorno ${day}${target > 1 ? ` ✓ (${count}/${target})` : ' ✓'}`;
          } else if (isPartial) {
            bgClass = 'bg-amber-500 text-white font-black shadow-2xs';
            titleText = `Giorno ${day} - Parziale: ${count}/${target}`;
          } else if (isActive) {
            bgClass = 'bg-gray-200 text-gray-500 font-bold';
            titleText = `Giorno ${day}${target > 1 ? ` (0/${target})` : ''}`;
          }

          if (expanded) {
            return (
              <div
                key={`exp-d-${day}`}
                className={`flex-1 min-w-0 h-6 sm:h-7 rounded-md flex items-center justify-center transition-all ${
                  isPartial
                    ? 'text-[8.5px] leading-none tracking-tight font-black'
                    : 'text-[9.5px] font-bold'
                } ${bgClass}`}
                title={titleText}
              >
                {isPartial ? `${count}/${target}` : day}
              </div>
            );
          }

          return (
            <div
              key={`d-${day}`}
              className={`flex-1 min-w-0 aspect-square max-h-6 rounded-[3px] flex items-center justify-center transition-colors text-[7.5px] font-bold ${bgClass}`}
              title={titleText}
            >
              {day}
            </div>
          );
        };

        return (
          <div
            key={habit.id}
            onClick={() => toggleHabitExpand(habit.id)}
            className="bg-gray-50 rounded-2xl p-2.5 border border-gray-200 shadow-2xs space-y-1.5 cursor-pointer active:bg-gray-100/70 transition-colors select-none"
            title={isExpanded ? 'Tocca per comprimere' : 'Tocca per espandere i dettagli'}
          >
            {/* Header con titolo, punteggio e freccia chevron di espansione */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-900 truncate flex items-center gap-1">
                <span>{habit.tipo === 'R' ? '🔁' : '⭐'}</span>
                <span className="truncate">{habit.titolo}</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {completedDays}/{activeDays}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </div>
            </div>

            {/* Vista compatta (1 riga) oppure vista espansa (2 righe con quadratini più ampi e Y/X visibile) */}
            {isExpanded ? (
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex gap-1 items-center w-full justify-between">
                  {row1.map((day) => renderDayBox(day, true))}
                </div>
                <div className="flex gap-1 items-center w-full justify-between">
                  {row2.map((day) => renderDayBox(day, true))}
                  {row2.length < row1.length && (
                    <div className="flex-1 min-w-0 pointer-events-none" />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-0.5 items-center w-full justify-between pt-0.5">
                {allMonthDays.map((day) => renderDayBox(day, false))}
              </div>
            )}
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
