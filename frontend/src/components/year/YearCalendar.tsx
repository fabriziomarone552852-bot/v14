// frontend/src/components/year/YearCalendar.tsx
import React, { useState } from 'react';
import { getDaysInMonth, getFirstDayIndex, generateWeeksGrid, pad } from '@/utils/dateUtils';
import type { DbEvent } from '@/types/events';
import type { DbTask } from '@/types/tasks';
import { CalendarIcon, TaskListIcon } from '@/components/shared/utils/Icons';

interface YearCalendarProps {
  year: number;
  events?: DbEvent[];
  tasks?: DbTask[];
  taskDays?: Set<string>;
  eventDays?: Set<string>;
  highlightedDays?: Set<string>;
  onDayClick: (dateStr: string) => void;
  onMonthClick: (year: number, monthIndex: number) => void;
}

const MESI = [
  'GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE',
  'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO',
  'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'
];

export const YearCalendar: React.FC<YearCalendarProps> = ({
  year,
  events = [],
  tasks = [],
  taskDays,
  eventDays,
  highlightedDays,
  onDayClick,
  onMonthClick,
}) => {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const oggi = new Date();

  const isOggi = (m: number, d: number) => {
    return year === oggi.getFullYear() && m === oggi.getMonth() && d === oggi.getDate();
  };

  const handleDayClick = (m: number, d: number) => {
    const dateStr = `${year}-${pad(m + 1)}-${pad(d)}`;
    onDayClick(dateStr);
  };

  // Helper per estrarre eventi e task di una specifica data per il Popover in Hover
  const getDayDetails = (dateStr: string) => {
    const dayEvents = events.filter(e => {
      const startStr = (e.data_inizio || e.start_date || e.date || '').split('T')[0];
      const endStr = (e.data_fine || e.end_date || startStr).split('T')[0];
      return dateStr >= startStr && dateStr <= endStr;
    });

    const dayTasks = tasks.filter(t => {
      const dueStr = (t.deadline || t.data_scadenza || t.due_date || t.date || '').split('T')[0];
      return dueStr === dateStr;
    });

    return { dayEvents, dayTasks };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full flex flex-col min-h-0 relative">
      <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
        {MESI.map((mese, mIndex) => {
          const daysInMo = getDaysInMonth(year, mIndex);
          const firstDayIdx = getFirstDayIndex(year, mIndex);
          const weeks = generateWeeksGrid(firstDayIdx, daysInMo);

          return (
            <div key={mese} className="flex flex-col justify-between bg-gray-50/50 rounded-xl p-2 border border-gray-100 min-h-0 group">
              <h3 
                onClick={() => onMonthClick(year, mIndex)}
                className="text-[10px] xl:text-xs font-extrabold text-gray-700 uppercase tracking-wider text-center border-b border-gray-200/60 pb-1 mb-1 shrink-0 cursor-pointer hover:text-blue-600 hover:border-blue-300 transition-colors"
                title={`Vai a ${mese} ${year}`}
              >
                {mese}
              </h3>
              <div className="flex-1 flex flex-col justify-around min-h-0">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="grid grid-cols-7 gap-0.5 items-center justify-items-center">
                    {week.map((day, dIndex) => {
                      if (!day) return <div key={dIndex} className="w-5 h-5" />;
                      
                      const dateStr = `${year}-${pad(mIndex + 1)}-${pad(day)}`;
                      const today = isOggi(mIndex, day);
                      const hasEvent = eventDays?.has(dateStr);
                      const hasTask = taskDays?.has(dateStr);
                      
                      let dayClass = "w-5 h-5 max-w-full aspect-square flex items-center justify-center text-[10px] xl:text-xs font-medium rounded-full cursor-pointer transition-all relative ";
                      
                      if (today) {
                        // Giorno corrente -> Cerchio giallo pieno
                        dayClass += "bg-amber-500 text-white font-black hover:bg-amber-600 shadow-sm";
                      } else if (hasEvent) {
                        // Eventi (anche con task): Precedenza agli Eventi -> Cerchio blu pieno
                        dayClass += "bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-sm";
                      } else if (hasTask) {
                        // Solo Task (senza eventi) -> Bordo spesso blu attorno al giorno
                        dayClass += "border-2 border-blue-500 text-blue-700 font-extrabold bg-white hover:bg-blue-50 shadow-xs";
                      } else {
                        dayClass += "text-gray-700 hover:bg-gray-200/60";
                      }

                      const isHovered = hoveredDay === dateStr && (hasEvent || hasTask);
                      const details = isHovered ? getDayDetails(dateStr) : null;

                      return (
                        <div
                          key={dIndex}
                          className={dayClass}
                          onClick={() => handleDayClick(mIndex, day)}
                          onMouseEnter={() => setHoveredDay(dateStr)}
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          <span>{day}</span>

                          {/* POPOVER HOVER: mostra eventi e task del giorno in hover */}
                          {isHovered && details && (details.dayEvents.length > 0 || details.dayTasks.length > 0) && (
                            <div className={`absolute bottom-full mb-2 bg-slate-900 text-white rounded-xl shadow-xl p-3 border border-slate-800 text-xs z-[100] w-64 animate-fadeIn pointer-events-none ${
                              mIndex % 4 === 3 || dIndex >= 5 
                                ? 'right-0 left-auto translate-x-0' 
                                : mIndex % 4 === 0 && dIndex <= 1 
                                ? 'left-0 right-auto translate-x-0' 
                                : 'left-1/2 -translate-x-1/2'
                            }`}>
                              <div className="font-extrabold text-[11px] text-blue-300 uppercase tracking-wider border-b border-slate-700 pb-1 mb-2">
                                {day} {mese} {year}
                              </div>

                              {details.dayEvents.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3 text-blue-400" /> Eventi
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {details.dayEvents.map(e => (
                                      <div key={e.id} className="bg-slate-800/80 rounded px-2 py-1 text-[11px] font-medium text-slate-200 truncate border-l-2 border-blue-500">
                                        {e.titolo || e.title}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {details.dayTasks.length > 0 && (
                                <div>
                                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                    <TaskListIcon className="w-3 h-3 text-emerald-400" /> Task in Scadenza
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {details.dayTasks.map(t => (
                                      <div key={t.id} className="bg-slate-800/80 rounded px-2 py-1 text-[11px] font-medium text-slate-200 truncate flex items-center justify-between border-l-2 border-emerald-500">
                                        <span className={t.fatto ? 'line-through text-slate-500' : ''}>
                                          {t.titolo || t.title}
                                        </span>
                                        {t.fatto && <span className="text-[9px] text-emerald-400 font-bold ml-1">✓ Fatto</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearCalendar;
