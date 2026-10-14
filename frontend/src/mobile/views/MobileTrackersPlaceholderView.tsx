// src/mobile/views/MobileTrackersPlaceholderView.tsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FilmIcon, BookIcon, TvIcon } from '@/components/shared/utils/Icons';

export const MobileTrackersPlaceholderView: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const isFilm = path.includes('/film');
  const title = isFilm ? 'Film' : 'Libri';
  const IconComponent = isFilm ? FilmIcon : BookIcon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-none">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 shadow-sm">
        <IconComponent className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 border border-blue-100">
        In Sviluppo
      </span>

      <h2 className="text-2xl font-black text-gray-800 mb-2">
        {title}
      </h2>

      <p className="text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
        La sezione dedicata a <span className="font-semibold text-gray-700">{title}</span> è attualmente in fase di sviluppo e sarà disponibile nei prossimi aggiornamenti.
      </p>

      <Link
        to="/trackers/serie-tv"
        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
      >
        <TvIcon className="w-4 h-4" />
        <span>Torna a Serie TV</span>
      </Link>
    </div>
  );
};

export default MobileTrackersPlaceholderView;
