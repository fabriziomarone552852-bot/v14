// src/mobile/components/trackers/movies/MobileMovieUpcomingSlide.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useUpcomingMovies } from '@/hooks/queries/useMovieQueries';
import {
  useCinemaProvinces,
  useProvinceCinemaData,
} from '@/hooks/queries/useCinemaQueries';
import type { MovieDetailTarget, Movie } from '@/types/movies';
import type { MovieInCinemaSummary } from '@/types/cinema';
import { FilmIcon } from '@/components/shared/utils/Icons';
import { MobileCinemaProvinceModal } from './cinema/MobileCinemaProvinceModal';

export interface MobileMovieUpcomingSlideProps {
  activePageIndex?: number;
  className?: string;
  movies?: Movie[];
  onOpenMovieDetail: (movie: MovieDetailTarget) => void;
}

interface ProcessedMovieItem {
  movie: Movie;
  releaseDateStr: string;
  releaseDate: Date;
  cinemaSummary?: MovieInCinemaSummary;
}

export const MobileMovieUpcomingSlide: React.FC<MobileMovieUpcomingSlideProps> = ({
  activePageIndex = 0,
  className = '',
  movies = [],
  onOpenMovieDetail,
}) => {
  // Gestione provincia cinema (persistenza affidabile in localStorage)
  const [selectedProvinceSlug, setSelectedProvinceSlug] = useState<string>(() => {
    return localStorage.getItem('vita_cinema_province') || 'milano';
  });

  // Indice film corrente nella vetrina "Ora al cinema"
  const [currentCinemaIndex, setCurrentCinemaIndex] = useState(0);

  // Modale selezione provincia
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);

  // Queries
  const { data: upcomingFromApi = [] } = useUpcomingMovies();
  const { data: provinces = [] } = useCinemaProvinces();
  const { data: provinceData, isLoading: isLoadingCinema } = useProvinceCinemaData(selectedProvinceSlug);

  const currentProvince = useMemo(() => {
    return (
      provinces.find((p) => p.slug === selectedProvinceSlug) || {
        name: provinceData?.province_name || selectedProvinceSlug.toUpperCase(),
        slug: selectedProvinceSlug,
      }
    );
  }, [provinces, selectedProvinceSlug, provinceData]);

  const handleSelectProvince = (slug: string) => {
    setSelectedProvinceSlug(slug);
    localStorage.setItem('vita_cinema_province', slug);
  };

  // Helper formattazione data "dal DD/MM"
  const formatDalDate = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `dal ${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  // Helper calcolo giorni mancanti all'uscita
  const getDaysUntilText = (d: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Oggi';
    if (diffDays === 1) return 'Domani';
    if (diffDays < 7) return `tra ${diffDays} giorni`;
    if (diffDays < 14) return 'tra 1 sett.';
    if (diffDays < 30) return `tra ${Math.round(diffDays / 7)} sett.`;
    return `tra ${Math.round(diffDays / 30)} mesi`;
  };

  // Mappa film ComingSoon per matching
  const comingSoonMap = useMemo(() => {
    const byTmdbId = new Map<number, MovieInCinemaSummary>();
    const byTitle = new Map<string, MovieInCinemaSummary>();

    (provinceData?.movies || []).forEach((cm) => {
      if (cm.tmdb_id) byTmdbId.set(cm.tmdb_id, cm);
      byTitle.set(cm.title.trim().toLowerCase(), cm);
    });

    return { byTmdbId, byTitle };
  }, [provinceData?.movies]);

  // Set di ID recenti da useUpcomingMovies
  const recentTmdbSet = useMemo(() => {
    return new Set(upcomingFromApi.filter((u) => u.is_recent_release).map((u) => u.movie_tmdb_id));
  }, [upcomingFromApi]);

  // Suddivisione dei film del catalogo utente:
  // - ORA AL CINEMA (film attualmente al cinema)
  // - PROSSIMAMENTE IN USCITA (film con data futura)
  const { nowInCinemaMovies, upcomingMovies } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const cinemaList: ProcessedMovieItem[] = [];
    const upcomingList: ProcessedMovieItem[] = [];

    movies.forEach((m) => {
      const relStr = m.italy_release_date || m.release_date;
      if (!relStr) return;

      const d = new Date(relStr);
      if (isNaN(d.getTime())) return;

      const isFuture = d.getTime() > today.getTime();
      const cleanTitle = m.title.trim().toLowerCase();
      const csMatch = comingSoonMap.byTmdbId.get(m.tmdb_id) || comingSoonMap.byTitle.get(cleanTitle);

      if (isFuture) {
        upcomingList.push({
          movie: m,
          releaseDateStr: relStr,
          releaseDate: d,
          cinemaSummary: csMatch,
        });
      } else {
        const isCsPlaying = Boolean(csMatch);
        const isRecentRelease = recentTmdbSet.has(m.tmdb_id);

        const daysAgo = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        const isInTheatricalWindow = daysAgo >= 0 && daysAgo <= 60;

        if (isCsPlaying || isRecentRelease || isInTheatricalWindow) {
          cinemaList.push({
            movie: m,
            releaseDateStr: relStr,
            releaseDate: d,
            cinemaSummary: csMatch,
          });
        }
      }
    });

    // ORA AL CINEMA: "mettendo come primo quello uscito prima nel tempo e poi gli altri a seguire sotto"
    cinemaList.sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());

    // PROSSIMAMENTE IN USCITA: il più vicino nel tempo per primo
    upcomingList.sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());

    return { nowInCinemaMovies: cinemaList, upcomingMovies: upcomingList };
  }, [movies, comingSoonMap, recentTmdbSet]);

  // Rotazione automatica ogni 5 secondi come una vetrina
  useEffect(() => {
    if (nowInCinemaMovies.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentCinemaIndex((prev) => (prev + 1) % nowInCinemaMovies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [nowInCinemaMovies.length, currentCinemaIndex]);

  // Clamp dell'indice se il numero di film cambia
  useEffect(() => {
    if (currentCinemaIndex >= nowInCinemaMovies.length && nowInCinemaMovies.length > 0) {
      setCurrentCinemaIndex(0);
    }
  }, [nowInCinemaMovies.length, currentCinemaIndex]);

  // Gestione Touch Swipe orizzontale sulla finestrella vetrina
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleWindowTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleWindowTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    setTouchStartX(null);
    setTouchStartY(null);

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (Math.abs(deltaX) > 35) {
      e.stopPropagation();
      if (deltaX < 0) {
        // swipe verso sinistra -> film successivo
        setCurrentCinemaIndex((prev) => (prev + 1) % nowInCinemaMovies.length);
      } else {
        // swipe verso destra -> film precedente
        setCurrentCinemaIndex((prev) => (prev - 1 + nowInCinemaMovies.length) % nowInCinemaMovies.length);
      }
    }
  };

  const activeItem = nowInCinemaMovies[currentCinemaIndex] || nowInCinemaMovies[0];

  // Immagine di Backdrop per lo sfondo della finestrella
  const rawBackdrop = activeItem?.movie.custom_backdrop_path || activeItem?.movie.backdrop_path;
  const fullBackdrop = rawBackdrop
    ? rawBackdrop.startsWith('http') || rawBackdrop.startsWith('data:')
      ? rawBackdrop
      : `https://image.tmdb.org/t/p/w780${rawBackdrop}`
    : null;

  // Immagine di Locandina
  const posterUrl = activeItem?.movie.custom_poster_path || activeItem?.movie.poster_path;
  const fullPoster = posterUrl
    ? posterUrl.startsWith('http') || posterUrl.startsWith('data:')
      ? posterUrl
      : `https://image.tmdb.org/t/p/w200${posterUrl}`
    : null;

  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col overflow-hidden p-3 gap-3 transition-all duration-300 ease-out text-left ${
        className ||
        (activePageIndex === 0
          ? 'translate-x-0 pointer-events-auto z-10'
          : '-translate-x-full pointer-events-none z-0')
      }`}
    >
      {/* CONTENITORE SCORREVOLE */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pb-14 pr-0.5">
        {/* ================================================================= */}
        {/* FINESTRA VETRINA BLU: DIMENSIONE FISSA, BACKDROP SFONDO & ROTAZIONE */}
        {/* ================================================================= */}
        <div
          onTouchStart={handleWindowTouchStart}
          onTouchEnd={handleWindowTouchEnd}
          className="h-48 w-full rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md relative overflow-hidden flex flex-col justify-between border border-blue-400/30 select-none shrink-0"
        >
          {/* SFONDO BACKDROP DEL FILM ATTIVO (CON OVERLAY BLU SCURO TRASLUCIDO) */}
          {fullBackdrop && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src={fullBackdrop}
                alt=""
                className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/85 to-indigo-950/80 backdrop-blur-[1px]" />
            </div>
          )}

          {/* 1. HEADER DELLA FINESTRA: "ORA AL CINEMA" A SINISTRA, PROVINCIA A DESTRA */}
          <div className="relative z-10 flex items-center justify-between px-3.5 pt-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🍿</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-white drop-shadow-xs">
                ORA AL CINEMA
              </h3>
            </div>

            {/* SELETTORE PROVINCIA AL POSTO DI 'X FILM' */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsProvinceModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] backdrop-blur-xs border border-white/25 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>📍 {currentProvince.name}</span>
              <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* 2. CORPO DELLA FINESTRA: LOCANDINA A SX, TITOLO E DATA A DX */}
          {isLoadingCinema && nowInCinemaMovies.length === 0 ? (
            <div className="relative z-10 flex-1 flex items-center justify-center text-xs text-blue-100 italic">
              Verifica programmazione in corso...
            </div>
          ) : nowInCinemaMovies.length === 0 ? (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-xs text-blue-100/90 italic gap-1.5 px-4 text-center">
              <FilmIcon className="w-6 h-6 opacity-60" />
              <span>Nessun film del tuo catalogo è attualmente in sala.</span>
            </div>
          ) : activeItem ? (
            <div
              onClick={() =>
                onOpenMovieDetail({
                  tmdb_id: activeItem.movie.tmdb_id,
                  title: activeItem.movie.title,
                  poster_path: activeItem.movie.poster_path,
                })
              }
              className="relative z-10 flex-1 min-h-0 flex items-center gap-3.5 px-3.5 py-1 cursor-pointer active:scale-[0.99] transition-transform"
            >
              {/* Locandina verticale a sinistra */}
              <div className="w-16 h-24 rounded-xl overflow-hidden bg-blue-950/60 shrink-0 border border-white/30 shadow-md relative">
                {fullPoster ? (
                  <img
                    src={fullPoster}
                    alt={activeItem.movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    <FilmIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Informazioni a destra della locandina */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 text-left">
                <h4 className="font-black text-sm text-white line-clamp-2 leading-tight drop-shadow-xs">
                  {activeItem.movie.title}
                </h4>

                {/* Da quando è al cinema */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-white/20 text-white tracking-tight border border-white/25 shadow-2xs backdrop-blur-xs">
                    Al cinema {formatDalDate(activeItem.releaseDateStr)}
                  </span>
                </div>

                {(activeItem.movie.genres || activeItem.cinemaSummary?.genre) && (
                  <p className="text-[10px] text-blue-200/90 font-medium truncate mt-0.5">
                    {activeItem.movie.genres || activeItem.cinemaSummary?.genre}
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* 3. PALLINI INDICATORI SEQUENZA IN BASSO */}
          {nowInCinemaMovies.length > 1 && (
            <div className="relative z-10 flex items-center justify-center gap-1 pb-2">
              {nowInCinemaMovies.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentCinemaIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentCinemaIndex ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* SOTTO LA FINESTRA: "PROSSIMAMENTE IN USCITA" (SENZA BADGE X FILM) */}
        {/* ================================================================= */}
        <div className="space-y-2.5 pt-1">
          <div className="px-1">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-700">
              Prossimamente in Uscita
            </h3>
          </div>

          <div className="space-y-2">
            {upcomingMovies.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 italic">
                Nessun film in uscita programmato nel tuo catalogo.
              </div>
            ) : (
              upcomingMovies.map((item) => {
                const posterUrl = item.movie.custom_poster_path || item.movie.poster_path;
                const fullPoster = posterUrl
                  ? posterUrl.startsWith('http') || posterUrl.startsWith('data:')
                    ? posterUrl
                    : `https://image.tmdb.org/t/p/w200${posterUrl}`
                  : null;

                const dalText = formatDalDate(item.releaseDateStr);
                const daysUntil = getDaysUntilText(item.releaseDate);

                return (
                  <div
                    key={item.movie.tmdb_id}
                    onClick={() =>
                      onOpenMovieDetail({
                        tmdb_id: item.movie.tmdb_id,
                        title: item.movie.title,
                        poster_path: item.movie.poster_path,
                      })
                    }
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs transition-all active:scale-[0.98] cursor-pointer hover:border-blue-300"
                  >
                    {/* Locandina */}
                    <div className="w-12 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative shadow-2xs">
                      {fullPoster ? (
                        <img
                          src={fullPoster}
                          alt={item.movie.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FilmIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Dati film */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <h4 className="font-extrabold text-xs text-gray-900 truncate leading-tight">
                        {item.movie.title}
                      </h4>

                      <div className="flex items-center gap-2 flex-wrap">
                        {dalText && (
                          <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                            {dalText}
                          </span>
                        )}

                        <span className="text-[10px] font-bold text-gray-500">
                          {daysUntil}
                        </span>
                      </div>
                    </div>

                    {/* Freccia */}
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
      </div>

      {/* MODALE SCELTA PROVINCIA */}
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
