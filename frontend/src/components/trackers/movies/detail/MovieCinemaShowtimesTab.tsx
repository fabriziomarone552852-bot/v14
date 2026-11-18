// src/components/trackers/movies/detail/MovieCinemaShowtimesTab.tsx
import React, { useMemo } from 'react';
import { useMovieShowtimes } from '@/hooks/queries/useCinemaQueries';
import { useCinemaProvinceSelection } from '@/hooks/trackers/useCinemaProvinceSelection';
import { MobileCinemaProvinceModal } from '@/mobile/components/trackers/movies/cinema/MobileCinemaProvinceModal';
import { FilmIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { findMatchingCinemaMovie } from '@/utils/cinemaUtils';

export interface MovieCinemaShowtimesTabProps {
  tmdbId?: number;
  movieTitle: string;
}

export const MovieCinemaShowtimesTab: React.FC<MovieCinemaShowtimesTabProps> = ({
  tmdbId,
  movieTitle,
}) => {
  const {
    provinces,
    selectedProvinceSlug,
    provinceData,
    isLoadingCinema: isLoadingProvince,
    currentProvince,
    isProvinceModalOpen,
    setIsProvinceModalOpen,
    handleSelectProvince,
  } = useCinemaProvinceSelection();

  // Ricerca dell'identificativo ComingSoon (IDF) del film per la provincia
  const effectiveIdf = useMemo(() => {
    return findMatchingCinemaMovie(provinceData?.movies, tmdbId, movieTitle)?.idf || '';
  }, [provinceData?.movies, tmdbId, movieTitle]);

  const { data: showtimes = [], isLoading: isLoadingShowtimes } = useMovieShowtimes(
    selectedProvinceSlug,
    effectiveIdf,
    Boolean(effectiveIdf)
  );

  const isLoading = isLoadingShowtimes || (Boolean(!effectiveIdf) && isLoadingProvince);

  const handleOpenMaps = (cinemaName: string, address?: string | null) => {
    const query = encodeURIComponent(`${cinemaName} ${address || ''}`.trim());
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const saleCount = showtimes.length;

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fadeIn select-none">
      {/* Header con conteggio sale e selettore provincia */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
        <h3 className="text-lg font-extrabold text-gray-900">
          {isLoading
            ? 'Ricerca sale...'
            : saleCount > 0
              ? `${saleCount} sal${saleCount === 1 ? 'a disponibile' : 'e disponibili'}`
              : 'Nessuna sala disponibile'}
        </h3>

        <button
          type="button"
          onClick={() => setIsProvinceModalOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200/70 shadow-2xs transition-all active:scale-95 cursor-pointer"
          title="Cambia provincia cinema"
        >
          <span>📍 {currentProvince.name}</span>
        </button>
      </div>

      {/* Contenuto principale: caricamento, sale o empty state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <LoadingIcon className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-bold">
            Ricerca sale e orari in corso per la provincia di {currentProvince.name}...
          </span>
        </div>
      ) : showtimes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xs text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FilmIcon className="w-7 h-7" />
          </div>
          <div className="max-w-md">
            <h4 className="font-extrabold text-base text-gray-800 mb-1">
              Nessuno spettacolo programmato per oggi
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Il film non risulta attualmente in programmazione nelle sale di{' '}
              <span className="font-bold text-gray-700">{currentProvince.name}</span>. Prova a
              selezionare una provincia limitrofa o ricontrolla nelle prossime ore.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsProvinceModalOpen(true)}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Cambia Provincia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showtimes.map((cinema, idx) => {
            const allTimes = Array.from(
              new Set(
                cinema.rooms
                  .flatMap((r) => r.showtimes)
                  .filter((t) => t && t.trim().length > 0)
              )
            ).sort((a, b) => a.localeCompare(b));

            return (
              <div
                key={cinema.cinema_id || idx}
                onClick={() => handleOpenMaps(cinema.cinema_name, cinema.address)}
                className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between gap-3"
                title="Clicca per aprire su Google Maps"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {cinema.cinema_name}
                  </h4>
                  {cinema.address && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {cinema.address}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allTimes.length > 0 ? (
                    allTimes.map((timeStr, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 text-xs font-extrabold rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                      >
                        {timeStr}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Orari in sala da verificare
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale cambio provincia */}
      <MobileCinemaProvinceModal
        isOpen={isProvinceModalOpen}
        onClose={() => setIsProvinceModalOpen(false)}
        provinces={provinces}
        selectedSlug={selectedProvinceSlug}
        onSelectProvince={handleSelectProvince}
      />
    </div>
  );
};

export default MovieCinemaShowtimesTab;
