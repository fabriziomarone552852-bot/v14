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
  const activeIndex = isDay ? 0 : isWeek ? 1 : isMonth ? 2 : isYear ? 3 : -1;

  return (
    <div className="relative grid grid-cols-4 items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 shadow-inner select-none">
      {/* Livello base: icone scure sempre visibili sulla traccia grigia */}
      <Link
        to="/giorno"
        title="Vista Giorno"
        aria-current={isDay ? 'page' : undefined}
        className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        <CalendarDayIcon className="w-5 h-5" />
      </Link>

      <Link
        to="/settimana"
        title="Vista Settimana"
        aria-current={isWeek ? 'page' : undefined}
        className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        <CalendarWeekIcon className="w-5 h-5" />
      </Link>

      <Link
        to="/mese"
        title="Vista Mese"
        aria-current={isMonth ? 'page' : undefined}
        className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        <CalendarMonthIcon className="w-5 h-5" />
      </Link>

      <Link
        to="/anno"
        title="Vista Anno"
        aria-current={isYear ? 'page' : undefined}
        className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        <CalendarYearIcon className="w-5 h-5" />
      </Link>

      {/* Pillola blu scorrevole con maschera interna per icone bianche (zero lag di colore) */}
      {activeIndex >= 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1 bottom-1 left-1 z-20 w-8 h-8 rounded-lg bg-blue-600 shadow-xs overflow-hidden transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{
            transform: `translate3d(${activeIndex * 2}rem, 0, 0)`,
          }}
        >
          <div
            className="grid grid-cols-4 w-32 h-8 text-white transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
            style={{
              transform: `translate3d(-${activeIndex * 2}rem, 0, 0)`,
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <CalendarDayIcon className="w-5 h-5" />
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <CalendarWeekIcon className="w-5 h-5" />
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <CalendarMonthIcon className="w-5 h-5" />
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <CalendarYearIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHeaderPeriodSwitcher;
