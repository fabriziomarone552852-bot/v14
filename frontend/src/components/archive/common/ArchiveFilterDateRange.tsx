// src/components/archive/common/ArchiveFilterDateRange.tsx
import React, { useState } from 'react';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { CalendarIcon, CloseIcon } from '@/components/shared/utils/Icons';

export interface ArchiveFilterDateRangeProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearDateRange: () => void;
  label?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

export const ArchiveFilterDateRange: React.FC<ArchiveFilterDateRangeProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearDateRange,
  label = 'Intervallo Date',
  startPlaceholder = 'Da (qualsiasi)',
  endPlaceholder = 'A (qualsiasi)',
}) => {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-gray-500 uppercase">
          {label}
        </label>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={onClearDateRange}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CloseIcon className="w-3 h-3" />
            <span>Azzera date</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <DatePicker
            value={startDate}
            onChange={(val) => {
              onStartDateChange(val);
              setIsStartDateOpen(false);
            }}
            isOpen={isStartDateOpen}
            onClose={() => setIsStartDateOpen(false)}
            onToggle={() => setIsStartDateOpen((prev) => !prev)}
            align="left"
            customTrigger={
              <div
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer ${
                  startDate
                    ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-gray-200 bg-white text-gray-400 font-normal hover:border-gray-300'
                }`}
              >
                <span className="truncate">
                  {startDate ? formatToItalianShortDate(startDate) : startPlaceholder}
                </span>
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </div>
            }
          />
        </div>

        <div className="relative">
          <DatePicker
            value={endDate}
            onChange={(val) => {
              onEndDateChange(val);
              setIsEndDateOpen(false);
            }}
            isOpen={isEndDateOpen}
            onClose={() => setIsEndDateOpen(false)}
            onToggle={() => setIsEndDateOpen((prev) => !prev)}
            align="right"
            customTrigger={
              <div
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer ${
                  endDate
                    ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-gray-200 bg-white text-gray-400 font-normal hover:border-gray-300'
                }`}
              >
                <span className="truncate">
                  {endDate ? formatToItalianShortDate(endDate) : endPlaceholder}
                </span>
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
