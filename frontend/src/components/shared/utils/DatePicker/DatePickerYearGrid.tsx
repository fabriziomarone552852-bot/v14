// frontend/src/components/shared/utils/DatePicker/DatePickerYearGrid.tsx
import React from 'react';

interface DatePickerYearGridProps {
  startYear: number;
  selectedYear: number;
  currentYear: number;
  onChange: (newDateStr: string) => void;
  onClose: () => void;
}

export const DatePickerYearGrid: React.FC<DatePickerYearGridProps> = ({
  startYear,
  selectedYear,
  currentYear,
  onChange,
  onClose,
}) => {
  const years = Array.from({ length: 9 }, (_, i) => startYear + i);

  return (
    <div className="grid grid-cols-3 gap-y-3 gap-x-2 mt-2 p-1">
      {years.map((yr) => {
        const isSelected = yr === selectedYear;
        const isTodayYear = yr === currentYear;

        return (
          <div key={yr} className="flex justify-center items-center">
            <button
              type="button"
              onClick={() => {
                onChange(`${yr}-01-01`);
                onClose();
              }}
              className={`w-12 h-12 flex justify-center items-center rounded-full text-xs font-bold transition-all focus:outline-none ${
                isSelected
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : isTodayYear
                  ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 font-extrabold hover:bg-amber-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {yr}
            </button>
          </div>
        );
      })}
    </div>
  );
};
