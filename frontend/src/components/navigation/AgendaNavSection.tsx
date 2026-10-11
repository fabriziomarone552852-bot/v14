import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CountdownIcon,
  CalendarDayIcon,
  CalendarWeekIcon,
  CalendarMonthIcon,
  CalendarYearIcon,
} from '@/components/shared/utils/Icons';
import { SubmenuItem } from './SubmenuItem';

interface AgendaNavSectionProps {
  isSidebarOpen: boolean;
  getNavLinkClass: (active: boolean) => string;
}

export const AgendaNavSection: React.FC<AgendaNavSectionProps> = ({
  isSidebarOpen,
  getNavLinkClass,
}) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isAgendaActive =
    isActive('/') ||
    isActive('/giorno') ||
    isActive('/settimana') ||
    isActive('/mese') ||
    isActive('/anno');

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col"
    >
      <Link
        to="/"
        className={getNavLinkClass(isAgendaActive)}
        title={!isSidebarOpen ? 'Agenda' : undefined}
      >
        <CountdownIcon className="w-6 h-6 shrink-0" />
        {isSidebarOpen && <span className="font-semibold tracking-wide">Agenda</span>}
      </Link>

      {(isAgendaActive || isHovered) && (
        <div
          className={`flex flex-col mt-1 mb-2 animate-fadeIn ${
            isSidebarOpen ? 'pl-6 pr-2 space-y-1' : 'items-center space-y-2 mt-2'
          }`}
        >
          <SubmenuItem
            to="/giorno"
            label="Giorno"
            icon={<CalendarDayIcon className="w-4 h-4 shrink-0" />}
            isActive={isActive('/giorno')}
            isSidebarOpen={isSidebarOpen}
          />
          <SubmenuItem
            to="/settimana"
            label="Settimana"
            icon={<CalendarWeekIcon className="w-4 h-4 shrink-0" />}
            isActive={isActive('/settimana')}
            isSidebarOpen={isSidebarOpen}
          />
          <SubmenuItem
            to="/mese"
            label="Mese"
            icon={<CalendarMonthIcon className="w-4 h-4 shrink-0" />}
            isActive={isActive('/mese')}
            isSidebarOpen={isSidebarOpen}
          />
          <SubmenuItem
            to="/anno"
            label="Anno"
            icon={<CalendarYearIcon className="w-4 h-4 shrink-0" />}
            isActive={isActive('/anno')}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
      )}
    </div>
  );
};
