// src/mobile/components/trackers/detail/MobileSeriesSeasonsTab.tsx
import React from 'react';
import { Check, ChevronDown, Film, Star } from 'lucide-react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode } from '@/types/trackers';
import { EpisodeDetailView } from '@/components/trackers/SeriesDetailModal/EpisodeDetailView';
import { MobileWatchActionDrawer } from './MobileWatchActionDrawer';
import MobileRewatchConfirmModal from '../diary/MobileRewatchConfirmModal';
import {
  useMobileSeriesSeasonsLogic,
  getEpisodeAverageRating,
} from './hooks/useMobileSeriesSeasonsLogic';
import { MobileEpisodeItem } from './components/MobileEpisodeItem';

export interface MobileSeriesSeasonsTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  initialEpisode?: TMDBEpisode | null;
  initialReviewLogId?: number;
  isLoading?: boolean;
  onSelectEpisode?: (ep: TMDBEpisode) => void;
}

export const MobileSeriesSeasonsTab: React.FC<MobileSeriesSeasonsTabProps> = ({
  tmdbSeries,
  userTracking,
  initialEpisode,
  initialReviewLogId,
  isLoading = false,
  onSelectEpisode,
}) => {
  const {
    selectedEpisode,
    setSelectedEpisode,
    expandedSeason,
    setExpandedSeason,
    drawerTarget,
    setDrawerTarget,
    rewatchTarget,
    setRewatchTarget,
    handleConfirmSingleWatch,
    handleConfirmRewatchSeries,
    episodes,
    seasonsMap,
    seasonsList,
    getSeasonTitle,
    getSeasonAverageRating,
    handleEpisodeCircleClick,
    handleSeasonCircleClick,
    handleDrawerAddWatch,
    handleDrawerResetWatch,
    handleDrawerSubWatch,
  } = useMobileSeriesSeasonsLogic({
    tmdbSeries,
    userTracking,
    initialEpisode,
  });

  // Se un episodio è selezionato e non c'è gestore esterno (es. parent modal), mostriamo la vista interna
  if (!onSelectEpisode && selectedEpisode) {
    const latestEpisodeData =
      episodes.find((ep) => ep.id === selectedEpisode.id) || selectedEpisode;
    const logs = latestEpisodeData.logs || [];

    return (
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <EpisodeDetailView
          episode={latestEpisodeData}
          tmdbSeries={tmdbSeries}
          logs={logs}
          onBack={() => setSelectedEpisode(null)}
          initialView={initialEpisode && initialEpisode.id === selectedEpisode.id ? 'reviews' : 'main'}
          initialReviewLogId={initialReviewLogId}
        />
      </div>
    );
  }

  // Schermata di caricamento o vuota
  if (episodes.length === 0) {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center select-none">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">Caricamento stagioni ed episodi...</h3>
          <p className="text-gray-400 text-xs">Sincronizzazione catalogo in corso</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center select-none">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
          <Film className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Nessun episodio disponibile</h3>
        <p className="text-gray-400 text-xs max-w-xs">
          Gli episodi di questa serie non sono ancora stati registrati nel database.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-8 select-none animate-fadeIn scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {seasonsList.map((seasonNumber) => {
        const seasonEpisodes = seasonsMap[seasonNumber];
        const isExpanded = expandedSeason === seasonNumber;

        const total = seasonEpisodes.length;
        const watched = seasonEpisodes.filter((ep) => (ep.watch_count || 0) > 0).length;

        // Visione minima per la stagione
        let seasonMinWatchCount = Infinity;
        if (total > 0) {
          seasonEpisodes.forEach((ep) => {
            const count = ep.watch_count || 0;
            if (count < seasonMinWatchCount) seasonMinWatchCount = count;
          });
        } else {
          seasonMinWatchCount = 0;
        }

        const seasonAverageRating = getSeasonAverageRating(seasonEpisodes);
        const seasonTitle = getSeasonTitle(seasonNumber);

        return (
          <div
            key={seasonNumber}
            className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden transition-all"
          >
            {/* INTESTAZIONE STAGIONE */}
            <div
              className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100/70 transition-colors"
              onClick={() => setExpandedSeason(isExpanded ? null : seasonNumber)}
            >
              {/* Sinistra: Titolo stagione + progresso visti */}
              <div className="flex items-center gap-2 min-w-0">
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
                <h3 className="font-bold text-gray-900 text-sm truncate">
                  {seasonTitle}
                </h3>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                  {watched}/{total}
                </span>
              </div>

              {/* Destra: Media voti stagione + pallino/spunta */}
              <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {seasonAverageRating !== null && (
                  <div
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60"
                    title={`Media voti stagione: ${seasonAverageRating.toFixed(1)}`}
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    <span>
                      {seasonAverageRating % 1 === 0
                        ? seasonAverageRating.toFixed(0)
                        : seasonAverageRating.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Pallino / Spunta Stagione */}
                <button
                  type="button"
                  onClick={(e) =>
                    handleSeasonCircleClick(e, seasonNumber, seasonEpisodes, seasonMinWatchCount)
                  }
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-90 ${
                    seasonMinWatchCount > 0
                      ? 'bg-blue-600 border border-blue-600 text-white'
                      : 'border-2 border-gray-300 hover:border-blue-400 bg-white text-transparent'
                  }`}
                  title={
                    seasonMinWatchCount > 0
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
            </div>

            {/* LISTA EPISODI DELLA STAGIONE */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50/40 divide-y divide-gray-100">
                {seasonEpisodes.map((ep) => (
                  <MobileEpisodeItem
                    key={ep.id}
                    episode={ep}
                    rating={getEpisodeAverageRating(ep)}
                    onSelect={() => (onSelectEpisode ? onSelectEpisode(ep) : setSelectedEpisode(ep))}
                    onCircleClick={(e) => handleEpisodeCircleClick(e, ep)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Drawer azioni visione per episodio o stagione */}
      <MobileWatchActionDrawer
        isOpen={drawerTarget !== null}
        onClose={() => setDrawerTarget(null)}
        target={drawerTarget}
        onAddWatch={handleDrawerAddWatch}
        onResetWatch={handleDrawerResetWatch}
        onSubWatch={handleDrawerSubWatch}
      />

      {/* Modale conferma rewatch per episodio */}
      {rewatchTarget && (
        <MobileRewatchConfirmModal
          isOpen={true}
          onClose={() => setRewatchTarget(null)}
          seriesTitle={tmdbSeries.title}
          seasonNumber={rewatchTarget.episode.season_number}
          episodeNumber={rewatchTarget.episode.episode_number}
          episodeTitle={rewatchTarget.episode.title}
          currentWatchCount={rewatchTarget.episode.watch_count || 1}
          onConfirmSingle={handleConfirmSingleWatch}
          onConfirmRewatchSeries={handleConfirmRewatchSeries}
        />
      )}
    </div>
  );
};

export default MobileSeriesSeasonsTab;
