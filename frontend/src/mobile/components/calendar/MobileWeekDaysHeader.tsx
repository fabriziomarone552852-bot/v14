// src/mobile/components/calendar/MobileWeekDaysHeader.tsx
import React from 'react';
import type { ComputedDayData } from '@/utils/calendarLayoutUtils';

interface MobileWeekDaysHeaderProps {
  computedWeekData: ComputedDayData[];
  todayStr: string;
  onDayClick: (dateStr: string) => void;
}

export const MobileWeekDaysHeader: React.FC<MobileWeekDaysHeaderProps> = ({
  computedWeekData,
  todayStr,
  onDayClick,
}) => {
  return (
    <div className="grid grid-cols-[18px_repeat(7,_1fr)] gap-1 pb-1.5 border-b border-gray-100 shrink-0 items-center text-center">
      {/* Spazio allineamento asse orario */}
      <div className="text-[9px] font-bold text-gray-400">h</div>

      {computedWeekData.map(({ day }) => {
        const isToday = day.dateStr === todayStr;
        return (
          <button
            key={day.dateStr}
            type="button"
            onClick={() => onDayClick(day.dateStr)}
            className={`flex flex-col items-center justify-center py-0.5 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isToday
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={`Vai a ${day.nameShort} ${day.dayNum}`}
          >
            <span
              className={`text-[9px] font-bold leading-none ${
                isToday ? 'text-amber-100' : 'text-gray-400'
              }`}
            >
              {day.nameShort}
            </span>
            <span
              className={`text-xs font-black leading-tight mt-0.5 ${
                isToday ? 'text-white font-black' : 'text-gray-800'
              }`}
            >
              {day.dayNum}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileWeekDaysHeader;
