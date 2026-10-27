import React, { useState } from 'react';
import { BackIcon, ForwardIcon } from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';

export interface MediaCalendarHeaderProps {
  year: number;
  month: number;
  monthName: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onDateChange: (dateStr: string) => void;
  isCurrentMonth: boolean;
  todayLabel?: string;
  rightBadges?: React.ReactNode;
  className?: string;
}

export const MediaCalendarHeader: React.FC<MediaCalendarHeaderProps> = ({
  year,
  month,
  monthName,
  onPrevMonth,
  onNextMonth,
  onToday,
  onDateChange,
  isCurrentMonth,
  todayLabel = 'Mese Corrente',
  rightBadges,
  className = '',
}) => {
  const [isSelectingDate, setIsSelectingDate] = useState<boolean>(false);
  const currentValueForPicker = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0 ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm bg-white cursor-pointer active:scale-95"
          title="Mese precedente"
          aria-label="Mese precedente"
        >
          <BackIcon className="h-4 w-4" />
        </button>

        <div className="relative flex justify-center items-center select-none">
          <DatePicker
            value={currentValueForPicker}
            onChange={onDateChange}
            isOpen={isSelectingDate}
            onClose={() => setIsSelectingDate(false)}
            onToggle={() => setIsSelectingDate(!isSelectingDate)}
            align="center"
            selectionMode="month"
            overlay={false}
            usePortal={true}
            customTrigger={
              <button
                type="button"
                className="flex gap-1.5 items-baseline cursor-pointer px-2 sm:px-3 py-1 rounded-md transition-colors hover:bg-gray-50 group"
              >
                <h3 className="text-base sm:text-xl font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors capitalize">
                  {monthName}
                </h3>
                <span className="text-xs sm:text-sm font-bold text-gray-400">
                  {year}
                </span>
              </button>
            }
          />
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm bg-white cursor-pointer active:scale-95"
          title="Mese successivo"
          aria-label="Mese successivo"
        >
          <ForwardIcon className="h-4 w-4" />
        </button>

        {!isCurrentMonth && (
          <button
            type="button"
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-xs active:scale-95 cursor-pointer ml-1"
          >
            {todayLabel}
          </button>
        )}
      </div>

      {rightBadges && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar">
          {rightBadges}
        </div>
      )}
    </div>
  );
};

export default MediaCalendarHeader;
