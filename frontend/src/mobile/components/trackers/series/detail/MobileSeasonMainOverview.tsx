// src/mobile/components/trackers/series/detail/MobileSeasonMainOverview.tsx
import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import type {
  TMDBEpisode,
  UserSeriesTracking,
  UserSeasonLog,
  SeriesSeasonInfo,
} from '@/types/trackers';
import { StarRating } from '@/components/trackers/shared/detail/StarRating';
import {
  formatRatingHalfStep,
  formatRatingOneDecimal,
  roundRatingToHalfStar,
} from '@/utils/ratingUtils';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';
import {
  MobileWatchActionDrawer,
  type MobileWatchActionTarget,
} from './MobileWatchActionDrawer';

interface MobileSeasonMainOverviewProps {
  seasonNumber: number;
  seasonTitle: string;
  seasonInfo?: SeriesSeasonInfo;
  airDateRange: string | null;
  userTracking: UserSeriesTracking | null;
  episodes: TMDBEpisode[];
  watchedCount: number;
  totalCount: number;
  seasonMinWatchCount: number;
  isHistoricMode?: boolean;
  tmdbSeasonValue: number | null;
  myEpisodesAverage: number | null;
  myEpisodesRatedCount: number;
  friendsAverage: number | null;
  mySeasonAverage: number | null;
  mySeasonRatedCount: number;
  logs: UserSeasonLog[];
  onOpenFriendsReviews: () => void;
  onOpenMyReviews: () => void;
}

export const MobileSeasonMainOverview: React.FC<MobileSeasonMainOverviewProps> = ({
  seasonNumber,
  seasonTitle,
  seasonInfo,
  airDateRange,
  userTracking,
  episodes,
  watchedCount,
  totalCount,
  seasonMinWatchCount,
  isHistoricMode = false,
  tmdbSeasonValue,
  myEpisodesAverage,
  myEpisodesRatedCount,
  friendsAverage,
  mySeasonAverage,
  mySeasonRatedCount,
  logs,
  onOpenFriendsReviews,
  onOpenMyReviews,
}) => {
  const [drawerTarget, setDrawerTarget] = useState<MobileWatchActionTarget | null>(null);
  const { toggleEpisodeWatched } = useTrackersMutations();

  const isWatched = seasonMinWatchCount > 0;

  // Mantiene il valore TMDB esatto su scala 0-5 (senza arrotondamento a 0.5) per mostrare il 1° decimale 1..9
  const rawTmdbSeasonValue =
    typeof seasonInfo?.vote_average === 'number' && seasonInfo.vote_average > 0
      ? seasonInfo.vote_average / 2
      : tmdbSeasonValue;

  const formattedTmdb = formatRatingOneDecimal(rawTmdbSeasonValue);
  const formattedFriends = formatRatingHalfStep(friendsAverage);
  const roundedEpisodesAvg =
    myEpisodesAverage !== null ? roundRatingToHalfStar(myEpisodesAverage) : null;
  const roundedSeasonAvg =
    mySeasonAverage !== null ? roundRatingToHalfStar(mySeasonAverage) : null;

  const handleCircleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userTracking) {
      showTrackerToast('Aggiungi prima la serie alla tua libreria', 'warning');
      return;
    }
    if (isWatched) {
      setDrawerTarget({
        type: 'season',
        id: seasonNumber,
        title: seasonTitle,
        seasonNumber,
        watchCount: seasonMinWatchCount,
      });
    } else {
      episodes.forEach((ep) => {
        if ((ep.watch_count || 0) === 0) {
          toggleEpisodeWatched({ episode_id: ep.id, watched: true, is_historic: isHistoricMode });
        }
      });
    }
  };

  const handleDrawerAddWatch = () => {
    episodes.forEach((ep) => {
      toggleEpisodeWatched({ episode_id: ep.id, watched: true, is_historic: isHistoricMode });
    });
  };

  const handleDrawerResetWatch = () => {
    episodes.forEach((ep) => {
      const count = ep.watch_count || 0;
      for (let i = 0; i < count; i++) {
        toggleEpisodeWatched({ episode_id: ep.id, watched: false });
      }
    });
  };

  const handleDrawerSubWatch = () => {
    episodes.forEach((ep) => {
      toggleEpisodeWatched({ episode_id: ep.id, watched: false });
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-8 select-none animate-fadeIn">
      {/* 1. Riga metadati: conteggio episodi + range date & pallino visto (il titolo resta solo sul banner in alto) */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200/80 pb-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-blue-600 font-black text-xs uppercase tracking-wider shrink-0">
            {watchedCount}/{totalCount} ep.
          </span>
          {airDateRange && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-medium text-xs shrink-0">{airDateRange}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleCircleClick}
          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0 ${
            isWatched
              ? 'bg-blue-600 border border-blue-600 text-white'
              : 'border-2 border-gray-300 hover:border-blue-400 bg-white text-transparent'
          }`}
          title={
            isWatched
              ? `Tutta la stagione vista (${seasonMinWatchCount}x)`
              : 'Segna tutta la stagione come vista'
          }
          aria-label="Segna stagione vista"
        >
          {seasonMinWatchCount > 1 ? (
            <span className="text-[10px] font-black leading-none">
              X{seasonMinWatchCount}
            </span>
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
        </button>
      </div>

      {/* 2. Barra Voti bilanciata a 4 colonne su riga singola: TMDB | Media Ep. | Stagione | Amici */}
      <div className="w-full bg-white border border-gray-200/90 rounded-2xl px-1.5 py-3 shadow-2xs flex items-center shrink-0">
        {/* Colonna 1: TMDB (1 decimale + stella) */}
        <div className="flex-[0.85] min-w-0 flex flex-col items-center justify-center gap-1 px-1">
          <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">
            TMDB
          </span>
          {formattedTmdb ? (
            <div className="inline-flex items-center gap-0.5">
              <span className="text-xs min-[390px]:text-sm font-black text-gray-800 tabular-nums leading-none">
                {formattedTmdb}
              </span>
              <Star className="w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 fill-yellow-400 text-yellow-400 shrink-0" />
            </div>
          ) : (
            <span className="text-gray-400 font-medium text-xs leading-none">--</span>
          )}
        </div>

        <div className="w-px h-9 bg-gray-200 shrink-0" />

        {/* Colonna 2: Media Episodi (5 stelle gialle arrotondate a 0.5) */}
        <div
          className="flex-[1.35] min-w-0 flex flex-col items-center justify-center gap-1 px-1"
          title={
            roundedEpisodesAvg !== null
              ? `Media su ${myEpisodesRatedCount} episodi valutati`
              : 'Nessun episodio valutato'
          }
        >
          <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
            Media Ep.
          </span>
          {roundedEpisodesAvg !== null ? (
            <StarRating
              value={roundedEpisodesAvg}
              hideNumber
              readonly
              gapClassName="gap-0.5"
              iconClassName="w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4"
              activeColorClass="text-yellow-400"
            />
          ) : (
            <span className="text-gray-400 font-medium text-xs leading-none">--</span>
          )}
        </div>

        <div className="w-px h-9 bg-gray-200 shrink-0" />

        {/* Colonna 3: Voto Stagione (5 stelle ambra arrotondate a 0.5 o Aggiungilo! nero bold) */}
        <div className="flex-[1.35] min-w-0 flex flex-col items-center justify-center px-1">
          {roundedSeasonAvg !== null ? (
            <button
              type="button"
              onClick={onOpenMyReviews}
              className="flex flex-col items-center gap-1 hover:bg-gray-50 active:scale-[0.98] rounded-xl px-1 py-1 -my-1 transition-all cursor-pointer group"
              title={`Media basata su ${mySeasonRatedCount} ${
                mySeasonRatedCount === 1 ? 'voto stagione' : 'voti stagione'
              }`}
            >
              <span className="text-[9.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap group-hover:text-blue-600 transition-colors">
                Stagione
              </span>
              <StarRating
                value={roundedSeasonAvg}
                hideNumber
                readonly
                gapClassName="gap-0.5"
                iconClassName="w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4"
                activeColorClass="text-amber-600"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenMyReviews}
              className="flex flex-col items-center justify-center gap-0.5 hover:bg-gray-50 active:scale-[0.98] rounded-xl px-1 py-1 -my-1 transition-all cursor-pointer"
            >
              <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider leading-tight whitespace-nowrap">
                {logs.length > 0 ? `${logs.length} senza voto` : 'Stagione'}
              </span>
              <span className="text-[11px] font-black text-gray-900 leading-tight">
                Aggiungilo!
              </span>
            </button>
          )}
        </div>

        <div className="w-px h-9 bg-gray-200 shrink-0" />

        {/* Colonna 4: Amici (media arrotondata per 0.5 + stella, cliccabile) */}
        <button
          type="button"
          onClick={onOpenFriendsReviews}
          className="flex-[0.85] min-w-0 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 active:scale-[0.96] rounded-xl px-1 py-1 -my-1 transition-all group"
        >
          <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
            Amici
          </span>
          {formattedFriends ? (
            <div className="inline-flex items-center gap-0.5">
              <span className="text-xs min-[390px]:text-sm font-black text-gray-800 tabular-nums leading-none">
                {formattedFriends}
              </span>
              <Star className="w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 fill-yellow-400 text-yellow-400 shrink-0" />
            </div>
          ) : (
            <span className="text-gray-400 font-medium text-xs leading-none">--</span>
          )}
        </button>
      </div>

      {/* 3. Sinossi Stagione a tutta larghezza (la locandina è ora adattata nel banner in alto) */}
      <div>
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
          Sinossi Stagione
        </h4>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          {seasonInfo?.overview && seasonInfo.overview.trim().length > 0
            ? seasonInfo.overview
            : 'Nessuna descrizione disponibile per questa stagione.'}
        </p>
      </div>

      <MobileWatchActionDrawer
        isOpen={drawerTarget !== null}
        onClose={() => setDrawerTarget(null)}
        target={drawerTarget}
        onAddWatch={handleDrawerAddWatch}
        onResetWatch={handleDrawerResetWatch}
        onSubWatch={handleDrawerSubWatch}
      />
    </div>
  );
};
