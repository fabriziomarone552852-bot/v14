// src/mobile/components/MobileYearCalendar.tsx
import React, { useMemo } from 'react';
import { getDaysInMonth, getFirstDayIndex, generateWeeksGrid, pad } from '@/utils/dateUtils';
import type { DbEvent } from '@/types/events';
import type { DbTask } from '@/types/tasks';

interface MobileYearCalendarProps {
  year: number;
  events?: DbEvent[];
  tasks?: DbTask[];
  taskDays?: Set<string>;
  eventDays?: Set<string>;
  highlightedDays?: Set<string>;
  onMonthClick: (year: number, monthIndex: number) => void;
}

const MESI = [
  'GEN', 'FEB', 'MAR', 'APR',
  'MAG', 'GIU', 'LUG', 'AGO',
  'SET', 'OTT', 'NOV', 'DIC'
];

const MESI_COMPLETI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile',
  'Maggio', 'Giugno', 'Luglio', 'Agosto',
  'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export const MobileYearCalendar: React.FC<MobileYearCalendarProps> = ({
  year,
  taskDays,
  eventDays,
  onMonthClick,
}) => {
  const oggi = useMemo(() => new Date(), []);

  const isOggi = (m: number, d: number) => {
    return (
      year === oggi.getFullYear() &&
      m === oggi.getMonth() &&
      d === oggi.getDate()
    );
  };

  return (
    <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 flex flex-col overflow-hidden select-none">
      <div className="grid grid-cols-3 grid-rows-4 gap-1 flex-1 min-h-0">
        {MESI.map((mese, mIndex) => {
          const daysInMo = getDaysInMonth(year, mIndex);
          const firstDayIdx = getFirstDayIndex(year, mIndex);
          const weeks = generateWeeksGrid(firstDayIdx, daysInMo);

          return (
            <div
              key={mese}
              onClick={() => onMonthClick(year, mIndex)}
              className="flex flex-col justify-between bg-gray-50/70 hover:bg-blue-50/30 rounded-xl p-1 border border-gray-100/90 hover:border-blue-300 active:scale-[0.98] transition-all min-h-0 overflow-hidden cursor-pointer group shadow-2xs"
              title={`Vai a ${MESI_COMPLETI[mIndex]} ${year}`}
            >
              {/* Header Mese */}
              <div className="text-[9.5px] sm:text-[10.5px] font-black text-gray-700 uppercase tracking-wider text-center border-b border-gray-200/60 pb-0.5 shrink-0 group-hover:text-blue-600 transition-colors w-full truncate">
                {mese}
              </div>

              {/* Griglia Settimane e Giorni (Indicatori visivi non cliccabili singolarmente per evitare misclick) */}
              <div className="flex-1 flex flex-col justify-around min-h-0 pt-0.5 pointer-events-none">
                {weeks.map((week, wIndex) => (
                  <div
                    key={wIndex}
                    className="grid grid-cols-7 gap-0.5 items-center justify-items-center"
                  >
                    {week.map((day, dIndex) => {
                      if (!day) {
                        return <div key={dIndex} className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" />;
                      }

                      const dateStr = `${year}-${pad(mIndex + 1)}-${pad(day)}`;
                      const today = isOggi(mIndex, day);
                      const hasEvent = eventDays?.has(dateStr);
                      const hasTask = taskDays?.has(dateStr);

                      let dayClass =
                        'w-3.5 h-3.5 sm:w-4 sm:h-4 max-w-full aspect-square flex items-center justify-center text-[7.5px] sm:text-[9px] rounded-full leading-none ';

                      if (today) {
                        // Giorno corrente -> Cerchio giallo pieno
                        dayClass += 'bg-amber-500 text-white font-black shadow-2xs';
                      } else if (hasEvent) {
                        // Eventi -> Cerchio blu pieno
                        dayClass += 'bg-blue-500 text-white font-bold shadow-2xs';
                      } else if (hasTask) {
                        // Solo Task -> Bordo blu
                        dayClass += 'border border-blue-500 text-blue-700 font-black bg-white';
                      } else {
                        dayClass += 'text-gray-700 font-medium';
                      }

                      return (
                        <div
                          key={dIndex}
                          className={dayClass}
                        >
                          <span>{day}</span>
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

export default MobileYearCalendar;
