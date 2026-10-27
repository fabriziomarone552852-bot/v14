// src/mobile/components/trackers/movies/MobileMovieDashboardSlide.tsx
import React, { useMemo } from 'react';
import type { Movie, MovieQuote, MovieDetailTarget } from '@/types/movies';
import type { MediaList } from '@/types/trackers';
import { FilmIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import {
  MobileTrackerGoalBar,
  MobileTrackerDailyQuote,
  MobileTrackerHighlightCard,
  MobileTrackerDashboardBanners,
} from '../shared';

export interface MobileMovieDashboardSlideProps {
  activePageIndex?: number;
  className?: string;
  goalPercent: number;
  currentMovies: number;
  goal: number;
  lastAdded: Movie | null;
  lastWatched: Movie | null;
  lastObtained?: Movie | null;
  nextToWatch?: Movie | null;
  myQuotes: MovieQuote[] | undefined;
  movies: Movie[] | undefined;
  myLists: MediaList[] | undefined;
  onOpenMovieDetail: (movie: MovieDetailTarget) => void;
  onOpenStats: () => void;
  onOpenCatalog: () => void;
  onOpenPersonalLists: (list?: MediaList) => void;
}

export const MobileMovieDashboardSlide: React.FC<MobileMovieDashboardSlideProps> = ({
  activePageIndex = 2,
  className = '',
  goalPercent,
  currentMovies,
  goal,
  lastAdded,
  lastWatched,
  lastObtained,
  nextToWatch,
  myQuotes,
  movies,
  myLists,
  onOpenMovieDetail,
  onOpenStats,
  onOpenCatalog,
  onOpenPersonalLists,
}) => {
  // Calcolo deterministico citazione del giorno tra quelle salvate
  const todayDateStr = new Date().toISOString().split('T')[0];
  const dateHash = todayDateStr.split('-').reduce((acc, val) => acc + parseInt(val, 10), 0);
  const dailyQuote = myQuotes && myQuotes.length > 0 ? myQuotes[dateHash % myQuotes.length] : null;

  const getPoster = (m: Movie | null | undefined): string | null => {
    if (!m) return null;
    const raw = m.custom_poster_path || m.poster_path;
    if (!raw) return null;
    return raw.startsWith('http') || raw.startsWith('data:')
      ? raw
      : raw.startsWith('/uploads')
      ? resolveImageUrl(raw)
      : `https://image.tmdb.org/t/p/w300${raw}`;
  };

  // Ultime aggiunte al catalogo per il banner "I TUOI FILM"
  const latestAddedMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    return [...movies].sort((a, b) => {
      const timeA = new Date(a.added_at || a.updated_at || 0).getTime();
      const timeB = new Date(b.added_at || b.updated_at || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });
  }, [movies]);

  const catalogItems = useMemo(() => {
    return latestAddedMovies.map((m) => ({
      id: m.tmdb_id,
      title: m.title,
      posterUrl: getPoster(m),
    }));
  }, [latestAddedMovies]);

  const targetObtained = lastObtained || nextToWatch;

  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden p-2 gap-2 transition-all duration-300 ease-out ${
        className ||
        (activePageIndex === 2
          ? 'translate-x-0 pointer-events-auto z-10'
          : 'translate-x-full pointer-events-none z-0')
      }`}
    >
      {/* 1. OBIETTIVO ANNUALE FILM (STANDARD TRACKER GOAL BAR) */}
      <MobileTrackerGoalBar
        title="Film guardati nell'anno"
        current={currentMovies}
        goal={goal}
        goalPercent={goalPercent}
        onOpenStats={onOpenStats}
      />

      {/* 2. CITAZIONE DEL GIORNO (STANDARD TRACKER DAILY QUOTE) */}
      <MobileTrackerDailyQuote
        quoteText={dailyQuote?.quote_text}
        sourceTitle={dailyQuote?.movie_title}
        placeholderText="Aggiungi citazioni dai tuoi film preferiti"
      />

      {/* 3. LE 3 CARD IN EVIDENZA SULLA STESSA RIGA (AGGIUNTO, OTTENUTO, ULTIMO VISTO) */}
      <div className="shrink-0 -mx-2 flex items-center justify-evenly py-0.5">
        <div className="w-[26%] max-w-[96px]">
          <MobileTrackerHighlightCard
            type="added"
            posterUrl={getPoster(lastAdded)}
            title={lastAdded?.title}
            placeholderIcon={<FilmIcon className="w-5 h-5 opacity-30" />}
            onClick={() => lastAdded && onOpenMovieDetail(lastAdded)}
          />
        </div>

        <div className="w-[26%] max-w-[96px]">
          <MobileTrackerHighlightCard
            type="obtained"
            posterUrl={getPoster(targetObtained)}
            title={targetObtained?.title}
            placeholderIcon={<FilmIcon className="w-5 h-5 opacity-30" />}
            borderColorClass={lastObtained ? 'border-amber-300' : 'border-gray-200/80'}
            onClick={() => targetObtained && onOpenMovieDetail(targetObtained)}
          />
        </div>

        <div className="w-[26%] max-w-[96px]">
          <MobileTrackerHighlightCard
            type="watched"
            posterUrl={getPoster(lastWatched)}
            title={lastWatched?.title}
            placeholderIcon={<FilmIcon className="w-5 h-5 opacity-30" />}
            onClick={() => lastWatched && onOpenMovieDetail(lastWatched)}
          />
        </div>
      </div>

      {/* 4. I DUE BANNER INFERIORI: I TUOI FILM E LE TUE LISTE */}
      <MobileTrackerDashboardBanners
        catalogTitle="I TUOI FILM"
        catalogItems={catalogItems}
        myLists={myLists}
        moviesForLists={movies}
        emptyCatalogMessage="Nessun film ancora a catalogo"
        emptyListsMessage="Nessuna lista creata"
        onOpenCatalog={onOpenCatalog}
        onOpenPersonalLists={onOpenPersonalLists}
        placeholderIcon={<FilmIcon className="w-4 h-4 opacity-40" />}
      />
    </div>
  );
};

export default MobileMovieDashboardSlide;
