import React from 'react';
import { DayCellPostersGrid } from './DayCellPostersGrid';

export interface CalendarGridDayData {
  dayNumber: number;
  dateStr: string;
  hasWatches: boolean;
  itemCount: number;
  posters?: (string | null | undefined)[];
  bottomTitle?: string | null;
}

export interface MediaStatsCalendarGridProps {
  weeks: (number | null)[][];
  currentMonthDaysMap: Record<number, CalendarGridDayData>;
  isCurrentMonth: boolean;
  todayDayNumber: number;
  countUnitShort?: string;
  onSelectDay: (dayData: CalendarGridDayData) => void;
  className?: string;
}

export const MediaStatsCalendarGrid: React.FC<MediaStatsCalendarGridProps> = ({
  weeks,
  currentMonthDaysMap,
  isCurrentMonth,
  todayDayNumber,
  countUnitShort = '',
  onSelectDay,
  className = '',
}) => {
  return (
    <div
      className={`flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex flex-col overflow-hidden ${className}`}
    >
      {/* Intestazione Giorni Settimana */}
      <div className="grid grid-cols-7 gap-1.5 pb-1 border-b border-slate-100 text-center shrink-0">
        {[
          'Lunedì',
          'Martedì',
          'Mercoledì',
          'Giovedì',
          'Venerdì',
          'Sabato',
          'Domenica',
        ].map((d) => (
          <div
            key={d}
            className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Griglia Settimane / Giorni */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-0 pt-1.5 auto-rows-fr h-full">
        {weeks.map((week, wIdx) => (
          <React.Fragment key={`week-${wIdx}`}>
            {week.map((day, dIdx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${wIdx}-${dIdx}`}
                    className="bg-slate-50/30 border border-dashed border-slate-200/60 rounded-xl min-h-[64px] sm:min-h-[80px]"
                  />
                );
              }

              const isToday = isCurrentMonth && day === todayDayNumber;
              const dayData = currentMonthDaysMap[day];
              const hasWatches = Boolean(dayData && dayData.hasWatches);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => {
                    if (hasWatches && dayData) {
                      onSelectDay(dayData);
                    }
                  }}
                  className={`relative rounded-xl border transition-all flex flex-col overflow-hidden select-none min-h-[64px] sm:min-h-[80px] h-full ${
                    hasWatches
                      ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] border-slate-300'
                      : 'border-slate-200/70 bg-white hover:bg-slate-50/60'
                  } ${isToday ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                >
                  {/* Poster di sfondo se presenti */}
                  {hasWatches && dayData?.posters && dayData.posters.length > 0 && (
                    <DayCellPostersGrid posters={dayData.posters} />
                  )}

                  {/* Header Giorno: Numero & Badge */}
                  <div className="relative z-10 flex items-center justify-between p-1.5">
                    <span
                      className={`text-xs leading-none px-1.5 py-0.5 rounded-md ${
                        hasWatches
                          ? 'bg-black/60 text-white backdrop-blur-xs font-black'
                          : isToday
                          ? 'bg-blue-500 text-white font-extrabold shadow-xs'
                          : 'text-slate-700 font-bold'
                      }`}
                    >
                      {day}
                    </span>

                    {hasWatches && dayData && dayData.itemCount > 1 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                        {dayData.itemCount} {countUnitShort}
                      </span>
                    )}
                  </div>

                  {/* Footer Giorno: Titolo compatto in basso */}
                  {hasWatches && dayData?.bottomTitle && (
                    <div className="relative z-10 mt-auto p-1.5">
                      <p className="text-[10px] font-extrabold text-white truncate drop-shadow-md leading-tight">
                        {dayData.bottomTitle}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MediaStatsCalendarGrid;
