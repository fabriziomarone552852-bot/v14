import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { nomiMesiLungo, getDaysInMonth, getFirstDayIndex, formatToItalianShortDate, generateWeeksGrid } from '@/utils/dateUtils';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { CalendarIcon, BackIcon, ForwardIcon } from '../Icons';
import { DatePickerMonthGrid } from './DatePickerMonthGrid';
import { DatePickerDayGrid } from './DatePickerDayGrid';
import { DatePickerYearGrid } from './DatePickerYearGrid';

interface DatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (newDate: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  placeholder?: string;
  align?: 'left' | 'right' | 'center';
  customTrigger?: React.ReactNode; 
  selectionMode?: 'day' | 'week' | 'month' | 'year';
  usePortal?: boolean;
}

const get9YearRangeStart = (y: number): number => {
  return 2000 + Math.floor((y - 2000) / 9) * 9;
};

const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange, 
  isOpen, 
  onClose, 
  onToggle, 
  placeholder = 'Seleziona data', 
  align = 'left',
  customTrigger,
  selectionMode = 'day',
  usePortal = false,
}) => {
  const [pickerMonthDate, setPickerMonthDate] = useState<Date>(new Date());
  const [yearRangeStart, setYearRangeStart] = useState<number>(() => get9YearRangeStart(new Date().getFullYear()));

  const popupRef = useRef<HTMLDivElement>(null);

  const wrapperRef = useOutsideClick<HTMLDivElement>((e: MouseEvent | TouchEvent) => {
    if (usePortal && popupRef.current && popupRef.current.contains(e.target as Node)) {
      return;
    }
    if (isOpen) onClose();
  });

  const { openUpwards, coords: rawCoords } = useDropdownPosition(wrapperRef, { 
    isOpen, 
    threshold: 320 
  });

  const coords = React.useMemo(() => {
    let leftPos = rawCoords.left;
    if (align === 'center') {
      leftPos = rawCoords.left + rawCoords.width / 2 - 128;
    } else if (align === 'right') {
      leftPos = rawCoords.right - 256;
    }
    leftPos = Math.max(10, Math.min(leftPos, window.innerWidth - 266));

    return {
      top: rawCoords.top + 6,
      bottom: rawCoords.bottom + 6,
      left: leftPos,
    };
  }, [align, rawCoords]);

  useEffect(() => {
    if (isOpen) {
      if (value) {
        const [yyyy, mm, dd] = value.split('-');
        const yNum = Number(yyyy);
        setPickerMonthDate(new Date(yNum, Number(mm) - 1, Number(dd || 1)));
        setYearRangeStart(get9YearRangeStart(yNum));
      } else {
        const now = new Date();
        setPickerMonthDate(now);
        setYearRangeStart(get9YearRangeStart(now.getFullYear()));
      }
    }
  }, [isOpen, value]);

  const year = pickerMonthDate.getFullYear();
  const month = pickerMonthDate.getMonth();
  
  // Data di "oggi" per calcolare l'indicatore ambra "pieno"
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // --- LOGICA DI RAGGRUPPAMENTO PER SETTIMANE ---
  const firstDayIdx = getFirstDayIndex(year, month);
  const daysInMo = getDaysInMonth(year, month);
  const weeks = generateWeeksGrid(firstDayIdx, daysInMo);

  // Helper per la navigazione condizionale (Anno vs Mese vs Giorno)
  const handleBack = () => {
    if (selectionMode === 'year') {
      setYearRangeStart((prev) => prev - 9);
    } else if (selectionMode === 'month') {
      setPickerMonthDate(new Date(year - 1, month, 1));
    } else {
      setPickerMonthDate(new Date(year, month - 1, 1));
    }
  };

  const handleForward = () => {
    if (selectionMode === 'year') {
      setYearRangeStart((prev) => prev + 9);
    } else if (selectionMode === 'month') {
      setPickerMonthDate(new Date(year + 1, month, 1));
    } else {
      setPickerMonthDate(new Date(year, month + 1, 1));
    }
  };

  const popupContent = (
    <div 
      ref={popupRef}
      className={`${usePortal ? '' : 'absolute'} z-[100] bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-64 animate-fadeIn`}
      style={
        usePortal
          ? {
              position: 'fixed',
              top: openUpwards ? 'auto' : `${coords.top}px`,
              bottom: openUpwards ? `${coords.bottom}px` : 'auto',
              left: `${coords.left}px`,
              zIndex: 99999,
            }
          : {
              [openUpwards ? 'bottom' : 'top']: '100%',
              left: align === 'center' ? '50%' : align === 'right' ? undefined : 0,
              right: align === 'right' ? 0 : undefined,
              marginLeft: align === 'center' ? '-8rem' : undefined,
              marginTop: openUpwards ? undefined : '0.5rem',
              marginBottom: openUpwards ? '0.5rem' : undefined,
            }
      }
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <button type="button" onClick={handleBack} className="text-gray-400 hover:text-gray-800 transition-colors focus:outline-none">
          <BackIcon className="w-4 h-4" />
        </button>
        <span className="font-bold text-gray-800 text-sm">
          {selectionMode === 'year'
            ? `${yearRangeStart} - ${yearRangeStart + 8}`
            : selectionMode === 'month'
            ? year
            : `${nomiMesiLungo[month]} ${year}`}
        </span>
        <button type="button" onClick={handleForward} className="text-gray-400 hover:text-gray-800 transition-colors focus:outline-none">
          <ForwardIcon className="w-4 h-4" />
        </button>
      </div>
      
      {selectionMode === 'year' ? (
        <DatePickerYearGrid
          startYear={yearRangeStart}
          selectedYear={year}
          currentYear={currentYear}
          onChange={onChange}
          onClose={onClose}
        />
      ) : selectionMode === 'month' ? (
        // GRIGLIA MENSILE
        <DatePickerMonthGrid 
          year={year} 
          currentYear={currentYear} 
          currentMonth={currentMonth} 
          value={value} 
          onChange={onChange} 
          onClose={onClose} 
        />
      ) : (
        // GRIGLIA GIORNI / SETTIMANE
        <DatePickerDayGrid 
          weeks={weeks}
          year={year}
          month={month}
          currentYear={currentYear}
          currentMonth={currentMonth}
          currentDay={currentDay}
          value={value}
          selectionMode={selectionMode}
          onChange={onChange}
          onClose={onClose}
        />
      )}
    </div>
  );

  return (
    <div className="relative flex justify-center w-full" ref={wrapperRef}>
      
      {customTrigger ? (
        <div 
          onClick={(e: React.MouseEvent<HTMLDivElement>) => { e.stopPropagation(); onToggle(); }} 
          className="cursor-pointer inline-flex items-center justify-center w-full"
        >
          {customTrigger}
        </div>
      ) : (
        <div 
          onClick={(e: React.MouseEvent<HTMLDivElement>) => { e.stopPropagation(); onToggle(); }} 
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-sm"
        >
          <span className={value ? 'text-gray-700 font-medium' : 'text-gray-400 font-medium'}>
            {value ? formatToItalianShortDate(value) : placeholder}
          </span>
          <CalendarIcon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      
      {isOpen && (usePortal ? createPortal(popupContent, document.body) : popupContent)}
    </div>
  );
};

export { DatePicker };
export default DatePicker;