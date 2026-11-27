import React from 'react';
import { Check, Quote } from 'lucide-react';
import type { TMDBEpisode, UserEpisodeLog } from '@/types/trackers';
import { MobileTrackerRatingsBar } from '../../shared/detail/MobileTrackerRatingsBar';
import {
  MobileWatchActionDrawer,
  type MobileWatchActionTarget,
} from './MobileWatchActionDrawer';

export interface MobileEpisodeMainOverviewProps {
  episode: TMDBEpisode;
  logs: UserEpisodeLog[];
  isWatched: boolean;
  watchCount: number;
  quotesCount: number;
  tmdbValue: number | null;
  myAverage: number | null;
  friendsAverage: number | null;
  onCircleClick: (e: React.MouseEvent) => void;
  onOpenQuotes: () => void;
  onOpenMyReviews: () => void;
  onOpenNewReview: () => void;
  onOpenFriendsReviews: () => void;
  drawerTarget: MobileWatchActionTarget | null;
  onCloseDrawer: () => void;
  onDrawerAddWatch: () => void;
  onDrawerResetWatch: () => void;
  onDrawerSubWatch: () => void;
}

/**
 * Vista principale Mobile del dettaglio Episodio:
 * 1. Intestazione Stagione/Episodio/Data + pallino visto
 * 2. Barra Voti su riga singola in alto (TMDB | Il Tuo Voto | Amici)
 * 3. Sezione Trama e pulsante Citazioni
 */
export const MobileEpisodeMainOverview: React.FC<MobileEpisodeMainOverviewProps> = ({
  episode,
  logs,
  isWatched,
  watchCount,
  quotesCount,
  tmdbValue,
  myAverage,
  friendsAverage,
  onCircleClick,
  onOpenQuotes,
  onOpenMyReviews,
  onOpenNewReview,
  onOpenFriendsReviews,
  drawerTarget,
  onCloseDrawer,
  onDrawerAddWatch,
  onDrawerResetWatch,
  onDrawerSubWatch,
}) => {
  const formattedDate = episode.air_date
    ? new Date(`${episode.air_date}T00:00:00`).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const seasonTitle =
    episode.season_number === 0 ? 'Episodi Speciali' : `Stagione ${episode.season_number}`;
  const seasonEpCode = `${seasonTitle} - Episodio ${episode.episode_number}`;
  const ratedLogsCount = logs.filter((l) => typeof l.rating === 'number').length;

  return (
    <div className="flex flex-col gap-4 pb-8 select-none animate-fadeIn">
      {/* 1. RIGA INTESTAZIONE SUPERIORE: STAGIONE X - EPISODIO X | DATA & PALLINO VISTO */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200/80 pb-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-blue-600 font-black text-xs uppercase tracking-wider">
            {seasonEpCode}
          </span>
          {formattedDate && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-medium text-xs capitalize">
                {formattedDate}
              </span>
            </>
          )}
        </div>

        {/* Pallino visto interattivo (con X1, X2... e cassetto rewatch) */}
        <button
          type="button"
          onClick={onCircleClick}
          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0 ${
            isWatched
              ? 'bg-blue-600 border border-blue-600 text-white'
              : 'border-2 border-gray-300 hover:border-blue-400 bg-white text-transparent'
          }`}
          title={
            isWatched ? `Visto ${watchCount}x (tocca per opzioni)` : 'Segna come visto'
          }
          aria-label={isWatched ? 'Visto' : 'Non visto'}
        >
          {watchCount > 1 ? (
            <span className="text-[10px] font-black leading-none">X{watchCount}</span>
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
        </button>
      </div>

      {/* 2. SEZIONE VOTI IN ALTO SU RIGA SINGOLA (SOPRA TRAMA E CITAZIONI) */}
      <MobileTrackerRatingsBar
        tmdbValue={tmdbValue}
        myAverage={myAverage}
        friendsAverage={friendsAverage}
        ratedLogsCount={ratedLogsCount}
        onOpenMyReviews={onOpenMyReviews}
        onOpenAddOrMyReviews={logs.length > 0 ? onOpenMyReviews : onOpenNewReview}
        onOpenFriendsReviews={onOpenFriendsReviews}
      />

      {/* 3. TRAMA DELL'EPISODIO E CITAZIONI */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Trama
          </h4>

          {/* Pulsante Citazioni con pallino per il conteggio */}
          <button
            type="button"
            onClick={onOpenQuotes}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              quotesCount > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Citazioni episodio"
          >
            <Quote className="w-3 h-3" />
            <span>Citazioni</span>
            {quotesCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black flex items-center justify-center -mr-0.5">
                {quotesCount}
              </span>
            )}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          {episode.overview && episode.overview.trim().length > 0
            ? episode.overview
            : 'Nessuna descrizione o trama disponibile per questo episodio.'}
        </p>
      </div>

      {/* Drawer azioni rewatch per l'episodio */}
      <MobileWatchActionDrawer
        isOpen={drawerTarget !== null}
        onClose={onCloseDrawer}
        target={drawerTarget}
        onAddWatch={onDrawerAddWatch}
        onResetWatch={onDrawerResetWatch}
        onSubWatch={onDrawerSubWatch}
      />
    </div>
  );
};
