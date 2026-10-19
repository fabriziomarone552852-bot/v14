import React, { useState } from 'react';
import type { TVSeries, SeriesQuote, MediaList } from '@/types/trackers';
import { HighlightCardItem } from './HighlightCardItem';
import { MobileSeriesDashboardBanners } from './MobileSeriesDashboardBanners';

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
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);

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
      {/* 1. OBIETTIVO ANNUALE EPISODI (SENZA NUVOLA ATTORNO, SENZA MARGINE, SENZA SFONDO NERO) */}
      <div
        onClick={onOpenStats}
        className="w-full px-2 py-0.5 cursor-pointer select-none active:opacity-85 shrink-0 flex flex-col gap-1"
        title="Tocca per aprire le statistiche dettagliate"
      >
        {/* RIGA SUPERIORE: "Episodi visti nell'anno" a sinistra e simbolo statistiche a destra */}
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider">
            Episodi visti nell'anno
          </span>

          <div className="text-blue-600 flex items-center justify-center p-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* BARRA DI PROGRESSIONE CON BADGE CENTRATO "XXX/YYY" IN SOVRAPPOSIZIONE */}
        <div className="w-full relative py-1 shrink-0">
          {/* Barra di avanzamento sottile e chiara */}
          <div className="w-full h-2 bg-gray-200/90 rounded-full overflow-hidden border border-gray-300/40">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(Math.max(goalPercent, 0), 100)}%` }}
            />
          </div>

          {/* Badge fisso e centrato in sovrapposizione */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="px-2.5 py-0.5 bg-white border-2 border-blue-500 rounded-full shadow-xs flex items-center gap-0.5">
              <span className="text-[11px] font-black text-blue-700 tracking-tight leading-none">
                {currentEpisodes}/{goal}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CITAZIONE DEL GIORNO (STILE AGENDA HOMEPAGE: 2 RIGHE MAX, CLICK PER ESPANDERE) */}
      <div
        onClick={() => setIsQuoteExpanded((prev) => !prev)}
        className="w-full px-2 py-0.5 select-none shrink-0 text-center cursor-pointer transition-all active:opacity-80"
        title="Tocca per leggere la citazione completa"
      >
        {dailyQuote ? (
          <>
            <p
              className={`text-[12px] text-gray-600 italic font-medium leading-snug transition-all ${
                isQuoteExpanded ? '' : 'line-clamp-2'
              }`}
            >
              "{dailyQuote.quote_text}"
            </p>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wide mt-0.5">
              — {dailyQuote.series_title}
              {dailyQuote.season_number && dailyQuote.episode_number && (
                ` (S${String(dailyQuote.season_number).padStart(2, '0')}E${String(dailyQuote.episode_number).padStart(2, '0')})`
              )}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-gray-400 italic">
            "Aggiungi citazioni dalle tue serie TV preferite"
          </p>
        )}
      </div>

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
