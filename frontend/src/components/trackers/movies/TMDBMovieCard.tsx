import React from 'react';
import type { Movie, TMDBMovieSearchResult } from '@/types/movies';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';

interface TMDBMovieCardProps {
  result: TMDBMovieSearchResult;
  existingMovie?: Movie;
  onCardClick: (mockMovie: Partial<Movie>) => void;
  onAddClick: (tmdbId: number, e: React.MouseEvent) => void;
}

export const TMDBMovieCard: React.FC<TMDBMovieCardProps> = ({
  result,
  existingMovie,
  onCardClick,
  onAddClick,
}) => {
  return (
    <div
      className="flex flex-col group cursor-pointer w-full relative z-0 hover:z-20"
      onClick={() => {
        const mockMovie: Partial<Movie> = {
          tmdb_id: result.id,
          title: result.title,
          original_title: result.original_title,
          overview: result.overview,
          poster_path: result.poster_path,
          backdrop_path: result.backdrop_path,
          release_date: result.release_date,
          italy_release_date: result.italy_release_date,
          vote_average: result.vote_average,
        };
        onCardClick(existingMovie || mockMovie);
      }}
    >
      <div
        className={`relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-100 shadow-sm border-[3px] transition-all duration-300 group-hover:scale-105 ${
          getMediaBorderClass(existingMovie?.status, 'Movie')
        }`}
      >
        {result.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
            alt={result.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <img src="/no-poster.png" alt="No Poster" className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 p-3">
          <h4 className="font-bold text-white line-clamp-2 text-sm leading-tight drop-shadow-md">
            {result.title}
          </h4>
        </div>

        {/* Pulsante rapido Aggiungi */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!existingMovie) onAddClick(result.id, e);
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer ${
              existingMovie
                ? 'bg-blue-500 border-2 border-solid border-blue-500 text-white shadow-md'
                : 'bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 text-white hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/90 shadow-sm'
            }`}
            title={existingMovie ? 'Già in lista' : 'Aggiungi alla lista'}
          >
            {existingMovie ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
