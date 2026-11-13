// src/components/trackers/movies/UpcomingMoviesWidget.tsx
import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileCinemaProvinceModal } from '@/mobile/components/trackers/movies/cinema/MobileCinemaProvinceModal';
import {
  useUpcomingMoviesCarousel,
  formatDateIt,
} from '@/hooks/trackers/useUpcomingMoviesCarousel';
import type { Movie, MovieDetailTarget } from '@/types/movies';

export interface UpcomingMoviesWidgetProps {
  movies?: Movie[];
  openMovieDetail: (movie: MovieDetailTarget) => void;
}

export const UpcomingMoviesWidget: React.FC<UpcomingMoviesWidgetProps> = ({
  movies = [],
  openMovieDetail,
}) => {
  const {
    carouselContainerRef,
    provinces,
    selectedProvinceSlug,
    currentProvince,
    isProvinceModalOpen,
    setIsProvinceModalOpen,
    handleSelectProvince,
    visibleItems,
    total,
    isLoading,
    isAnimating,
    stepNext,
    setStartIndex,
  } = useUpcomingMoviesCarousel(movies);

  return (
    <div
      ref={carouselContainerRef}
      className="relative flex flex-col w-full justify-start overflow-visible select-none overscroll-x-none touch-pan-y"
    >
      {/* 1. PILL PROVINCIA: posizionata nello spazio vuoto sopra le locandine piccole (tra top grande e top piccole) */}
      <button
        type="button"
        onClick={() => setIsProvinceModalOpen(true)}
        className={`absolute ${
          total === 0 ? 'top-2' : 'top-5'
        } right-1.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/90 hover:bg-blue-100 text-blue-700 font-extrabold text-[11px] border border-blue-200/70 shadow-2xs transition-all active:scale-95 cursor-pointer backdrop-blur-xs`}
        title="Cambia provincia per gli orari cinema"
      >
        <span>📍 {currentProvince.name}</span>
      </button>

      {/* 2. LOCANDINE FILM ALLINEATE IN BASSO (items-end) CON CAROSELLO CONTINUO A SCATTO O EMPTYSTATE */}
      <div className="relative flex items-end justify-start overflow-x-clip overflow-y-visible pt-1.5 pb-2 px-1.5">
        {isLoading ? (
          <div className="w-full flex justify-center items-center h-[180px] pt-8 text-gray-400 text-xs">
            Caricamento film in sala...
          </div>
        ) : total === 0 ? (
          <div className="w-full flex justify-center items-center h-[180px] pt-8">
            <EmptyState message="Non ci sono film in sala al momento" />
          </div>
        ) : (
          <div className="flex items-end gap-3.5 w-full overflow-x-clip overflow-y-visible relative">
            {visibleItems.map(({ item, originalIndex }, slotIdx) => {
              const isFirst = slotIdx === 0;
              const isSecond = slotIdx === 1;

              const posterUrl = item.posterPath
                ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                : '/no-poster.png';

              if (isFirst) {
                // PRIMA LOCANDINA: PIÙ GRANDE IN PRIMO PIANO (ancorata al margine inferiore)
                const firstSizeAndAnim =
                  isAnimating === 'next'
                    ? 'w-0 -mr-3.5 -translate-x-full opacity-0 scale-75 origin-bottom-left border-0 pointer-events-none'
                    : isAnimating === 'prev'
                      ? 'w-[130px] translate-x-3 opacity-80'
                      : 'w-[130px] opacity-100 scale-100';

                return (
                  <div
                    key={`${item.id}-slot0`}
                    onClick={() => {
                      if (isAnimating) return;
                      openMovieDetail({
                        tmdb_id: item.id > 0 ? item.id : 0,
                        title: item.title,
                        poster_path: item.posterPath,
                      });
                    }}
                    className={`${firstSizeAndAnim} shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-md relative border-2 cursor-pointer transition-all duration-300 ease-in-out group z-10 hover:shadow-xl hover:scale-[1.02] ${
                      item.isInCinema
                        ? 'border-amber-400 shadow-amber-200/50'
                        : 'border-blue-400 shadow-blue-200/50'
                    }`}
                    title="Clicca per aprire la scheda del film"
                  >
                    <img
                      src={posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Badge compatto superiore */}
                    <div className="absolute top-0 inset-x-0 p-2 flex flex-col gap-1 items-start bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                      {item.isInCinema ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 shadow-xs">
                          🎬 In sala
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                          {formatDateIt(item.releaseDateStr)}
                        </span>
                      )}
                    </div>

                    {/* Dettagli inferiori sfumati sulla locandina */}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end">
                      <p className="text-white font-extrabold text-xs leading-snug line-clamp-2 drop-shadow-md">
                        {item.title}
                      </p>
                      <p className="text-[10px] font-bold text-gray-300 mt-0.5 tracking-wide">
                        {item.isInCinema
                          ? `Dal ${formatDateIt(item.releaseDateStr)}`
                          : item.daysUntilText}
                      </p>
                    </div>
                  </div>
                );
              }

              // LOCANDINE SUCCESSIVE: PIÙ PICCOLE, ALLINEATE IN BASSO, CLICCABILI PER SCORRERE
              const isPromotingSecond = isAnimating === 'next' && isSecond;
              const followerAnimClass = isPromotingSecond
                ? `w-[130px] rounded-2xl border-2 z-20 ${
                    item.isInCinema
                      ? 'border-amber-400 shadow-md shadow-amber-200/50'
                      : 'border-blue-400 shadow-md shadow-blue-200/50'
                  }`
                : `w-[90px] rounded-xl border-2 border-transparent hover:border-blue-400 ${
                    isAnimating === 'prev' ? 'translate-x-3 opacity-80' : ''
                  }`;

              return (
                <div
                  key={`${item.id}-slot-${slotIdx}`}
                  onClick={() => {
                    if (isAnimating) return;
                    if (isSecond) {
                      stepNext();
                    } else {
                      setStartIndex(originalIndex);
                    }
                  }}
                  className={`${followerAnimClass} shrink-0 aspect-[2/3] overflow-hidden shadow-xs relative cursor-pointer transition-all duration-300 ease-in-out group hover:scale-105 hover:shadow-md`}
                  title="Clicca per portare in primo piano"
                >
                  <img
                    src={posterUrl}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-opacity ${
                      isPromotingSecond ? 'opacity-100' : 'opacity-75 group-hover:opacity-100'
                    }`}
                    loading="lazy"
                  />

                  {/* Badge compatto superiore */}
                  <div className="absolute top-0 inset-x-0 p-1.5 flex items-start justify-between bg-gradient-to-b from-black/75 to-transparent">
                    {item.isInCinema ? (
                      <span className="text-[10px] drop-shadow-xs" title="In sala">
                        🍿
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-blue-300 uppercase drop-shadow-xs">
                        {formatDateIt(item.releaseDateStr)}
                      </span>
                    )}
                  </div>

                  {/* Titolo sfumato inferiore */}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="text-white font-bold text-[10px] leading-tight line-clamp-1 drop-shadow-xs">
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MODALE CAMBIO PROVINCIA */}
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

export default UpcomingMoviesWidget;
