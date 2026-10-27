// src/mobile/components/trackers/movies/cinema/MobileMovieShowtimesModal.tsx
import React from 'react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { useMovieShowtimes } from '@/hooks/queries/useCinemaQueries';
import type { MovieInCinemaSummary } from '@/types/cinema';
import type { MovieDetailTarget } from '@/types/movies';
import { FilmIcon } from '@/components/shared/utils/Icons';

export interface MobileMovieShowtimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  provinceSlug: string;
  provinceName: string;
  movie: MovieInCinemaSummary | null;
  onOpenMovieDetail?: (movie: MovieDetailTarget) => void;
}

export const MobileMovieShowtimesModal: React.FC<MobileMovieShowtimesModalProps> = ({
  isOpen,
  onClose,
  provinceSlug,
  provinceName,
  movie,
  onOpenMovieDetail,
}) => {
  const { data: showtimes = [], isLoading } = useMovieShowtimes(
    provinceSlug,
    movie?.idf || '',
    isOpen && Boolean(movie?.idf)
  );

  if (!movie) return null;

  const handleOpenMaps = (cinemaName: string, address?: string | null) => {
    const query = encodeURIComponent(`${cinemaName} ${address || ''}`.trim());
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleOpenDetail = () => {
    if (onOpenMovieDetail) {
      onOpenMovieDetail({
        tmdb_id: movie.tmdb_id || undefined,
        title: movie.title,
        poster_path: movie.poster ? movie.poster : undefined,
      });
      onClose();
    }
  };

  return (
    <SelectModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Orari & Cinema"
      maxWidthClass="max-w-md"
      zIndex={10040}
    >
      <div className="space-y-4 py-1 text-left">
        {/* Intestazione Film */}
        <div className="flex gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
          <div className="w-14 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 shadow-2xs border border-gray-200">
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FilmIcon className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h4 className="font-extrabold text-sm text-gray-900 leading-tight">
                {movie.title}
              </h4>
              {movie.genre && (
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  {movie.genre} {movie.duration ? `• ${movie.duration}` : ''}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {movie.rating && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  ★ {movie.rating}
                </span>
              )}

              {onOpenMovieDetail && (
                <button
                  type="button"
                  onClick={handleOpenDetail}
                  className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <FilmIcon className="w-3 h-3" />
                  <span>Scheda Film</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Titolo Sezione */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-1">
          <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">
            Sale a {provinceName} ({showtimes.length})
          </span>
        </div>

        {/* Lista Sale e Orari */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-0.5">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Ricerca sale e orari in corso...
            </div>
          ) : showtimes.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Nessuno spettacolo programmato per oggi in questa provincia.
            </div>
          ) : (
            showtimes.map((cinema, idx) => (
              <div
                key={cinema.cinema_id || idx}
                className="p-3 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-2.5"
              >
                {/* Nome cinema e indirizzo */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-extrabold text-xs text-gray-900 leading-snug">
                      {cinema.cinema_name}
                    </h5>
                    {cinema.address && (
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {cinema.address}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenMaps(cinema.cinema_name, cinema.address)}
                    className="shrink-0 p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Apri su Mappe"
                  >
                    <span>Mappe ↗</span>
                  </button>
                </div>

                {/* Sale e Orari */}
                <div className="space-y-2 pt-1 border-t border-gray-100/80">
                  {cinema.rooms.map((room, rIdx) => (
                    <div key={rIdx} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                        <span>{room.sala}</span>
                        {room.posti && <span>{room.posti}</span>}
                      </div>

                      {/* Pillole Orari */}
                      <div className="flex flex-wrap gap-1.5">
                        {room.showtimes.length > 0 ? (
                          room.showtimes.map((timeStr, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-blue-600 text-white shadow-2xs tracking-wide"
                            >
                              {timeStr}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-600 font-medium">
                            {room.orari_raw}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tasto Biglietti */}
                {cinema.ticket_url && (
                  <div className="pt-1">
                    <a
                      href={cinema.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <span>Acquista Biglietto / Tutte le date ↗</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </SelectModalDialog>
  );
};
