// src/mobile/components/month/MobileMonthCalendarSlide.tsx
import React from 'react';
import type { CalendarEvent, DbTask, Category, DailyEntry } from '@/types';
import MobileGoalsAndPrioritiesChips, { type PriorityLikeEntry } from '../MobileGoalsAndPrioritiesChips';
import MobileMonthCalendar from '../MobileMonthCalendar';

interface MobileMonthCalendarSlideProps {
  activePageIndex: 0 | 1 | 2;
  goalText?: string | null;
  priorities?: (PriorityLikeEntry | null)[] | null;
  onSaveGoal: (testo: string) => void;
  onSavePriority: (id: number | undefined, testo: string) => void;
  targetDate: Date;
  events: CalendarEvent[];
  tasks: DbTask[];
  dailyEntries: DailyEntry[];
  allCategories: Category[];
  onDayClick: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTask: (task: DbTask) => void;
  onToggleTask: (task: DbTask, newStatus: boolean) => Promise<void> | void;
  onMoodChange?: (dateStr: string, categoryId: number | null) => void;
  onOpenExpandedTasks: (dateStr: string, dayTasks: DbTask[]) => void;
}

export const MobileMonthCalendarSlide: React.FC<MobileMonthCalendarSlideProps> = ({
  activePageIndex,
  goalText,
  priorities,
  onSaveGoal,
  onSavePriority,
  targetDate,
  events,
  tasks,
  dailyEntries,
  allCategories,
  onDayClick,
  onSelectEvent,
  onSelectTask,
  onToggleTask,
  onMoodChange,
  onOpenExpandedTasks,
}) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
        activePageIndex === 1
          ? 'translate-x-0 pointer-events-auto'
          : activePageIndex === 0
          ? 'translate-x-full pointer-events-none'
          : '-translate-x-full pointer-events-none'
      }`}
    >
      {/* OBIETTIVO E PRIORITÀ MENSILI COMPATTI A CHIPS */}
      <MobileGoalsAndPrioritiesChips
        goalText={goalText}
        priorities={priorities}
        onSaveGoal={onSaveGoal}
        onSavePriority={onSavePriority}
        goalPlaceholder="Qual è il tuo obiettivo per il mese?"
      />

      {/* CALENDARIO MENSILE ZERO-SCROLL */}
      <MobileMonthCalendar
        targetDate={targetDate}
        events={events}
        tasks={tasks}
        dailyEntries={dailyEntries}
        allCategories={allCategories}
        onDayClick={onDayClick}
        onSelectEvent={onSelectEvent}
        onSelectTask={onSelectTask}
        onToggleTask={onToggleTask}
        onMoodChange={onMoodChange}
        onOpenExpandedTasks={onOpenExpandedTasks}
      />
    </div>
  );
};

export default MobileMonthCalendarSlide;
