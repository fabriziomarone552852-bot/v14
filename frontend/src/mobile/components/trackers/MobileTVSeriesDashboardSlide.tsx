// src/mobile/components/trackers/MobileTVSeriesDashboardSlide.tsx
import React from 'react';
import { GlassCardWidget } from '@/components/trackers/GlassCardWidget';
import { DailyQuoteWidget } from '@/components/trackers/DailyQuoteWidget';
import { UpcomingCalendarWidget } from '@/components/trackers/UpcomingCalendarWidget';
import { UpcomingEpisodesWidget } from '@/components/trackers/UpcomingEpisodesWidget';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { TVSeries, SeriesQuote } from '@/types/trackers';

export interface MobileTVSeriesDashboardSlideProps {
  activePageIndex: number;
  goalViewType: 'percent' | 'fraction';
  setGoalViewType: React.Dispatch<React.SetStateAction<'percent' | 'fraction'>>;
  goalPercent: number;
  currentEpisodes: number;
  goal: number;
  lastWatched: TVSeries | null;
  lastAdded: TVSeries | null;
  lastCompleted: TVSeries | null;
  myQuotes: SeriesQuote[] | undefined;
  isQuoteExpanded: boolean;
  setIsQuoteExpanded: (val: boolean) => void;
  series: TVSeries[] | undefined;
  onOpenSeriesDetail: (series: TVSeries | Partial<TVSeries>) => void;
  onOpenRandom: () => void;
  onOpenStats: () => void;
}

export const MobileTVSeriesDashboardSlide: React.FC<MobileTVSeriesDashboardSlideProps> = ({
  activePageIndex,
  goalViewType,
  setGoalViewType,
  goalPercent,
  currentEpisodes,
  goal,
  lastWatched,
  lastAdded,
  lastCompleted,
  myQuotes,
  isQuoteExpanded,
  setIsQuoteExpanded,
  series,
  onOpenSeriesDetail,
  onOpenRandom,
  onOpenStats,
}) => {
  const handleSelectSeriesWidget = ({
    tmdb_id,
    title,
    poster_path,
  }: {
    tmdb_id: number;
    title: string;
    poster_path?: string | null;
  }) => {
    const match = series?.find((s) => s.tmdb_id === tmdb_id);
    if (match) {
      onOpenSeriesDetail(match);
    } else {
      onOpenSeriesDetail({
        tmdb_id,
        title,
        poster_path,
      } as Partial<TVSeries>);
    }
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col overflow-y-auto px-1 pt-1 pb-4 custom-scrollbar transition-transform duration-300 ease-out space-y-3.5 ${
        activePageIndex === 1
          ? 'translate-x-0 pointer-events-auto'
          : 'translate-x-full pointer-events-none'
      }`}
    >
      {/* 1. OBIETTIVO ANNUALE EPISODI */}
      <div
        onClick={() => setGoalViewType((prev) => (prev === 'percent' ? 'fraction' : 'percent'))}
        className="w-full bg-white rounded-2xl shadow-xs border border-gray-200 p-3.5 cursor-pointer hover:shadow-md transition-shadow select-none relative group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Obiettivo Annuale Episodi
            </span>
          </div>
          <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {goalViewType === 'percent' ? `${goalPercent}%` : `${currentEpisodes}/${goal}`}
          </span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* 2. QUICK ACTIONS BAR (Random Media & Statistiche) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenRandom}
          className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="text-base leading-none">🎲</span>
          <span className="truncate">Cosa guardare?</span>
        </button>

        <button
          type="button"
          onClick={onOpenStats}
          className="py-2.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="text-base leading-none">📊</span>
          <span className="truncate">Statistiche</span>
        </button>
      </div>

      {/* 3. CARD IN EVIDENZA (Continua a guardare, Ultima aggiunta, Completata) */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 px-1">
          In Evidenza
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <GlassCardWidget
            label="Continua a guardare"
            title={lastWatched?.title || 'Nessuna serie'}
            subtitle={lastWatched ? 'In corso' : ''}
            posterPath={
              lastWatched?.custom_poster_path
                ? resolveImageUrl(lastWatched.custom_poster_path)
                : lastWatched?.poster_path || null
            }
            onClick={() => lastWatched && onOpenSeriesDetail(lastWatched)}
          />
          <GlassCardWidget
            label="Ultima aggiunta"
            title={lastAdded?.title || 'Nessuna serie'}
            subtitle=""
            posterPath={
              lastAdded?.custom_poster_path
                ? resolveImageUrl(lastAdded.custom_poster_path)
                : lastAdded?.poster_path || null
            }
            onClick={() => lastAdded && onOpenSeriesDetail(lastAdded)}
          />
          <GlassCardWidget
            label="Completata!"
            title={lastCompleted?.title || 'Nessuna serie'}
            subtitle=""
            posterPath={
              lastCompleted?.custom_poster_path
                ? resolveImageUrl(lastCompleted.custom_poster_path)
                : lastCompleted?.poster_path || null
            }
            onClick={() => lastCompleted && onOpenSeriesDetail(lastCompleted)}
          />
        </div>
      </div>

      {/* 4. PROSSIMI EPISODI */}
      <div className="space-y-1.5 pt-1">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 px-1">
          Prossimi Episodi in Uscita
        </h3>
        <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-xs">
          <UpcomingEpisodesWidget openSeriesDetail={handleSelectSeriesWidget} />
        </div>
      </div>

      {/* 5. CITAZIONE DEL GIORNO */}
      <div className="space-y-1.5 pt-1">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 px-1">
          Citazione del Giorno
        </h3>
        <DailyQuoteWidget
          myQuotes={myQuotes}
          isQuoteExpanded={isQuoteExpanded}
          setIsQuoteExpanded={setIsQuoteExpanded}
        />
      </div>

      {/* 6. CALENDARIO USCITE */}
      <div className="space-y-1.5 pt-1">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 px-1">
          Calendario Mese
        </h3>
        <UpcomingCalendarWidget openSeriesDetail={handleSelectSeriesWidget} />
      </div>
    </div>
  );
};

export default MobileTVSeriesDashboardSlide;
