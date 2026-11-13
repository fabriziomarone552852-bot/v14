// src/mobile/components/trackers/movies/MobileMovieStreamingFallbackView.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FilmIcon, TvIcon } from '@/components/shared/utils/Icons';
import { MobileUserPlatformsButton } from '../shared/MobileUserPlatformsButton';
import type { MovieDetailTarget } from '@/types/movies';
import {
  resolveMovieMediaUrl,
  type StreamingCatalogMovieItem,
} from './useMobileMovieUpcomingLogic';

export interface MobileMovieStreamingFallbackViewProps {
  items: StreamingCatalogMovieItem[];
  onOpenMovieDetail: (movie: MovieDetailTarget) => void;
  onOpenPlatformsModal: () => void;
}

export const MobileMovieStreamingFallbackView: React.FC<
  MobileMovieStreamingFallbackViewProps
> = ({ items, onOpenMovieDetail, onOpenPlatformsModal }) => {
  const showcaseItems = useMemo(() => items.slice(0, 8), [items]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotazione automatica ogni 10 secondi nella vetrina superiore
  useEffect(() => {
    if (showcaseItems.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseItems.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [showcaseItems.length, currentIndex]);

  useEffect(() => {
    if (currentIndex >= showcaseItems.length && showcaseItems.length > 0) {
      setCurrentIndex(0);
    }
  }, [showcaseItems.length, currentIndex]);

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
    if (!touchStartPos.current || showcaseItems.length <= 1) {
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
        setCurrentIndex((prev) => (prev + 1) % showcaseItems.length);
      } else {
        setCurrentIndex(
          (prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length
        );
      }
    }
  };

  const activeItem = showcaseItems[currentIndex] || showcaseItems[0];

  const handleShowcaseClick = () => {
    if (isSwiping.current) {
      isSwiping.current = false;
      return;
    }
    if (activeItem) {
      onOpenMovieDetail(activeItem.movie);
    }
  };

  const fullBackdrop = resolveMovieMediaUrl(
    activeItem?.movie.custom_backdrop_path || activeItem?.movie.backdrop_path,
    'w780'
  );
  const fullPoster = resolveMovieMediaUrl(
    activeItem?.movie.custom_poster_path || activeItem?.movie.poster_path,
    'w200'
  );

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pb-14 pr-0.5">
      {/* ================================================================= */}
      {/* FINESTRA VETRINA BLU: DISPONIBILI SULLE PIATTAFORME DELL'UTENTE   */}
      {/* ================================================================= */}
      <div
        onTouchStart={handleWindowTouchStart}
        onTouchEnd={handleWindowTouchEnd}
        onClick={handleShowcaseClick}
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

        {/* 1. HEADER: TITOLO A SINISTRA, TASTO PIATTAFORME UTENTE IN ALTO A DESTRA */}
        <div className="relative z-10 flex items-center justify-between px-3.5 pt-3 shrink-0 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">📺</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-white drop-shadow-xs truncate">
              SULLE TUE PIATTAFORME
            </h3>
          </div>

          <MobileUserPlatformsButton
            variant="showcase-glass"
            onOpenModal={onOpenPlatformsModal}
          />
        </div>

        {/* 2. CORPO VETRINA: LOCANDINA A SX, TITOLO E BADGE PIATTAFORME A DX */}
        {activeItem && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleShowcaseClick();
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

              <div className="flex items-center flex-wrap gap-1.5">
                {activeItem.matchedProviders.slice(0, 3).map((prov) => {
                  const pLogo = prov.logo_path
                    ? `https://image.tmdb.org/t/p/w92${prov.logo_path}`
                    : null;
                  return (
                    <span
                      key={prov.provider_id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-extrabold text-white backdrop-blur-xs"
                    >
                      {pLogo ? (
                        <img
                          src={pLogo}
                          alt=""
                          className="w-3.5 h-3.5 rounded-[4px] object-cover bg-white shrink-0"
                        />
                      ) : (
                        <TvIcon className="w-3 h-3 text-white shrink-0" />
                      )}
                      <span className="truncate max-w-[100px]">{prov.provider_name}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. PALLINI INDICATORI SEQUENZA IN BASSO */}
        {showcaseItems.length > 1 && (
          <div className="relative z-10 flex items-center justify-center gap-1 pb-2">
            {showcaseItems.map((entry, idx) => (
              <button
                key={entry.movie.tmdb_id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* LISTA COMPLETA: FILM DEL CATALOGO DISPONIBILI IN STREAMING        */}
      {/* ================================================================= */}
      <div className="space-y-2.5 pt-1">
        <div className="px-1 flex items-center justify-between">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-700">
            Disponibili nel tuo Catalogo
          </h3>
          <span className="text-[10px] font-bold text-gray-400">
            {items.length} {items.length === 1 ? 'film' : 'film'}
          </span>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const itemPoster = resolveMovieMediaUrl(
              item.movie.custom_poster_path || item.movie.poster_path,
              'w200'
            );
            const relYear = (
              item.movie.release_date ||
              item.movie.italy_release_date ||
              ''
            ).slice(0, 4);

            return (
              <div
                key={item.movie.tmdb_id}
                onClick={() => onOpenMovieDetail(item.movie)}
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

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.matchedProviders.slice(0, 3).map((prov) => {
                      const pLogo = prov.logo_path
                        ? `https://image.tmdb.org/t/p/w92${prov.logo_path}`
                        : null;
                      return (
                        <span
                          key={prov.provider_id}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200/60"
                        >
                          {pLogo && (
                            <img
                              src={pLogo}
                              alt=""
                              className="w-3 h-3 rounded-[3px] object-cover bg-white shrink-0"
                            />
                          )}
                          <span className="truncate max-w-[95px]">
                            {prov.provider_name}
                          </span>
                        </span>
                      );
                    })}
                    {item.matchedProviders.length > 3 && (
                      <span className="text-[10px] font-bold text-blue-600">
                        +{item.matchedProviders.length - 3}
                      </span>
                    )}
                    {relYear && (
                      <span className="text-[10px] font-bold text-gray-400">
                        {relYear}
                      </span>
                    )}
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
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileMovieStreamingFallbackView;
