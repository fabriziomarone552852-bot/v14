import React, { useState } from 'react';
import { History } from 'lucide-react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode, SeriesSeasonInfo } from '@/types/trackers';
import { EpisodeDetailView } from './EpisodeDetailView';
import { SeasonDetailView } from './SeasonDetailView';
import { SeriesSeasonAccordionItem } from './SeriesSeasonAccordionItem';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useSeriesExtras } from '@/hooks/queries/useTrackersQueries';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';
import {
  getEpisodePersonalRating,
  getSeasonPersonalRating,
  roundRatingToHalfStar,
} from '@/utils/ratingUtils';

interface SeasonsTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  initialEpisode?: TMDBEpisode | null;
  initialSeasonNumber?: number | null;
  initialReviewLogId?: number;
  isLoading?: boolean;
  isHistoricMode?: boolean;
  onDisableHistoricMode?: () => void;
  onClearInitialSeason?: () => void;
}

export const SeasonsTab: React.FC<SeasonsTabProps> = ({
  tmdbSeries,
  initialEpisode,
  initialSeasonNumber = null,
  initialReviewLogId,
  isLoading,
  userTracking,
  isHistoricMode = false,
  onDisableHistoricMode,
  onClearInitialSeason,
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(initialEpisode || null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | null>(
    initialEpisode ? null : initialSeasonNumber
  );
  const [expandedSeason, setExpandedSeason] = useState<number | null>(
    initialEpisode ? initialEpisode.season_number : initialSeasonNumber
  );

  const { toggleEpisodeWatched } = useTrackersMutations();
  const { data: extras } = useSeriesExtras(tmdbSeries.tmdb_id);

  // Mappa dei metadati completi delle stagioni da TMDB extras
  const seasonInfoMap = React.useMemo(() => {
    const map: Record<number, SeriesSeasonInfo> = {};
    if (extras?.seasons) {
      extras.seasons.forEach((s) => {
        map[s.season_number] = s;
      });
    }
    return map;
  }, [extras?.seasons]);

  const getSeasonTitle = (sn: number) => {
    if (sn === 0) return 'Episodi Speciali';
    return seasonInfoMap[sn]?.name || `Stagione ${sn}`;
  };

  React.useEffect(() => {
    if (initialEpisode) {
      setSelectedEpisode(initialEpisode);
      setSelectedSeasonNumber(null);
      setExpandedSeason(initialEpisode.season_number);
    }
  }, [initialEpisode]);

  React.useEffect(() => {
    if (initialSeasonNumber !== null && initialSeasonNumber !== undefined && !initialEpisode) {
      setSelectedSeasonNumber(initialSeasonNumber);
      setExpandedSeason(initialSeasonNumber);
    }
  }, [initialSeasonNumber, initialEpisode]);

  const requireTracking = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!userTracking) {
      showTrackerToast('Aggiungi prima la serie alla tua libreria', 'warning');
      return false;
    }
    return true;
  };

  const handleWatchCountChange = (e: React.MouseEvent, episodeId: number, delta: number) => {
    if (!requireTracking(e)) return;
    if (delta > 0) {
      toggleEpisodeWatched({ episode_id: episodeId, watched: true, is_historic: isHistoricMode });
    } else if (delta < 0) {
      toggleEpisodeWatched({ episode_id: episodeId, watched: false });
    }
  };

  const handleToggleEpisode = (
    e: React.MouseEvent,
    episodeId: number,
    currentWatchCount: number
  ) => {
    if (!requireTracking(e)) return;
    if (currentWatchCount > 0) {
      toggleEpisodeWatched({ episode_id: episodeId, watched: false });
    } else {
      toggleEpisodeWatched({ episode_id: episodeId, watched: true, is_historic: isHistoricMode });
    }
  };

  const handleSeasonToggle = (
    e: React.MouseEvent | undefined,
    seasonEpisodes: TMDBEpisode[],
    seasonMinWatchCount: number
  ) => {
    if (!requireTracking(e)) return;
    const isChecked = seasonMinWatchCount > 0;

    for (const ep of seasonEpisodes) {
      const current = ep.watch_count || 0;
      if (isChecked) {
        toggleEpisodeWatched({ episode_id: ep.id, watched: false });
      } else if (current <= seasonMinWatchCount) {
        toggleEpisodeWatched({ episode_id: ep.id, watched: true, is_historic: isHistoricMode });
      }
    }
  };

  const changeAllEpisodes = (episodes: TMDBEpisode[], delta: number, targetCount: number) => {
    if (!requireTracking()) return;
    for (const ep of episodes) {
      const current = ep.watch_count || 0;
      if (current === targetCount) {
        if (delta > 0) {
          toggleEpisodeWatched({ episode_id: ep.id, watched: true, is_historic: isHistoricMode });
        } else if (delta < 0) {
          toggleEpisodeWatched({ episode_id: ep.id, watched: false });
        }
      }
    }
  };

  // Gruppo episodi per stagione
  const episodes = tmdbSeries.episodes || [];
  const seasonsMap: Record<number, TMDBEpisode[]> = {};
  episodes.forEach((ep) => {
    if (!seasonsMap[ep.season_number]) seasonsMap[ep.season_number] = [];
    seasonsMap[ep.season_number].push(ep);
  });
  const seasonsList = Object.keys(seasonsMap)
    .map(Number)
    .sort((a, b) => a - b);

  // Vista Dettaglio Episodio
  if (selectedEpisode) {
    const latestEpisodeData =
      episodes.find((ep) => ep.id === selectedEpisode.id) || selectedEpisode;
    const logs = latestEpisodeData.logs || [];

    return (
      <EpisodeDetailView
        episode={latestEpisodeData}
        tmdbSeries={tmdbSeries}
        logs={logs}
        onBack={() => setSelectedEpisode(null)}
        initialView={
          initialEpisode && initialEpisode.id === selectedEpisode.id ? 'reviews' : 'main'
        }
        initialReviewLogId={initialReviewLogId}
      />
    );
  }

  // Vista Dettaglio Stagione (pulsante "i" o deep-link)
  if (selectedSeasonNumber !== null) {
    const seasonEpisodes = seasonsMap[selectedSeasonNumber] || [];
    const total = seasonEpisodes.length;
    const watched = seasonEpisodes.filter((ep) => (ep.watch_count || 0) > 0).length;
    let minWatch = Infinity;
    if (total > 0) {
      seasonEpisodes.forEach((ep) => {
        const count = ep.watch_count || 0;
        if (count < minWatch) minWatch = count;
      });
    } else {
      minWatch = 0;
    }

    return (
      <SeasonDetailView
        seasonNumber={selectedSeasonNumber}
        seasonInfo={seasonInfoMap[selectedSeasonNumber]}
        tmdbSeries={tmdbSeries}
        userTracking={userTracking}
        episodes={seasonEpisodes}
        watchedCount={watched}
        totalCount={total}
        isSeasonWatched={minWatch > 0}
        onToggleSeasonWatched={() => handleSeasonToggle(undefined, seasonEpisodes, minWatch)}
        onBack={() => {
          setSelectedSeasonNumber(null);
          onClearInitialSeason?.();
        }}
        initialView={
          initialReviewLogId && initialSeasonNumber === selectedSeasonNumber
            ? 'review_detail'
            : 'main'
        }
        initialReviewLogId={
          initialSeasonNumber === selectedSeasonNumber ? initialReviewLogId : undefined
        }
      />
    );
  }

  if (episodes.length === 0) {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Caricamento episodi...</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Sincronizzazione con il database in corso, attendere.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Nessun episodio disponibile</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Gli episodi di questa serie non sono ancora stati rilasciati o non sono presenti nel database.
        </p>
      </div>
    );
  }

  const allSeasonLogs = tmdbSeries.season_logs || userTracking?.season_logs || [];

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      {/* Banner Modalità Inserimento Storico */}
      {isHistoricMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-amber-900 leading-snug">
              Modalità Storico attiva: i tocchi registrano gli episodi come già visti in passato senza alterare le statistiche recenti.
            </p>
          </div>
          {onDisableHistoricMode && (
            <button
              type="button"
              onClick={onDisableHistoricMode}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-sm"
            >
              Fine
            </button>
          )}
        </div>
      )}

      {seasonsList.map((seasonNumber) => {
        const seasonEpisodes = seasonsMap[seasonNumber];
        const isExpanded = expandedSeason === seasonNumber;
        const total = seasonEpisodes.length;
        const watched = seasonEpisodes.filter((ep) => (ep.watch_count || 0) > 0).length;

        let seasonMinWatchCount = Infinity;
        if (total > 0) {
          seasonEpisodes.forEach((ep) => {
            const count = ep.watch_count || 0;
            if (count < seasonMinWatchCount) seasonMinWatchCount = count;
          });
        } else {
          seasonMinWatchCount = 0;
        }

        let totalEpRating = 0;
        let ratedEpisodesCount = 0;
        seasonEpisodes.forEach((ep) => {
          const epData = getEpisodePersonalRating(ep);
          if (epData) {
            totalEpRating += epData.rating;
            ratedEpisodesCount++;
          }
        });

        const episodesAverageRating =
          ratedEpisodesCount > 0 ? roundRatingToHalfStar(totalEpRating / ratedEpisodesCount) : null;
        const seasonPersonalRating = getSeasonPersonalRating(allSeasonLogs, seasonNumber);

        return (
          <SeriesSeasonAccordionItem
            key={seasonNumber}
            seasonNumber={seasonNumber}
            seasonTitle={getSeasonTitle(seasonNumber)}
            seasonEpisodes={seasonEpisodes}
            isExpanded={isExpanded}
            watchedCount={watched}
            totalCount={total}
            seasonMinWatchCount={seasonMinWatchCount}
            seasonPersonalRating={seasonPersonalRating}
            episodesAverageRating={episodesAverageRating}
            ratedEpisodesCount={ratedEpisodesCount}
            onToggleExpand={() => setExpandedSeason(isExpanded ? null : seasonNumber)}
            onOpenSeasonDetail={() => setSelectedSeasonNumber(seasonNumber)}
            onToggleSeason={(e) => handleSeasonToggle(e, seasonEpisodes, seasonMinWatchCount)}
            onAddSeasonWatch={(e) => {
              e.stopPropagation();
              changeAllEpisodes(seasonEpisodes, 1, seasonMinWatchCount);
            }}
            onSubSeasonWatch={(e) => {
              e.stopPropagation();
              changeAllEpisodes(seasonEpisodes, -1, seasonMinWatchCount);
            }}
            onSelectEpisode={(ep) => setSelectedEpisode(ep)}
            onToggleEpisode={handleToggleEpisode}
            onWatchCountChange={handleWatchCountChange}
          />
        );
      })}
    </div>
  );
};
