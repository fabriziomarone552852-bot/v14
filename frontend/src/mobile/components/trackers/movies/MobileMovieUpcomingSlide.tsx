// src/mobile/components/trackers/movies/MobileMovieUpcomingSlide.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { MovieDetailTarget, Movie } from '@/types/movies';
import { FilmIcon } from '@/components/shared/utils/Icons';
import { MobileCinemaProvinceModal } from './cinema/MobileCinemaProvinceModal';
import { MobileMovieCinemaDetailModal } from './cinema/MobileMovieCinemaDetailModal';
import { MobileUserStreamingProvidersModal } from '../shared/MobileUserStreamingProvidersModal';
import { MobileMovieStreamingFallbackView } from './MobileMovieStreamingFallbackView';
import {
  useMobileMovieUpcomingLogic,
  resolveMovieMediaUrl,
  formatDalDate,
  getDaysUntilText,
} from './useMobileMovieUpcomingLogic';

export interface MobileMovieUpcomingSlideProps {
  activePageIndex?: number;
  className?: string;
  movies?: Movie[];
  onOpenMovieDetail: (movie: MovieDetailTarget) => void;
}

export const MobileMovieUpcomingSlide: React.FC<MobileMovieUpcomingSlideProps> = ({
  activePageIndex = 0,
  className = '',
  movies = [],
  onOpenMovieDetail,
}) => {
  const {
    provinces,
    selectedProvinceSlug,
    currentProvince,
    isLoadingCinema,
    isProvinceModalOpen,
    setIsProvinceModalOpen,
    handleSelectProvince,
    selectedCinemaModalMovie,
    setSelectedCinemaModalMovie,
    isPlatformsModalOpen,
    setIsPlatformsModalOpen,
    streamingProvidersState,
    nowInCinemaMovies,
    upcomingMovies,
    streamingCatalogMovies,
    showStreamingFallback,
  } = useMobileMovieUpcomingLogic(movies);

  const [currentCinemaIndex, setCurrentCinemaIndex] = useState(0);

  // Rotazione automatica ogni 10 secondi nella vetrina "Ora al cinema"
  useEffect(() => {
    if (nowInCinemaMovies.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentCinemaIndex((prev) => (prev + 1) % nowInCinemaMovies.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [nowInCinemaMovies.length, currentCinemaIndex]);

  useEffect(() => {
    if (currentCinemaIndex >= nowInCinemaMovies.length && nowInCinemaMovies.length > 0) {
      setCurrentCinemaIndex(0);
    }
  }, [nowInCinemaMovies.length, currentCinemaIndex]);

  // Gestione Touch Swipe orizzontale e Tap sulla finestrella vetrina cinema
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isSwiping = useRef(false);

  const handleWindowTouchStart = (e: React.TouchEvent) => {
    isSwiping.current = false;
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleWindowTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || nowInCinemaMovies.length <= 1) {
      touchStartPos.current = null;
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping.current = true;
      e.stopPropagation();
      if (deltaX < 0) {
        setCurrentCinemaIndex((prev) => (prev + 1) % nowInCinemaMovies.length);
      } else {
        setCurrentCinemaIndex(
          (prev) => (prev - 1 + nowInCinemaMovies.length) % nowInCinemaMovies.length
        );
      }
    }
  };

  const handleCardClick = () => {
    if (isSwiping.current) {
      isSwiping.current = false;
      return;
    }
    const targetMovie = nowInCinemaMovies[currentCinemaIndex] || nowInCinemaMovies[0];
    if (targetMovie) {
      setSelectedCinemaModalMovie(targetMovie);
    }
  };

  const activeItem = nowInCinemaMovies[currentCinemaIndex] || nowInCinemaMovies[0];
  const fullBackdrop = resolveMovieMediaUrl(
    activeItem?.movie.custom_backdrop_path || activeItem?.movie.backdrop_path,
    'w780'
  );
  const fullPoster = resolveMovieMediaUrl(
    activeItem?.movie.custom_poster_path || activeItem?.movie.poster_path,
    'w200'
  );

  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col overflow-hidden p-3 gap-3 transition-all duration-300 ease-out text-left ${
        className ||
        (activePageIndex === 0
          ? 'translate-x-0 pointer-events-auto z-10'
          : '-translate-x-full pointer-events-none z-0')
      }`}
    >
      {showStreamingFallback ? (
        <MobileMovieStreamingFallbackView
          items={streamingCatalogMovies}
          onOpenMovieDetail={onOpenMovieDetail}
          onOpenPlatformsModal={() => setIsPlatformsModalOpen(true)}
        />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pb-14 pr-0.5">
          {/* ================================================================= */}
          {/* FINESTRA VETRINA BLU: ORA AL CINEMA & PROVINCIA                   */}
          {/* ================================================================= */}
          <div
            onTouchStart={handleWindowTouchStart}
            onTouchEnd={handleWindowTouchEnd}
            onClick={handleCardClick}
            className="h-52 w-full rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md relative overflow-hidden flex flex-col justify-between border border-blue-400/30 select-none shrink-0 cursor-pointer"
          >
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

            <div className="relative z-10 flex items-center justify-between px-3.5 pt-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🍿</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-white drop-shadow-xs">
                  ORA AL CINEMA
                </h3>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProvinceModalOpen(true);
                }}
                className="flex items-center px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] backdrop-blur-xs border border-white/25 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>📍 {currentProvince.name}</span>
              </button>
            </div>

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
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="relative z-10 flex-1 min-h-0 flex items-center gap-3.5 px-3.5 py-1 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="w-20 h-30 rounded-2xl overflow-hidden bg-blue-950/60 shrink-0 border border-white/30 shadow-md relative">
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

                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 text-left">
                  <h4 className="font-black text-sm sm:text-base text-white line-clamp-2 leading-snug drop-shadow-xs">
                    {activeItem.movie.title}
                  </h4>
                  <p className="text-[11px] font-bold text-blue-100/90 tracking-wide drop-shadow-xs">
                    {formatDalDate(activeItem.releaseDateStr)}
                  </p>
                </div>
              </div>
            ) : null}

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
                      idx === currentCinemaIndex
                        ? 'w-4 bg-white shadow-xs'
                        : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* PROSSIMAMENTE IN USCITA                                           */}
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
                  const itemPoster = resolveMovieMediaUrl(
                    item.movie.custom_poster_path || item.movie.poster_path,
                    'w200'
                  );
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
                      <div className="w-12 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative shadow-2xs">
                        {itemPoster ? (
                          <img
                            src={itemPoster}
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

                      <div className="shrink-0 text-gray-300">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE SCELTA PROVINCIA CINEMA */}
      <MobileCinemaProvinceModal
        isOpen={isProvinceModalOpen}
        onClose={() => setIsProvinceModalOpen(false)}
        provinces={provinces}
        selectedSlug={selectedProvinceSlug}
        onSelectProvince={handleSelectProvince}
      />

      {/* MODALE SCELTA PIATTAFORME STREAMING UTENTE */}
      <MobileUserStreamingProvidersModal
        isOpen={isPlatformsModalOpen}
        onClose={() => setIsPlatformsModalOpen(false)}
        allProviders={streamingProvidersState.allCatalogProviders}
        selectedProviderIds={streamingProvidersState.userProviderIds}
        onToggleProvider={streamingProvidersState.toggleProvider}
        onClearAll={streamingProvidersState.clearProviders}
        isLoading={streamingProvidersState.isLoadingProviders}
      />

      {/* MODALE A TUTTO SCHERMO DETTAGLIO CINEMA */}
      {selectedCinemaModalMovie && (
        <MobileMovieCinemaDetailModal
          isOpen={Boolean(selectedCinemaModalMovie)}
          onClose={() => setSelectedCinemaModalMovie(null)}
          movie={selectedCinemaModalMovie.movie}
          selectedProvinceSlug={selectedProvinceSlug}
          selectedProvinceName={currentProvince.name}
          cinemaSummary={selectedCinemaModalMovie.cinemaSummary}
          onChangeProvince={handleSelectProvince}
          onSelectRecommendation={(rec) => onOpenMovieDetail(rec)}
        />
      )}
    </div>
  );
};
