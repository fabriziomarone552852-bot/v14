// src/mobile/components/trackers/MobileTVEpisodesTimeline.tsx
import React from 'react';
import type { UpcomingEpisode, TVSeries } from '@/types/trackers';
import { useMobileTVEpisodesTimeline } from '@/mobile/hooks/useMobileTVEpisodesTimeline';
import MobileTVEpisodeHorizontalCard from './MobileTVEpisodeHorizontalCard';
import TimelineLoadingCard from './TimelineLoadingCard';
import TimelineBackToTodayButton from './TimelineBackToTodayButton';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { TvIcon } from '@/components/shared/utils/Icons';

export interface MobileTVEpisodesTimelineProps {
  series?: TVSeries[];
  onEpisodeClick: (episode: UpcomingEpisode) => void;
  onOpenSeriesDetail?: (episode: UpcomingEpisode) => void;
}

export const MobileTVEpisodesTimeline: React.FC<MobileTVEpisodesTimelineProps> = ({
  series,
  onEpisodeClick,
  onOpenSeriesDetail,
}) => {
  const {
    scrollContainerRef,
    todayAnchorRef,
    todayAnchorId,
    episodes,
    hasFutureEpisodes,
    hasReachedStartOfHistory,
    hasReachedEndOfFuture,
    isFetchingEarlier,
    isFetchingLater,
    isLoading,
    isError,
    todayStr,
    bottomPadding,
    isScrolling,
    showBackToToday,
    isTodayAnchorBelow,
    customPosterMap,
    getCleanDate,
    handleScroll,
    handleScrollToToday,
    handleToggleWatch,
    handleResetTimeline,
  } = useMobileTVEpisodesTimeline({ series });

  if (isError && episodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <EmptyState
          icon={<TvIcon className="w-10 h-10 opacity-30 text-gray-500" />}
          message="Impossibile caricare le uscite degli episodi."
        />
        <button
          type="button"
          onClick={handleResetTimeline}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!isLoading && episodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <EmptyState
          icon={<TvIcon className="w-12 h-12 opacity-30 text-gray-500" />}
          message="Nessun episodio in uscita o recente per le serie che stai seguendo."
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col min-h-0">
      {/* SCROLL CONTAINER VERTICALE CON LISTONE CONTINUO */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ paddingBottom: `${bottomPadding}px` }}
        className={`relative flex-1 min-h-0 overflow-y-auto px-1 pt-1 space-y-2 fade-scrollbar ${
          isScrolling ? 'is-scrolling' : ''
        }`}
      >
        {/* MODALITÀ SENZA USCITE FUTURE: AVVISO IN CIMA SEGUITO DALLE USCITE PIÙ RECENTI */}
        {!hasFutureEpisodes && episodes.length > 0 && (
          <div className="mx-1 my-2 p-3 bg-gradient-to-r from-gray-50 to-blue-50/40 dark:from-gray-800/80 dark:to-blue-950/20 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl flex items-center gap-3 shadow-xs animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <TvIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                Nessun'altra uscita futura annunciata per ora.
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5">
                Ultime puntate uscite delle tue serie in ordine cronologico
              </p>
            </div>
          </div>
        )}

        {/* MODALITÀ CON USCITE FUTURE: AVVISO INIZIO STORICO QUANDO NON CI SONO PIÙ PUNTATE PASSATE IN CIMA */}
        {hasFutureEpisodes && hasReachedStartOfHistory && episodes.length > 0 && (
          <div className="py-2.5 px-3 text-center text-[10px] text-gray-400 font-medium italic border-b border-gray-100 bg-gray-50/50">
            Hai raggiunto l'inizio delle uscite delle tue serie
          </div>
        )}

        {/* CARICAMENTO IN CIMA (SOLO PER PASSATO NELLA TIMELINE FUTURA O CARICAMENTO INIZIALE) */}
        {((hasFutureEpisodes && isFetchingEarlier) || (isLoading && episodes.length === 0)) && (
          <TimelineLoadingCard />
        )}

        {/* LISTONE CARD EPISODI */}
        {episodes.map((ep) => {
          const isAnchor = hasFutureEpisodes && ep.episode_id === todayAnchorId;
          const isToday = getCleanDate(ep.air_date) === todayStr;

          return (
            <div
              key={ep.episode_id}
              id={`ep-${ep.episode_id}`}
              data-episode-card="true"
              ref={isAnchor ? todayAnchorRef : undefined}
            >
              <MobileTVEpisodeHorizontalCard
                episode={ep}
                customPosterUrl={customPosterMap.get(ep.series_tmdb_id)}
                onClick={onEpisodeClick}
                onOpenSeriesDetail={onOpenSeriesDetail}
                onToggleWatch={handleToggleWatch}
                isToday={isToday}
              />
            </div>
          );
        })}

        {/* CARICAMENTO IN FONDO: PER IL FUTURO (SE PRESENTE) O PER IL PASSATO (SE SENZA FUTURE) */}
        {((hasFutureEpisodes && isFetchingLater) || (!hasFutureEpisodes && isFetchingEarlier)) && (
          <TimelineLoadingCard />
        )}

        {/* AVVISO FINE LISTA IN FONDO */}
        {hasFutureEpisodes && hasReachedEndOfFuture && episodes.length > 0 && (
          <div className="py-2.5 px-3 text-center text-[10px] text-gray-400 font-medium italic border-t border-gray-100 bg-gray-50/50">
            Nessun'altra uscita futura annunciata
          </div>
        )}

        {!hasFutureEpisodes && hasReachedStartOfHistory && episodes.length > 0 && (
          <div className="py-2.5 px-3 text-center text-[10px] text-gray-400 font-medium italic border-t border-gray-100 bg-gray-50/50">
            Hai raggiunto l'inizio delle uscite delle tue serie
          </div>
        )}
      </div>

      {/* TASTO TONDO "TORNA AD OGGI / TORNA IN CIMA" */}
      <TimelineBackToTodayButton
        visible={showBackToToday}
        isAnchorBelow={isTodayAnchorBelow}
        onClick={handleScrollToToday}
      />
    </div>
  );
};

export default MobileTVEpisodesTimeline;
