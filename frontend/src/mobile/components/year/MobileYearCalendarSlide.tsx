// src/mobile/components/year/MobileYearCalendarSlide.tsx
import React from 'react';
import type { DbEvent } from '@/types/events';
import type { DbTask } from '@/types/tasks';
import MobileGoalsAndPrioritiesChips, { type PriorityLikeEntry } from '../MobileGoalsAndPrioritiesChips';
import MobileYearCalendar from '../MobileYearCalendar';

interface MobileYearCalendarSlideProps {
  activePageIndex: 0 | 1;
  goalText?: string | null;
  priorities?: (PriorityLikeEntry | null)[] | null;
  onSaveGoal: (text: string) => void;
  onSavePriority: (id: number | undefined, text: string, index?: number) => void;
  year: number;
  events?: DbEvent[];
  tasks?: DbTask[];
  taskDays?: Set<string>;
  eventDays?: Set<string>;
  highlightedDays?: Set<string>;
  onMonthClick: (year: number, monthIndex: number) => void;
}

export const MobileYearCalendarSlide: React.FC<MobileYearCalendarSlideProps> = ({
  activePageIndex,
  goalText,
  priorities,
  onSaveGoal,
  onSavePriority,
  year,
  events,
  tasks,
  taskDays,
  eventDays,
  highlightedDays,
  onMonthClick,
}) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
        activePageIndex === 0
          ? 'translate-x-0 pointer-events-auto'
          : '-translate-x-full pointer-events-none'
      }`}
    >
      {/* OBIETTIVO E PRIORITÀ ANNUALI COMPATTI A CHIPS */}
      <MobileGoalsAndPrioritiesChips
        goalText={goalText}
        priorities={priorities}
        onSaveGoal={onSaveGoal}
        onSavePriority={onSavePriority}
        goalPlaceholder="Qual è il tuo obiettivo per quest'anno?"
      />

      {/* CALENDARIO ANNUALE 12 MESI ZERO-SCROLL */}
      <MobileYearCalendar
        year={year}
        events={events}
        tasks={tasks}
        taskDays={taskDays}
        eventDays={eventDays}
        highlightedDays={highlightedDays}
        onMonthClick={onMonthClick}
      />
    </div>
  );
};

export default MobileYearCalendarSlide;
