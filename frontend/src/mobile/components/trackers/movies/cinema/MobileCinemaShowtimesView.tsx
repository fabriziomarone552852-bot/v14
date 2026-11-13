// src/mobile/components/trackers/movies/cinema/MobileCinemaShowtimesView.tsx
import React, { useMemo } from 'react';
import {
  useMovieShowtimes,
  useProvinceCinemaData,
} from '@/hooks/queries/useCinemaQueries';
import { FilmIcon, LoadingIcon } from '@/components/shared/utils/Icons';

export interface MobileCinemaShowtimesViewProps {
  provinceSlug: string;
  provinceName: string;
  idf?: string;
  tmdbId?: number;
  movieTitle: string;
  onChangeProvinceClick: () => void;
}

export const MobileCinemaShowtimesView: React.FC<MobileCinemaShowtimesViewProps> = ({
  provinceSlug,
  provinceName,
  idf,
  tmdbId,
  movieTitle,
  onChangeProvinceClick,
}) => {
  // Se non abbiamo l'IDF diretto (es. cambio provincia al volo), lo ricerchiamo nei film della provincia
  const { data: provinceData, isLoading: isLoadingProvince } = useProvinceCinemaData(provinceSlug);

  const effectiveIdf = useMemo(() => {
    if (idf) return idf;
    if (!provinceData?.movies) return '';
    const cleanTargetTitle = (movieTitle || '').trim().toLowerCase();
    const normTarget = cleanTargetTitle
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const match = provinceData.movies.find((m) => {
      if (tmdbId && m.tmdb_id && m.tmdb_id === tmdbId) return true;
      const mClean = (m.title || '').trim().toLowerCase();
      if (mClean === cleanTargetTitle) return true;
      const normM = mClean
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return normM === normTarget || normM.includes(normTarget) || normTarget.includes(normM);
    });
    return match?.idf || '';
  }, [idf, provinceData, tmdbId, movieTitle]);

  const { data: showtimes = [], isLoading: isLoadingShowtimes } = useMovieShowtimes(
    provinceSlug,
    effectiveIdf,
    Boolean(effectiveIdf)
  );

  const isLoading = isLoadingShowtimes || (Boolean(!idf) && isLoadingProvince);

  const handleOpenMaps = (cinemaName: string, address?: string | null) => {
    const query = encodeURIComponent(`${cinemaName} ${address || ''}`.trim());
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const saleCount = showtimes.length;
  const saleTitle =
    saleCount === 1 ? '1 SALA DISPONIBILE' : `${saleCount} SALE DISPONIBILI`;

  return (
    <div className="flex flex-col gap-3 pb-6 animate-fadeIn select-none">
      {/* 1. HEADER: "X SALE DISPONIBILI" A SINISTRA, SELETTORE PROVINCIA STILE HOMEPAGE A DESTRA */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
          {saleTitle}
        </h3>

        {/* Selettore provincia identico allo stile della homepage */}
        <button
          type="button"
          onClick={onChangeProvinceClick}
          className="flex items-center px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[11px] border border-blue-200/60 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>📍 {provinceName}</span>
        </button>
      </div>

      {/* 2. STATO DI CARICAMENTO */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
          <LoadingIcon className="w-7 h-7 text-blue-600 animate-spin" />
          <span className="text-xs font-bold">
            Ricerca sale e orari in corso per {provinceName}...
          </span>
        </div>
      ) : showtimes.length === 0 ? (
        /* 3. NESSUNO SPETTACOLO IN PROGRAMMAZIONE (EMPTY STATE PULITO) */
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FilmIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-800">
              Nessuno spettacolo programmato per oggi
            </h4>
          </div>
        </div>
      ) : (
        /* 4. LISTA DEI CINEMA CON ORARI SENZA SALA, VIA O TASTI AGGIUNTIVI */
        <div className="space-y-2.5">
          {showtimes.map((cinema, idx) => {
            // Estrazione e ordinamento crescente di tutti gli orari unificati del cinema
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
                className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs space-y-2.5 cursor-pointer active:scale-[0.99] transition-all hover:border-blue-300"
                title="Tocca per aprire su Google Maps"
              >
                {/* Nome del Cinema (cliccabile per aprire su Maps) */}
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-sm text-gray-900 leading-snug">
                    {cinema.cinema_name}
                  </h4>
                </div>

                {/* Orari unificati in ordine crescente (pillole blu) */}
                <div className="flex flex-wrap gap-1.5">
                  {allTimes.length > 0 ? (
                    allTimes.map((timeStr, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs"
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
    </div>
  );
};

export default MobileCinemaShowtimesView;
