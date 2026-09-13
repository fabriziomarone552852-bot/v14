// src/mobile/components/drawer/MobileDrawerNavLinks.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CountdownIcon,
  CalendarDayIcon,
  CalendarWeekIcon,
  CalendarMonthIcon,
  CalendarYearIcon,
  FreeTimeIcon,
  UniversityIcon,
  ShoppingIcon,
} from '@/components/shared/utils/Icons';

export const getMainLinkClasses = (active: boolean): string => {
  const base = 'flex items-center transition-all duration-200 rounded-xl focus:outline-none cursor-pointer px-4 py-3 gap-4 mx-2 justify-start';
  const colors = active
    ? 'bg-blue-600 text-white shadow-md font-semibold'
    : 'text-gray-400 hover:bg-gray-700 hover:text-white font-medium';
  return `${base} ${colors}`;
};

export const getSubLinkClasses = (active: boolean): string => {
  const base = 'flex items-center gap-3 rounded-lg transition-colors focus:outline-none py-1.5 px-3 text-sm';
  const colors = active
    ? 'bg-gray-700 text-white font-bold'
    : 'text-gray-400 hover:bg-gray-700 hover:text-white';
  return `${base} ${colors}`;
};

export interface MobileDrawerNavLinksProps {
  isAgendaActive: boolean;
  isActive: (path: string) => boolean;
  onClose: () => void;
  isSuperuser?: boolean;
}

export const MobileDrawerNavLinks: React.FC<MobileDrawerNavLinksProps> = ({
  isAgendaActive,
  isActive,
  onClose,
  isSuperuser,
}) => {
  return (
    <nav className="flex-1 overflow-y-auto px-1 py-4 space-y-1 custom-scrollbar">
      {/* Sezione: Agenda */}
      <div className="flex flex-col">
        <Link
          to="/"
          onClick={onClose}
          className={getMainLinkClasses(isAgendaActive && isActive('/'))}
        >
          <CountdownIcon className="w-6 h-6 shrink-0" />
          <span className="font-semibold tracking-wide text-sm">Agenda</span>
        </Link>

        {/* Sottomenu Viste Agenda */}
        {isAgendaActive && (
          <div className="flex flex-col mt-1 mb-2 animate-fadeIn pl-6 pr-2 space-y-1">
            <Link
              to="/giorno"
              onClick={onClose}
              className={getSubLinkClasses(isActive('/giorno'))}
            >
              <CalendarDayIcon className="w-4 h-4 shrink-0" />
              <span className="text-sm">Giorno</span>
            </Link>

            <Link
              to="/settimana"
              onClick={onClose}
              className={getSubLinkClasses(isActive('/settimana'))}
            >
              <CalendarWeekIcon className="w-4 h-4 shrink-0" />
              <span className="text-sm">Settimana</span>
            </Link>

            <Link
              to="/mese"
              onClick={onClose}
              className={getSubLinkClasses(isActive('/mese'))}
            >
              <CalendarMonthIcon className="w-4 h-4 shrink-0" />
              <span className="text-sm">Mese</span>
            </Link>

            <Link
              to="/anno"
              onClick={onClose}
              className={getSubLinkClasses(isActive('/anno'))}
            >
              <CalendarYearIcon className="w-4 h-4 shrink-0" />
              <span className="text-sm">Anno</span>
            </Link>
          </div>
        )}
      </div>

      {/* Voci Principali: Free Time, Università, Shopping */}
      <Link
        to="/free-time"
        onClick={onClose}
        className={getMainLinkClasses(isActive('/free-time'))}
      >
        <FreeTimeIcon className="w-6 h-6 shrink-0" />
        <span className="font-semibold tracking-wide text-sm">Free Time</span>
      </Link>

      <Link
        to="/universita"
        onClick={onClose}
        className={getMainLinkClasses(isActive('/universita'))}
      >
        <UniversityIcon className="w-6 h-6 shrink-0" />
        <span className="font-semibold tracking-wide text-sm">Università</span>
      </Link>

      <Link
        to="/shopping"
        onClick={onClose}
        className={getMainLinkClasses(isActive('/shopping'))}
      >
        <ShoppingIcon className="w-6 h-6 shrink-0" />
        <span className="font-semibold tracking-wide text-sm">Shopping</span>
      </Link>

      {/* Superuser Section (se admin) */}
      {isSuperuser && (
        <div className="pt-3 mt-1 border-t border-gray-800 flex flex-col gap-1">
          <p className="px-6 text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1">
            Pannello SU
          </p>
          <Link
            to="/admin"
            onClick={onClose}
            className={getMainLinkClasses(isActive('/admin'))}
          >
            <span className="text-base leading-none">🛡️</span>
            <span className="font-semibold tracking-wide text-sm">Amministrazione SU</span>
          </Link>
        </div>
      )}
    </nav>
  );
};
