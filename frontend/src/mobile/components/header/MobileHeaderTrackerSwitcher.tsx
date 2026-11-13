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

  const activeIndex = isFilm ? 1 : isBooks ? 2 : 0;

  return (
    <div className="relative grid grid-cols-3 items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 shadow-inner select-none">
      {/* Livello base: icone scure sempre visibili sulla traccia grigia */}
      <Link
        to="/trackers/serie-tv"
        title="Serie TV"
        aria-current={isTV ? 'page' : undefined}
        className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        <TvIcon className="w-5 h-5" />
      </Link>

      <Link
        to="/trackers/film"
        title="Film"
        aria-current={isFilm ? 'page' : undefined}
        className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        <FilmIcon className="w-5 h-5" />
      </Link>

      <Link
        to="/trackers/libri"
        title="Libri"
        aria-current={isBooks ? 'page' : undefined}
        className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        <BookIcon className="w-5 h-5" />
      </Link>

      {/* Pillola blu scorrevole con maschera interna per icone bianche (zero lag di colore) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1 bottom-1 left-1 z-20 w-8 h-8 rounded-lg bg-blue-600 shadow-xs overflow-hidden transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{
          transform: `translate3d(${activeIndex * 2}rem, 0, 0)`,
        }}
      >
        <div
          className="grid grid-cols-3 w-24 h-8 text-white transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{
            transform: `translate3d(-${activeIndex * 2}rem, 0, 0)`,
          }}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <TvIcon className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center">
            <FilmIcon className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center">
            <BookIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHeaderTrackerSwitcher;
