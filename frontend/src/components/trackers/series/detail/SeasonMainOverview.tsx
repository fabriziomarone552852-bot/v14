// src/components/trackers/series/detail/SeasonMainOverview.tsx
import React from 'react';
import type { SeriesSeasonInfo, UserSeasonLog } from '@/types/trackers';
import { StarRating } from '@/components/trackers/shared/detail/StarRating';

interface SeasonMainOverviewProps {
  seasonTitle: string;
  seasonInfo?: SeriesSeasonInfo;
  airDateRange: string | null;
  posterUrl: string;
  watchedCount: number;
  totalCount: number;
  isSeasonWatched: boolean;
  onBack: () => void;
  onToggleSeasonWatched: () => void;
  tmdbValue: number | null;
  myEpisodesAverage: number | null;
  myEpisodesRatedCount: number;
  friendsAverage: number | null;
  mySeasonAverage: number | null;
  mySeasonRatedCount: number;
  logs: UserSeasonLog[];
  onOpenFriendsReviews: () => void;
  onOpenMyReviews: () => void;
}

export const SeasonMainOverview: React.FC<SeasonMainOverviewProps> = ({
  seasonTitle,
  seasonInfo,
  airDateRange,
  posterUrl,
  watchedCount,
  totalCount,
  isSeasonWatched,
  onBack,
  onToggleSeasonWatched,
  tmdbValue,
  myEpisodesAverage,
  myEpisodesRatedCount,
  friendsAverage,
  mySeasonAverage,
  mySeasonRatedCount,
  logs,
  onOpenFriendsReviews,
  onOpenMyReviews,
}) => {
  return (
    <div className="flex flex-col h-full min-h-0 animate-fadeIn">
      {/* Intestazione a riga singola */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4 mb-5 shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors cursor-pointer shrink-0"
            title="Torna alle stagioni"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight truncate">
              {seasonTitle}
            </h2>
            <span className="text-gray-300 shrink-0">|</span>
            <span className="text-sm font-semibold text-gray-600 shrink-0">
              {watchedCount}/{totalCount} episodi visti
            </span>
            {airDateRange && (
              <>
                <span className="text-gray-300 shrink-0">|</span>
                <span className="text-sm font-medium text-gray-500 shrink-0">
                  {airDateRange}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSeasonWatched}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-sm cursor-pointer shrink-0 ${
            isSeasonWatched
              ? 'bg-blue-500 text-white shadow-md'
              : 'border-2 border-gray-300 text-transparent hover:border-blue-400'
          }`}
          title={isSeasonWatched ? 'Segna stagione come non vista' : 'Segna tutta la stagione come vista'}
        >
          <svg
            className={`w-5 h-5 ${isSeasonWatched ? '' : 'text-gray-300'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      {/* Corpo principale a 2 colonne a tutta altezza: Locandina a sinistra | Sinossi (scrollabile) + Voti 2x2 in basso a destra */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Colonna Sinistra: Locandina */}
        <div className="w-64 shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-md aspect-[2/3] self-start max-h-full">
          <img
            src={posterUrl}
            alt={seasonTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Colonna Destra: Sinossi scrollabile espansa + 4 Voti ancorati in basso */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full">
          {/* Solo la sinossi ha lo scroll */}
          <div className="flex-1 min-h-0 flex flex-col">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-2 shrink-0">
              Sinossi Stagione
            </h4>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 text-sm text-gray-700 leading-relaxed">
              {seasonInfo?.overview && seasonInfo.overview.trim().length > 0 ? (
                <p className="whitespace-pre-line">{seasonInfo.overview}</p>
              ) : (
                <p className="italic text-gray-400">
                  Nessuna descrizione disponibile per questa stagione.
                </p>
              )}
            </div>
          </div>

          {/* Sezione 4 Voti (stile Episodi, 2x2 ancorata in basso) */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3 shrink-0">
            {/* Riga 1: TMDB | Amici */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
              <div className="flex flex-col items-center gap-1.5 px-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  TMDB
                </span>
                <div className="flex items-center">
                  {tmdbValue !== null ? (
                    <StarRating value={tmdbValue} hideNumber readonly iconClassName="w-5 h-5" />
                  ) : (
                    <span className="text-gray-400 font-medium">--</span>
                  )}
                </div>
              </div>

              <div className="w-px h-10 bg-gray-200" />

              <div
                onClick={onOpenFriendsReviews}
                className="flex flex-col items-center gap-1.5 px-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors py-1.5 group"
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                  Amici
                </span>
                <div className="flex items-center">
                  {friendsAverage !== null ? (
                    <StarRating value={friendsAverage} hideNumber readonly iconClassName="w-5 h-5" />
                  ) : (
                    <span className="text-gray-400 font-medium">--</span>
                  )}
                </div>
              </div>
            </div>

            {/* Riga 2: Media Episodi (Giallo) | Il Tuo Voto Stagione (Ambra) */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-3 border-t border-gray-100">
              <div
                className="flex flex-col items-center gap-1.5 px-2"
                title={
                  myEpisodesAverage !== null
                    ? `Media calcolata su ${myEpisodesRatedCount} episodi valutati`
                    : 'Nessun episodio valutato in questa stagione'
                }
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Media Episodi
                </span>
                <div className="flex items-center">
                  {myEpisodesAverage !== null ? (
                    <StarRating
                      value={myEpisodesAverage}
                      hideNumber
                      readonly
                      iconClassName="w-5 h-5"
                      activeColorClass="text-yellow-400"
                    />
                  ) : (
                    <span className="text-gray-400 font-medium">--</span>
                  )}
                </div>
              </div>

              <div className="w-px h-10 bg-gray-200" />

              <div className="flex flex-col items-center px-2">
                {mySeasonAverage !== null ? (
                  <div
                    onClick={onOpenMyReviews}
                    className="w-full flex flex-col items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded-xl py-1.5 transition-colors border border-transparent hover:border-gray-200 group"
                    title={`Media basata su ${mySeasonRatedCount} recensioni della stagione`}
                  >
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                      Il Tuo Voto ({mySeasonRatedCount})
                    </span>
                    <StarRating
                      value={mySeasonAverage}
                      hideNumber
                      readonly
                      iconClassName="w-5 h-5"
                      activeColorClass="text-amber-600"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenMyReviews}
                    className="w-full max-w-[190px] flex flex-col items-center justify-center gap-0.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {logs.length > 0
                        ? `${logs.length} senza voto`
                        : 'Ancora nessun voto'}
                    </span>
                    <span className="text-xs font-extrabold text-gray-700">
                      Aggiungilo!
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
