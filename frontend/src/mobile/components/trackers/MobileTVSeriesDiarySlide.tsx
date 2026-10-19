// src/mobile/components/trackers/MobileTVSeriesDiarySlide.tsx
import React, { useRef, useLayoutEffect, useState } from 'react';
import type { TVSeries, TMDBEpisode } from '@/types/trackers';
import { useMobileTVDiaryLogic } from './diary/hooks/useMobileTVDiaryLogic';
import MobileTVEpisodeDiaryCard from './diary/MobileTVEpisodeDiaryCard';
import MobileTVDiarySectionPill from './diary/MobileTVDiarySectionPill';
import MobileRewatchConfirmModal from './diary/MobileRewatchConfirmModal';
import TimelineBackToTodayButton from './TimelineBackToTodayButton';

export interface MobileTVSeriesDiarySlideProps {
  series: TVSeries[] | undefined;
  activePageIndex: number;
  onOpenEpisode: (series: TVSeries, episode: TMDBEpisode) => void;
  onOpenSeriesDetail: (series: TVSeries) => void;
}

export const MobileTVSeriesDiarySlide: React.FC<MobileTVSeriesDiarySlideProps> = ({
  series,
  activePageIndex,
  onOpenEpisode,
  onOpenSeriesDetail,
}) => {
  const {
    nextToWatch,
    onHold,
    unstarted,
    watchedHistory,
    handleToggleWatch,
    rewatchConfirmTarget,
    setRewatchConfirmTarget,
    handleConfirmSingleWatch,
    handleConfirmRewatchSeries,
  } = useMobileTVDiaryLogic(series);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const hasCenteredInitially = useRef<boolean>(false);
  const [showBackToNext, setShowBackToNext] = useState<boolean>(false);
  const [isAnchorBelow, setIsAnchorBelow] = useState<boolean>(true);

  // Ancoraggio iniziale istantaneo a "I prossimi da guardare" senza animazioni né salti a vista
  useLayoutEffect(() => {
    if (activePageIndex !== 1) return;
    if (hasCenteredInitially.current) return;
    if (!series) return;

    if (anchorRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = anchorRef.current.offsetTop;
      hasCenteredInitially.current = true;
    }
  }, [activePageIndex, series, nextToWatch.length, watchedHistory.length]);

  // Monitoraggio dello scroll per mostrare il pulsante "Torna ai prossimi" se si è nello storico o troppo in basso
  const handleScroll = () => {
    if (!anchorRef.current || !scrollContainerRef.current) return;
    const anchorTop = anchorRef.current.offsetTop;
    const currentScroll = scrollContainerRef.current.scrollTop;

    // Se l'utente è salito nello storico sopra l'ancora
    if (currentScroll < anchorTop - 120) {
      setShowBackToNext(true);
      setIsAnchorBelow(true);
    } else if (currentScroll > anchorTop + 450) {
      setShowBackToNext(true);
      setIsAnchorBelow(false);
    } else {
      setShowBackToNext(false);
    }
  };

  const scrollToNext = () => {
    if (anchorRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: anchorRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  // Apertura modale solo episodio a tutto schermo
  const handleEpisodeCardClick = (targetSeries: TVSeries, targetEpisode: TMDBEpisode) => {
    onOpenEpisode(targetSeries, targetEpisode);
  };

  return (
    <div className="relative h-full w-full flex flex-col min-h-0">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3.5 pt-2 pb-24 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none"
      >
        {/* ================================================================= */}
        {/* 1. SEZIONE STORICO: EPISODI GUARDATI (Scorrendo verso l'alto)    */}
        {/* ================================================================= */}
        {watchedHistory.length > 0 && (
          <div className="flex flex-col gap-2.5 pb-4">
            <MobileTVDiarySectionPill title="Storico puntate viste" />
            <div className="flex flex-col gap-2">
              {watchedHistory.map((item) => (
                <MobileTVEpisodeDiaryCard
                  key={`history-${item.logId}-${item.episode.id}`}
                  series={item.series}
                  episode={item.episode}
                  isWatched={true}
                  watchedDateStr={item.watchedDateStr}
                  onClick={handleEpisodeCardClick}
                  onOpenSeriesDetail={() => onOpenSeriesDetail(item.series)}
                  onToggleWatch={handleToggleWatch}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. ANCORA INIZIALE: I PROSSIMI DA GUARDARE                        */}
        {/* ================================================================= */}
        <div ref={anchorRef} className="pt-1">
          <MobileTVDiarySectionPill title="I prossimi da guardare" />

          {nextToWatch.length === 0 ? (
            <div className="bg-gray-50/90 border border-dashed border-gray-200 rounded-2xl p-4 text-center my-2">
              <p className="text-xs font-bold text-gray-600">Nessun episodio recente da continuare.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Guarda le sezioni sottostanti o inizia una nuova serie.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {nextToWatch.map((item) => (
                <MobileTVEpisodeDiaryCard
                  key={`next-${item.series.id}-${item.episode.id}`}
                  series={item.series}
                  episode={item.episode}
                  remainingCount={item.remainingAfter}
                  onClick={handleEpisodeCardClick}
                  onOpenSeriesDetail={() => onOpenSeriesDetail(item.series)}
                  onToggleWatch={handleToggleWatch}
                />
              ))}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 3. SEZIONE: DA RIPRENDERE (Ferme da oltre 30 giorni)              */}
        {/* ================================================================= */}
        {onHold.length > 0 && (
          <div className="pt-4">
            <MobileTVDiarySectionPill title="Da riprendere" />
            <div className="flex flex-col gap-2">
              {onHold.map((item) => (
                <MobileTVEpisodeDiaryCard
                  key={`onhold-${item.series.id}-${item.episode.id}`}
                  series={item.series}
                  episode={item.episode}
                  remainingCount={item.remainingAfter}
                  onClick={handleEpisodeCardClick}
                  onOpenSeriesDetail={() => onOpenSeriesDetail(item.series)}
                  onToggleWatch={handleToggleWatch}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. SEZIONE: NUOVE SERIE (Non ancora iniziate)                    */}
        {/* ================================================================= */}
        {unstarted.length > 0 && (
          <div className="pt-4">
            <MobileTVDiarySectionPill title="Nuove serie" />
            <div className="flex flex-col gap-2">
              {unstarted.map((item) => (
                <MobileTVEpisodeDiaryCard
                  key={`unstarted-${item.series.id}-${item.episode.id}`}
                  series={item.series}
                  episode={item.episode}
                  remainingCount={item.remainingAfter}
                  onClick={handleEpisodeCardClick}
                  onOpenSeriesDetail={() => onOpenSeriesDetail(item.series)}
                  onToggleWatch={handleToggleWatch}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tasto tondo blu con freccia "Torna ai prossimi" identico a quello in prossime uscite */}
      <TimelineBackToTodayButton
        visible={showBackToNext}
        isAnchorBelow={isAnchorBelow}
        onClick={scrollToNext}
      />

      {/* Modale Dialog di conferma Rewatch */}
      {rewatchConfirmTarget && (
        <MobileRewatchConfirmModal
          isOpen={true}
          onClose={() => setRewatchConfirmTarget(null)}
          seriesTitle={rewatchConfirmTarget.series.title}
          seasonNumber={rewatchConfirmTarget.episode.season_number}
          episodeNumber={rewatchConfirmTarget.episode.episode_number}
          episodeTitle={rewatchConfirmTarget.episode.title}
          currentWatchCount={rewatchConfirmTarget.episode.watch_count || 1}
          onConfirmSingle={handleConfirmSingleWatch}
          onConfirmRewatchSeries={handleConfirmRewatchSeries}
        />
      )}
    </div>
  );
};

export default MobileTVSeriesDiarySlide;
