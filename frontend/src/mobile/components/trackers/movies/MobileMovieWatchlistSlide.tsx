import React, { useState } from 'react';
import type { Movie, MovieDetailTarget } from '@/types/movies';
import { FilmIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';

export interface MobileMovieWatchlistSlideProps {
  activePageIndex?: number;
  className?: string;
  movies: Movie[] | undefined;
  onOpenMovieDetail: (movie: MovieDetailTarget) => void;
}

export const MobileMovieWatchlistSlide: React.FC<MobileMovieWatchlistSlideProps> = ({
  activePageIndex = 1,
  className = '',
  movies = [],
  onOpenMovieDetail,
}) => {
  const [subTab, setSubTab] = useState<'to_watch' | 'watched'>('to_watch');

  const filteredMovies = movies.filter((m) => {
    if (subTab === 'to_watch') return m.status === 'to_watch';
    return m.status === 'watched';
  });

  const getPoster = (m: Movie) => {
    const raw = m.custom_poster_path || m.poster_path;
    if (!raw) return null;
    return raw.startsWith('http') || raw.startsWith('data:')
      ? raw
      : raw.startsWith('/uploads')
      ? resolveImageUrl(raw)
      : `https://image.tmdb.org/t/p/w200${raw}`;
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col overflow-hidden p-3 gap-3 transition-all duration-300 ease-out text-left ${
        className ||
        (activePageIndex === 1
          ? 'translate-x-0 pointer-events-auto z-10'
          : 'translate-x-full pointer-events-none z-0')
      }`}
    >
      {/* Segmented Control: In lista vs Guardati */}
      <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 shadow-inner">
        <button
          onClick={() => setSubTab('to_watch')}
          className={`flex-1 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
            subTab === 'to_watch'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          In Lista ({movies.filter((m) => m.status === 'to_watch').length})
        </button>
        <button
          onClick={() => setSubTab('watched')}
          className={`flex-1 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
            subTab === 'watched'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Guardati ({movies.filter((m) => m.status === 'watched').length})
        </button>
      </div>

      {/* Lista Film Scrollabile */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pb-14">
        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400 text-xs gap-2">
            <FilmIcon className="w-8 h-8 opacity-30" />
            <p>
              {subTab === 'to_watch'
                ? 'Nessun film da guardare nella tua lista.'
                : 'Nessun film guardato registrato finora.'}
            </p>
          </div>
        ) : (
          filteredMovies.map((movie) => {
            const poster = getPoster(movie);
            const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '';

            return (
              <div
                key={movie.tmdb_id}
                onClick={() => onOpenMovieDetail(movie)}
                className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs active:scale-[0.98] transition-transform cursor-pointer"
              >
                {/* Locandina */}
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-2xs">
                  {poster ? (
                    <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FilmIcon className="w-5 h-5 opacity-40" />
                    </div>
                  )}
                </div>

                {/* Dati film */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <h4 className="font-bold text-xs text-gray-900 truncate leading-tight">
                    {movie.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    {releaseYear && <span>{releaseYear}</span>}
                    {movie.runtime && <span>{movie.runtime} min</span>}
                    {movie.my_rating && (
                      <span className="font-bold text-amber-500">
                        {movie.my_rating}★
                      </span>
                    )}
                  </div>

                  {movie.genres && (
                    <p className="text-[10px] text-gray-400 truncate">
                      {movie.genres.split(',').slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>

                {/* Badge o freccia */}
                <div className="shrink-0 text-gray-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
