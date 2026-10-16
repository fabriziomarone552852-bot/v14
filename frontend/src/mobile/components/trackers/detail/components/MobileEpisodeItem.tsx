// src/mobile/components/trackers/detail/components/MobileEpisodeItem.tsx
import React from 'react';
import { Check, Film, Star } from 'lucide-react';
import type { TMDBEpisode } from '@/types/trackers';

export interface MobileEpisodeItemProps {
  episode: TMDBEpisode;
  rating: number | null;
  onSelect: () => void;
  onCircleClick: (e: React.MouseEvent) => void;
}

export const MobileEpisodeItem: React.FC<MobileEpisodeItemProps> = ({
  episode,
  rating,
  onSelect,
  onCircleClick,
}) => {
  const watchCount = episode.watch_count || 0;
  const isWatched = watchCount > 0;

  return (
    <div
      onClick={onSelect}
      className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 hover:bg-gray-100/60 active:bg-gray-100 cursor-pointer transition-colors"
    >
      {/* Sinistra: Immagine miniatura backdrop (16:9) + Nome/Numero Episodio */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Immagine Still Episodio (16:9) */}
        <div className="w-18 h-10.5 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200/80 shadow-2xs relative">
          {episode.still_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${episode.still_path}`}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <Film className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Codice e Titolo Episodio (font rimpicciolito, pulito) */}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-gray-800 leading-tight line-clamp-1">
            {episode.episode_number}. {episode.title || `Episodio ${episode.episode_number}`}
          </span>
          {episode.air_date && (
            <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
              {episode.air_date}
            </span>
          )}
        </div>
      </div>

      {/* Destra: Media Voto Utente + Pallino / Spunta (NO freccia di apertura) */}
      <div
        className="flex items-center gap-2 shrink-0 ml-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Voto utente episodio (se recensito/valutato) */}
        {rating !== null && (
          <div
            className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60"
            title={`Voto medio recensioni: ${rating.toFixed(1)}`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
            <span>
              {rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Pallino / Spunta Episodio */}
        <button
          type="button"
          onClick={onCircleClick}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-90 ${
            isWatched
              ? 'bg-blue-600 border border-blue-600 text-white'
              : 'border-2 border-gray-300 hover:border-blue-400 bg-white text-transparent'
          }`}
          title={
            isWatched
              ? `Visto ${watchCount}x (tocca per opzioni)`
              : 'Segna come visto'
          }
          aria-label={isWatched ? 'Visto' : 'Non visto'}
        >
          {watchCount > 1 ? (
            <span className="text-[10px] font-black leading-none">
              X{watchCount}
            </span>
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
        </button>
      </div>
    </div>
  );
};
