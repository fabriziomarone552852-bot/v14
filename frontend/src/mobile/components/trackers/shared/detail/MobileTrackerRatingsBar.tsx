import React from 'react';
import { Star } from 'lucide-react';
import { StarRating } from '@/components/trackers/shared/detail/StarRating';
import { formatRatingHalfStep, formatRatingOneDecimal } from '@/utils/ratingUtils';

export interface MobileTrackerRatingsBarProps {
  tmdbValue: number | null;
  myAverage?: number | null;
  friendsAverage: number | null;
  ratedLogsCount?: number;
  onOpenMyReviews?: () => void;
  onOpenAddOrMyReviews?: () => void;
  onOpenFriendsReviews: () => void;
  /** Contenuto personalizzato opzionale per la colonna centrale (es. dettaglio stagione con Media Episodi + Voti Stagione) */
  centerContent?: React.ReactNode;
}

/**
 * Barra voti Mobile unificata su riga singola per Episodi, Stagioni, Serie TV e Film:
 * - Sinistra: TMDB (numero arrotondato al primo decimale 1..9 + stella simbolica)
 * - Centro: Il Tuo Voto (media personale a 5 stelle o contenuto centrale personalizzato)
 * - Destra: Amici (media arrotondata per 0.5 + stella simbolica, cliccabile)
 */
export const MobileTrackerRatingsBar: React.FC<MobileTrackerRatingsBarProps> = ({
  tmdbValue,
  myAverage = null,
  friendsAverage,
  ratedLogsCount = 0,
  onOpenMyReviews,
  onOpenAddOrMyReviews,
  onOpenFriendsReviews,
  centerContent,
}) => {
  const formattedTmdb = formatRatingOneDecimal(tmdbValue);
  const formattedFriends = formatRatingHalfStep(friendsAverage);

  return (
    <div className="w-full bg-white border border-gray-200/90 rounded-2xl px-2 py-3 shadow-2xs flex items-center justify-between gap-1 shrink-0">
      {/* SINISTRA: TMDB (numero 1 decimale + stella simbolica) */}
      <div className="flex-[0.9] min-w-0 flex flex-col items-center justify-center gap-1 px-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          TMDB
        </span>
        {formattedTmdb ? (
          <div className="inline-flex items-center gap-1">
            <span className="text-sm font-black text-gray-800 tabular-nums leading-none">
              {formattedTmdb}
            </span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" />
          </div>
        ) : (
          <span className="text-gray-400 font-medium text-xs leading-none">--</span>
        )}
      </div>

      <div className="w-px self-stretch min-h-9 my-0.5 bg-gray-200 shrink-0" />

      {/* CENTRO: contenuto custom oppure IL TUO VOTO (media personale a 5 stelle) */}
      <div className="flex-[1.6] min-w-0 flex flex-col items-center justify-center px-1">
        {centerContent ? (
          centerContent
        ) : myAverage !== null ? (
          <button
            type="button"
            onClick={onOpenMyReviews}
            className="flex flex-col items-center gap-1 hover:bg-gray-50 active:scale-[0.98] rounded-xl px-2 py-1 -my-1 transition-all cursor-pointer group"
            title={`Media basata su ${ratedLogsCount} ${ratedLogsCount === 1 ? 'voto' : 'voti'}`}
          >
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
              Il Tuo Voto
            </span>
            <div className="flex items-center">
              <StarRating value={myAverage} hideNumber readonly iconClassName="w-5 h-5" />
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAddOrMyReviews}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 -my-1 hover:bg-gray-50 active:scale-[0.98] rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-tight text-center">
              Ancora nessun voto
            </span>
            <span className="text-xs font-black text-gray-900 leading-tight">Aggiungilo!</span>
          </button>
        )}
      </div>

      <div className="w-px self-stretch min-h-9 my-0.5 bg-gray-200 shrink-0" />

      {/* DESTRA: AMICI (media arrotondata per 0.5 + stella simbolica, cliccabile) */}
      <button
        type="button"
        onClick={onOpenFriendsReviews}
        className="flex-[0.9] min-w-0 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 active:scale-[0.96] rounded-xl px-1 py-1 -my-1 transition-all group"
      >
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
          Amici
        </span>
        {formattedFriends ? (
          <div className="inline-flex items-center gap-1">
            <span className="text-sm font-black text-gray-800 tabular-nums leading-none">
              {formattedFriends}
            </span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" />
          </div>
        ) : (
          <span className="text-gray-400 font-medium text-xs leading-none">--</span>
        )}
      </button>
    </div>
  );
};
