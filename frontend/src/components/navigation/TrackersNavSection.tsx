import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FreeTimeIcon,
  FilmIcon,
  TvIcon,
  BookIcon,
} from '@/components/shared/utils/Icons';
import { SubmenuItem } from './SubmenuItem';

interface TrackersNavSectionProps {
  isSidebarOpen: boolean;
  getNavLinkClass: (active: boolean) => string;
}

export const TrackersNavSection: React.FC<TrackersNavSectionProps> = ({
  isSidebarOpen,
  getNavLinkClass,
}) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isTrackersActive = location.pathname.startsWith('/trackers');

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col mt-1"
    >
      <Link
        to="/trackers"
        className={getNavLinkClass(isTrackersActive)}
        title={!isSidebarOpen ? 'Trackers' : undefined}
      >
        <FreeTimeIcon className="w-6 h-6 shrink-0" />
        {isSidebarOpen && <span className="font-semibold tracking-wide">Trackers</span>}
      </Link>

      {(isTrackersActive || isHovered) && (
        <div
          className={`flex flex-col mt-1 mb-2 animate-fadeIn ${
            isSidebarOpen ? 'pl-6 pr-2 space-y-1' : 'items-center space-y-2 mt-2'
          }`}
        >
          <SubmenuItem
            to="/trackers/film"
            label="Film"
            icon={<FilmIcon className="w-4 h-4 shrink-0" />}
            isActive={isActive('/trackers/film')}
            isSidebarOpen={isSidebarOpen}
          />
          <SubmenuItem
            to="/trackers/serie-tv"
            label="Serie TV"
            icon={<TvIcon className="w-4 h-4 shrink-0" />}
            isActive={isActive('/trackers/serie-tv')}
            isSidebarOpen={isSidebarOpen}
          />
          <SubmenuItem
            to="/trackers/libri"
            label="Libri"
            icon={<BookIcon className="w-4 h-4 shrink-0" />}
            isActive={isActive('/trackers/libri')}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
      )}
    </div>
  );
};
