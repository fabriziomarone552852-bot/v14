import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { useUpcomingMovies } from '@/hooks/queries/useMovieQueries';
import type { UpcomingMovie, MovieDetailTarget } from '@/types/movies';

interface UpcomingMoviesWidgetProps {
  openMovieDetail: (movie: MovieDetailTarget) => void;
}

export const UpcomingMoviesWidget: React.FC<UpcomingMoviesWidgetProps> = ({ openMovieDetail }) => {
  const { data: upcomingMovies = [], isLoading } = useUpcomingMovies();

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-visible justify-center w-full">
      <div className="flex gap-5 overflow-x-auto pt-4 pb-4 px-4 snap-x items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading ? (
          <div className="w-full flex justify-center items-center h-[165px] text-gray-400 text-xs">
            Caricamento prossime uscite...
          </div>
        ) : upcomingMovies.length > 0 ? (
          upcomingMovies.map((movie: UpcomingMovie) => {
            const displayDate = movie.italy_release_date || movie.release_date;
            return (
              <div
                key={movie.movie_tmdb_id}
                onClick={() =>
                  openMovieDetail({
                    tmdb_id: movie.movie_tmdb_id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                  })
                }
                className="w-[110px] flex flex-col shrink-0 snap-start cursor-pointer hover:scale-110 hover:z-20 transition-all duration-300"
              >
                <div
                  className={`aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden shadow-sm relative border-2 transition-colors group ${
                    movie.is_recent_release
                      ? 'border-amber-400 hover:border-amber-500 shadow-amber-200/50'
                      : 'border-transparent hover:border-blue-400'
                  }`}
                >
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '/no-poster.png'
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover opacity-60"
                  />

                  {/* TOP BADGE: Data / Ora al cinema */}
                  <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent pt-2 pb-5 px-1">
                    {movie.is_recent_release ? (
                      <span className="block text-[9px] font-black text-amber-300 uppercase text-center tracking-wider drop-shadow-md">
                        🎬 Ora al cinema
                      </span>
                    ) : (
                      <p className="text-[10px] text-blue-400 font-extrabold uppercase text-center drop-shadow-md">
                        {formatDate(displayDate)}
                      </p>
                    )}
                  </div>

                  {/* BOTTOM: Text overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100 flex flex-col justify-end p-2 transition-opacity">
                    <p className="text-white font-extrabold text-[11px] leading-tight line-clamp-2 drop-shadow-md">
                      {movie.title}
                    </p>
                    {movie.is_recent_release && displayDate && (
                      <p className="text-amber-200 font-semibold text-[9px] mt-0.5 tracking-wider">
                        Uscito il {formatDate(displayDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full flex justify-center items-center h-[165px]">
            <EmptyState message="Nessuna uscita programmata." />
          </div>
        )}
      </div>
    </div>
  );
};
