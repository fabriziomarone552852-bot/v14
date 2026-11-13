import React, { useMemo } from 'react';
import type { TVSeries, SeriesQuote, MediaList } from '@/types/trackers';
import { TvIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import {
  MobileTrackerGoalBar,
  MobileTrackerDailyQuote,
  MobileTrackerHighlightCard,
  MobileTrackerDashboardBanners,
} from '../shared';

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
  onOpenPersonalLists: () => void;
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
  const dateHash = todayDateStr.split('-').reduce((acc, val) => acc + parseInt(val, 10), 0);
  const dailyQuote = myQuotes && myQuotes.length > 0 ? myQuotes[dateHash % myQuotes.length] : null;

  const getPoster = (s: TVSeries | null | undefined, size: 'w200' | 'w300' = 'w300'): string | null => {
    if (!s) return null;
    const rawPoster = s.custom_poster_path
      ? resolveImageUrl(s.custom_poster_path)
      : s.poster_path || s.tmdb_series?.poster_path;
    if (!rawPoster) return null;
    return rawPoster.startsWith('http') || rawPoster.startsWith('data:')
      ? rawPoster
      : rawPoster.startsWith('/uploads')
      ? resolveImageUrl(rawPoster)
      : `https://image.tmdb.org/t/p/${size}${rawPoster}`;
  };

  const catalogItems = useMemo(() => {
    if (!series || series.length === 0) return [];
    const sorted = [...series].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });
    return sorted.map((s) => ({
      id: s.tmdb_id,
      title: s.title,
      posterUrl: getPoster(s, 'w200'),
    }));
  }, [series]);

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
          <MobileTrackerHighlightCard
            type="added"
            posterUrl={getPoster(lastAdded)}
            title={lastAdded?.title}
            placeholderIcon={<TvIcon className="w-5 h-5 opacity-30" />}
            onClick={() => lastAdded && onOpenSeriesDetail(lastAdded)}
          />
        </div>
        <div className="w-[26%] max-w-[96px]">
          <MobileTrackerHighlightCard
            type="watching"
            posterUrl={getPoster(lastWatched)}
            title={lastWatched?.title}
            placeholderIcon={<TvIcon className="w-5 h-5 opacity-30" />}
            onClick={() => lastWatched && onOpenSeriesDetail(lastWatched)}
          />
        </div>
        <div className="w-[26%] max-w-[96px]">
          <MobileTrackerHighlightCard
            type="completed"
            posterUrl={getPoster(lastCompleted)}
            title={lastCompleted?.title}
            placeholderIcon={<TvIcon className="w-5 h-5 opacity-30" />}
            onClick={() => lastCompleted && onOpenSeriesDetail(lastCompleted)}
          />
        </div>
      </div>

      {/* 4. LE DUE AREE BIANCHE INFERIORI: LE TUE SERIE E LE TUE LISTE */}
      <MobileTrackerDashboardBanners
        mediaType="tv"
        catalogTitle="LE TUE SERIE"
        catalogItems={catalogItems}
        myLists={myLists}
        emptyCatalogMessage="Nessuna serie ancora a catalogo"
        emptyListsMessage="Nessuna lista creata"
        onOpenCatalog={onOpenCatalog}
        onOpenPersonalLists={onOpenPersonalLists}
        placeholderIcon={<TvIcon className="w-4 h-4 opacity-40" />}
      />
    </div>
  );
};

export default MobileTVSeriesDashboardSlide;
