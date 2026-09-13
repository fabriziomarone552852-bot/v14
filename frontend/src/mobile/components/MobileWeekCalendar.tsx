// src/mobile/components/MobileWeekCalendar.tsx
import React from 'react';
import type { CalendarEvent, DbTask } from '@/types';
import { useMobileWeekCalendarLogic } from '@/mobile/hooks/useMobileWeekCalendarLogic';
import { MobileWeekDaysHeader } from './calendar/MobileWeekDaysHeader';
import { MobileWeekDayColumn } from './calendar/MobileWeekDayColumn';
import { MobileWeekEventPopup } from './calendar/MobileWeekEventPopup';

interface MobileWeekCalendarProps {
  monday: Date;
  events: CalendarEvent[];
  tasks?: DbTask[];
  onDayClick: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTask?: (task: DbTask) => void;
  onOpenExpandedTasks?: (dateStr: string, dayTasks: DbTask[]) => void;
}

export const MobileWeekCalendar: React.FC<MobileWeekCalendarProps> = ({
  monday,
  events,
  tasks = [],
  onDayClick,
  onSelectEvent,
  onSelectTask,
  onOpenExpandedTasks,
}) => {
  const {
    todayStr,
    computedWeekData,
    selectedEventForPopup,
    popupPosition,
    handleEventClick,
    closePopup,
  } = useMobileWeekCalendarLogic({
    monday,
    events,
    tasks,
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 overflow-hidden select-none relative">
      {/* 1. HEADER DEI GIORNI (LUN - DOM) CON GRIGLIA A 8 COLONNE (Ora + 7 Giorni) */}
      <MobileWeekDaysHeader
        computedWeekData={computedWeekData}
        todayStr={todayStr}
        onDayClick={onDayClick}
      />

      {/* 2. CORPO DELLA GRIGLIA ORARIA COMPRESSA ZERO-SCROLL (00:00 -> 24:00) */}
      <div className="grid grid-cols-[18px_repeat(7,_1fr)] gap-1 flex-1 min-h-0 pt-1 relative overflow-hidden">
        {/* COLONNA MARCATRICI ORARIE (6 a 25%, 12 a 50%, 18 a 75%) */}
        <div className="relative h-full border-r border-gray-100/60 pointer-events-none select-none">
          <span className="absolute top-[25%] -translate-y-1/2 left-0 right-1 text-[9px] font-bold text-gray-400 text-right leading-none">
            6
          </span>
          <span className="absolute top-[50%] -translate-y-1/2 left-0 right-1 text-[9px] font-bold text-gray-400 text-right leading-none">
            12
          </span>
          <span className="absolute top-[75%] -translate-y-1/2 left-0 right-1 text-[9px] font-bold text-gray-400 text-right leading-none">
            18
          </span>
        </div>

        {/* 7 COLONNE GIORNALIERE */}
        {computedWeekData.map((dayData) => (
          <MobileWeekDayColumn
            key={dayData.day.dateStr}
            dayData={dayData}
            isToday={dayData.day.dateStr === todayStr}
            onDayClick={onDayClick}
            onEventClick={handleEventClick}
            onSelectTask={onSelectTask}
            onOpenExpandedTasks={onOpenExpandedTasks}
          />
        ))}
      </div>

      {/* 3. NUVOLETTA / OVERLAY DETTAGLI RAPIDI EVENTO (Al 1° Click) */}
      {selectedEventForPopup && popupPosition && (
        <MobileWeekEventPopup
          selectedEvent={selectedEventForPopup}
          popupPosition={popupPosition}
          onClose={closePopup}
          onSelectEvent={onSelectEvent}
        />
      )}
    </div>
  );
};

export default MobileWeekCalendar;
