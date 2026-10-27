import React from 'react';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';

export interface TMDBMediaCardProps {
  id: number;
  title: string;
  posterPath?: string | null;
  isTracked: boolean;
  status?: string;
  externalStatus?: string | null;
  onCardClick: () => void;
  onAddClick: (e: React.MouseEvent) => void;
}

export const TMDBMediaCard: React.FC<TMDBMediaCardProps> = ({
  title,
  posterPath,
  isTracked,
  status,
  externalStatus,
  onCardClick,
  onAddClick,
}) => {
  const borderColor = getMediaBorderClass(isTracked ? status : undefined, externalStatus);

  return (
    <div
      className="flex flex-col group cursor-pointer w-full relative z-0 hover:z-20"
      onClick={onCardClick}
    >
      <div
        className={`relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-100 shadow-sm border-[3px] transition-all duration-300 group-hover:scale-105 ${borderColor}`}
      >
        {posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/no-poster.png"
            alt="No Poster"
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 p-3">
          <h4 className="font-bold text-white line-clamp-2 text-sm leading-tight drop-shadow-md">
            {title}
          </h4>
        </div>

        {/* Pulsante rapido Aggiungi / In lista */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isTracked) onAddClick(e);
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer ${
              isTracked
                ? 'bg-blue-500 border-2 border-solid border-blue-500 text-white shadow-md'
                : 'bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 text-white hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/90 shadow-sm'
            }`}
            title={isTracked ? 'Già in lista' : 'Aggiungi alla lista'}
          >
            {isTracked ? (
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

export default TMDBMediaCard;
