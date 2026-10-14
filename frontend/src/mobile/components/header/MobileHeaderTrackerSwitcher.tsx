// src/mobile/components/header/MobileHeaderTrackerSwitcher.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TvIcon, FilmIcon, BookIcon } from '@/components/shared/utils/Icons';

export const MobileHeaderTrackerSwitcher: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const isTV = path === '/trackers/serie-tv' || path === '/trackers';
  const isFilm = path === '/trackers/film';
  const isBooks = path === '/trackers/libri';

  return (
    <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 gap-0.5 shadow-inner">
      {/* SERIE TV */}
      <Link
        to="/trackers/serie-tv"
        title="Serie TV"
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isTV
            ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        <TvIcon className="w-5 h-5" />
      </Link>

      {/* FILM */}
      <Link
        to="/trackers/film"
        title="Film"
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isFilm
            ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        <FilmIcon className="w-5 h-5" />
      </Link>

      {/* LIBRI */}
      <Link
        to="/trackers/libri"
        title="Libri"
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isBooks
            ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        <BookIcon className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default MobileHeaderTrackerSwitcher;
