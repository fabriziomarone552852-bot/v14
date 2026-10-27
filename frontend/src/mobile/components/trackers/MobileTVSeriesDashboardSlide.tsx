import React from 'react';
import type { TVSeries, SeriesQuote, MediaList } from '@/types/trackers';
import { HighlightCardItem } from './HighlightCardItem';
import { MobileSeriesDashboardBanners } from './MobileSeriesDashboardBanners';
import { MobileTrackerGoalBar, MobileTrackerDailyQuote } from './shared';

export interface MobileTVSeriesDashboardSlideProps {
  activePageIndex?: number;
  className?: string;
  goalPercent: number;
  currentEpisodes: number;
  goal: number;
  lastWatched: TVSeries | null;
  lastAdded: TVSeries | null;
  lastCompleted: TVSeries | null;
  myQuotes: SeriesQuote[] | undefined;
  series: TVSeries[] | undefined;
  myLists: MediaList[] | undefined;
  onOpenSeriesDetail: (series: TVSeries | Partial<TVSeries>) => void;
  onOpenStats: () => void;
  onOpenCatalog: () => void;
  onOpenPersonalLists: (list?: MediaList) => void;
}

export const MobileTVSeriesDashboardSlide: React.FC<MobileTVSeriesDashboardSlideProps> = ({
  activePageIndex = 2,
  className = '',
  goalPercent,
  currentEpisodes,
  goal,
  lastWatched,
  lastAdded,
  lastCompleted,
  myQuotes,
  series,
  myLists,
  onOpenSeriesDetail,
  onOpenStats,
  onOpenCatalog,
  onOpenPersonalLists,
}) => {
  // Calcolo deterministico citazione del giorno tra quelle salvate
  const todayDateStr = new Date().toISOString().split('T')[0];
  const dateHash = todayDateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const dailyQuote = myQuotes && myQuotes.length > 0 ? myQuotes[dateHash % myQuotes.length] : null;

  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden p-2 gap-2 transition-all duration-300 ease-out ${
        className || (activePageIndex === 2 ? 'translate-x-0 pointer-events-auto z-10' : 'translate-x-full pointer-events-none z-0')
      }`}
    >
      {/* 1. OBIETTIVO ANNUALE EPISODI (STANDARD TRACKER GOAL BAR) */}
      <MobileTrackerGoalBar
        title="Episodi visti nell'anno"
        current={currentEpisodes}
        goal={goal}
        goalPercent={goalPercent}
        onOpenStats={onOpenStats}
      />

      {/* 2. CITAZIONE DEL GIORNO (STANDARD TRACKER DAILY QUOTE) */}
      <MobileTrackerDailyQuote
        quoteText={dailyQuote?.quote_text}
        sourceTitle={dailyQuote?.series_title}
        sourceDetail={
          dailyQuote?.season_number && dailyQuote?.episode_number
            ? `(S${String(dailyQuote.season_number).padStart(2, '0')}E${String(dailyQuote.episode_number).padStart(2, '0')})`
            : null
        }
        placeholderText="Aggiungi citazioni dalle tue serie TV preferite"
      />

      {/* 3. LE 3 CARD IN EVIDENZA SULLA STESSA RIGA (EQUILIBRATE TRA LORO E DAI BORDI DELLO SCHERMO) */}
      <div className="shrink-0 -mx-2 flex items-center justify-evenly py-0.5">
        <div className="w-[26%] max-w-[96px]">
          <HighlightCardItem
            type="added"
            seriesItem={lastAdded}
            onClick={() => lastAdded && onOpenSeriesDetail(lastAdded)}
          />
        </div>
        <div className="w-[26%] max-w-[96px]">
          <HighlightCardItem
            type="watching"
            seriesItem={lastWatched}
            onClick={() => lastWatched && onOpenSeriesDetail(lastWatched)}
          />
        </div>
        <div className="w-[26%] max-w-[96px]">
          <HighlightCardItem
            type="completed"
            seriesItem={lastCompleted}
            onClick={() => lastCompleted && onOpenSeriesDetail(lastCompleted)}
          />
        </div>
      </div>

      {/* 4. LE DUE AREE BIANCHE INFERIORI: LE TUE SERIE E LE TUE LISTE */}
      <MobileSeriesDashboardBanners
        series={series}
        myLists={myLists}
        onOpenSeriesDetail={onOpenSeriesDetail}
        onOpenCatalog={onOpenCatalog}
        onOpenPersonalLists={onOpenPersonalLists}
      />
    </div>
  );
};

export default MobileTVSeriesDashboardSlide;
