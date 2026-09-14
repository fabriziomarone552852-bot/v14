// src/mobile/components/MobileMonthCalendar.tsx
import React from 'react';
import type { CalendarEvent, DbTask, Category, DailyEntry } from '@/types';
import { pad } from '@/utils/dateUtils';
import { useMobileMonthCalendarLogic } from '../hooks/useMobileMonthCalendarLogic';
import { MobileMonthDayCell } from './calendar/MobileMonthDayCell';
import { MobileMonthDayPopup } from './calendar/MobileMonthDayPopup';

export interface MobileMonthCalendarProps {
  targetDate: Date;
  events: CalendarEvent[];
  tasks?: DbTask[];
  dailyEntries?: DailyEntry[];
  allCategories?: Category[];
  onDayClick: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTask?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask, newStatus: boolean) => Promise<void> | void;
  onMoodChange?: (dateStr: string, categoryId: number | null) => void;
  onOpenExpandedTasks?: (dateStr: string, dayTasks: DbTask[]) => void;
}

const DAY_NAMES = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

export const MobileMonthCalendar: React.FC<MobileMonthCalendarProps> = ({
  targetDate,
  events,
  tasks = [],
  dailyEntries = [],
  allCategories = [],
  onDayClick,
  onSelectEvent,
  onSelectTask,
  onToggleTask,
  onMoodChange,
}) => {
  const {
    year,
    monthIndex,
    todayStr,
    firstDayIndex,
    daysInMonth,
    totalGridCells,
    moodsByDate,
    tasksByDate,
    eventsByDate,
    selectedDateForPopup,
    setSelectedDateForPopup,
    handleOpenDay,
    handleTogglePopup,
    popupDayEvents,
    popupDayTasks,
    popupDayMood,
    formattedPopupDate,
  } = useMobileMonthCalendarLogic({
    targetDate,
    events,
    tasks,
    dailyEntries,
    allCategories,
    onDayClick,
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 overflow-hidden select-none relative">
      {/* HEADER DEI 7 GIORNI (LUN - DOM) */}
      <div className="grid grid-cols-7 gap-1 pb-1 border-b border-gray-100 shrink-0 text-center items-center">
        {DAY_NAMES.map((dayName, i) => (
          <div
            key={`header-${i}`}
            className="text-[10px] font-black text-gray-500 uppercase tracking-wider py-0.5"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* CORPO GRIGLIA MENSILE ZERO-SCROLL */}
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 pt-1 auto-rows-fr">
        {/* Celle vuote inizio mese */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div
            key={`empty-start-${i}`}
            className="rounded-xl border border-transparent bg-gray-50/20 opacity-30 min-h-0"
          />
        ))}

        {/* Giorni del Mese Corrente */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateKey = `${year}-${pad(monthIndex + 1)}-${pad(dayNum)}`;
          const isToday = dateKey === todayStr;
          const isSelected = selectedDateForPopup === dateKey;

          return (
            <MobileMonthDayCell
              key={dateKey}
              dayNum={dayNum}
              dateKey={dateKey}
              isToday={isToday}
              isSelected={isSelected}
              dayEvents={eventsByDate[dateKey] || []}
              dayTasks={tasksByDate[dateKey] || []}
              mood={moodsByDate[dateKey]}
              onOpenDay={handleOpenDay}
              onTogglePopup={handleTogglePopup}
            />
          );
        })}

        {/* Celle vuote fine mese */}
        {Array.from({ length: totalGridCells - (firstDayIndex + daysInMonth) }).map((_, i) => (
          <div
            key={`empty-end-${i}`}
            className="rounded-xl border border-transparent bg-gray-50/20 opacity-30 min-h-0"
          />
        ))}
      </div>

      {/* NUVOLETTA DETTAGLI GIORNO */}
      <MobileMonthDayPopup
        isOpen={Boolean(selectedDateForPopup)}
        dateStr={selectedDateForPopup || ''}
        formattedDate={formattedPopupDate}
        mood={popupDayMood}
        events={popupDayEvents}
        tasks={popupDayTasks}
        allCategories={allCategories}
        onClose={() => setSelectedDateForPopup(null)}
        onSelectEvent={onSelectEvent}
        onSelectTask={onSelectTask}
        onToggleTask={onToggleTask}
        onMoodChange={onMoodChange}
      />
    </div>
  );
};

export default MobileMonthCalendar;
