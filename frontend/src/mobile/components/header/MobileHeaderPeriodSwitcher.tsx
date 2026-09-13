// src/mobile/components/header/MobileHeaderPeriodSwitcher.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDayIcon,
  CalendarWeekIcon,
  CalendarMonthIcon,
  CalendarYearIcon,
} from '@/components/shared/utils/Icons';

interface MobileHeaderPeriodSwitcherProps {
  isDay: boolean;
  isWeek: boolean;
  isMonth: boolean;
  isYear: boolean;
}

export const MobileHeaderPeriodSwitcher: React.FC<MobileHeaderPeriodSwitcherProps> = ({
  isDay,
  isWeek,
  isMonth,
  isYear,
}) => {
  return (
    <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 gap-0.5 shadow-inner">
      {/* GIORNO */}
      <Link
        to="/giorno"
        title="Vista Giorno"
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isDay
            ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        <CalendarDayIcon className="w-5 h-5" />
      </Link>

      {/* SETTIMANA */}
      <Link
        to="/settimana"
        title="Vista Settimana"
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isWeek
            ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        <CalendarWeekIcon className="w-5 h-5" />
      </Link>

      {/* MESE */}
      <Link
        to="/mese"
        title="Vista Mese"
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isMonth
            ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        <CalendarMonthIcon className="w-5 h-5" />
      </Link>

      {/* ANNO */}
      <Link
        to="/anno"
        title="Vista Anno"
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isYear
            ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        <CalendarYearIcon className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default MobileHeaderPeriodSwitcher;
