// src/mobile/components/trackers/movies/cinema/MobileCinemaMovieCard.tsx
import React from 'react';
import type { MovieInCinemaSummary } from '@/types/cinema';
import type { Movie } from '@/types/movies';
import { FilmIcon } from '@/components/shared/utils/Icons';

export interface MobileCinemaMovieCardProps {
  movie: MovieInCinemaSummary;
  userMovie?: Movie;
  onOpenShowtimes: (movie: MovieInCinemaSummary) => void;
}

export const MobileCinemaMovieCard: React.FC<MobileCinemaMovieCardProps> = ({
  movie,
  userMovie,
  onOpenShowtimes,
}) => {
  const isWatched = userMovie?.status === 'watched';
  const isToWatch = userMovie?.status === 'to_watch';

  return (
    <div
      onClick={() => onOpenShowtimes(movie)}
      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs transition-transform active:scale-[0.98] cursor-pointer hover:border-blue-300"
    >
      {/* Locandina */}
      <div className="w-12 h-17 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative shadow-2xs">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FilmIcon className="w-6 h-6" />
          </div>
        )}
        <div className="absolute top-0 inset-x-0 bg-blue-600/90 text-white text-[7px] font-black text-center uppercase tracking-tight py-0.5">
          In Sala
        </div>
      </div>

      {/* Dati film */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4 className="font-extrabold text-xs text-gray-900 truncate leading-tight">
            {movie.title}
          </h4>

          {/* Badge stato personale utente */}
          {isWatched && (
            <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
              ✓ Visto
            </span>
          )}
          {isToWatch && (
            <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
              In lista
            </span>
          )}
        </div>

        {movie.genre && (
          <p className="text-[10px] text-gray-500 font-medium truncate">
            {movie.genre} {movie.duration ? `• ${movie.duration}` : ''}
          </p>
        )}

        <div className="flex items-center gap-2 mt-0.5">
          {movie.rating && (
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
              ★ {movie.rating}
            </span>
          )}
          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded hover:underline">
            Vedi sale e orari 🕒
          </span>
        </div>
      </div>

      <div className="shrink-0 text-gray-300">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};
