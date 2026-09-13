// src/mobile/components/week/MobileWeekCalendarSlide.tsx
import React from 'react';
import type { CalendarEvent, DbTask } from '@/types';
import MobileGoalsAndPrioritiesChips, { type PriorityLikeEntry } from '../MobileGoalsAndPrioritiesChips';
import MobileWeekCalendar from '../MobileWeekCalendar';

interface MobileWeekCalendarSlideProps {
  activePageIndex: 0 | 1;
  goalText?: string | null;
  priorities?: (PriorityLikeEntry | null)[] | null;
  onSaveGoal: (text: string) => void;
  onSavePriority: (id: number | undefined, text: string, index?: number) => void;
  monday: Date;
  events: CalendarEvent[];
  tasks: DbTask[];
  onDayClick: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTask?: (task: DbTask) => void;
  onOpenExpandedTasks?: (dateStr: string, dayTasks: DbTask[]) => void;
}

export const MobileWeekCalendarSlide: React.FC<MobileWeekCalendarSlideProps> = ({
  activePageIndex,
  goalText,
  priorities,
  onSaveGoal,
  onSavePriority,
  monday,
  events,
  tasks,
  onDayClick,
  onSelectEvent,
  onSelectTask,
  onOpenExpandedTasks,
}) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
        activePageIndex === 0
          ? 'translate-x-0 pointer-events-auto'
          : '-translate-x-full pointer-events-none'
      }`}
    >
      {/* OBIETTIVO E PRIORITÀ SETTIMANALI COMPATTI A CHIPS */}
      <MobileGoalsAndPrioritiesChips
        goalText={goalText}
        priorities={priorities}
        onSaveGoal={onSaveGoal}
        onSavePriority={onSavePriority}
        goalPlaceholder="Qual è il tuo obiettivo per la settimana?"
      />

      {/* VISTA CALENDARIO SETTIMANALE COMPRESSA (Lun - Dom senza scrollbar esterne) */}
      <MobileWeekCalendar
        monday={monday}
        events={events}
        tasks={tasks}
        onDayClick={onDayClick}
        onSelectEvent={onSelectEvent}
        onSelectTask={onSelectTask}
        onOpenExpandedTasks={onOpenExpandedTasks}
      />
    </div>
  );
};

export default MobileWeekCalendarSlide;
