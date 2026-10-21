// src/mobile/components/trackers/detail/hooks/useMobileSeriesSeasonsLogic.ts
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode } from '@/types/trackers';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useSeriesExtras } from '@/hooks/queries/useTrackersQueries';
import type { MobileWatchActionTarget } from '../MobileWatchActionDrawer';
import { showTrackerToast } from '@/components/trackers/TrackerToast';

export interface UseMobileSeriesSeasonsLogicProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  initialEpisode?: TMDBEpisode | null;
}

export const roundToHalfStar = (val: number): number => {
  return Math.round(val * 2) / 2;
};

export const getEpisodeAverageRating = (ep: TMDBEpisode): number | null => {
  const ratedLogs = (ep.logs || []).filter(
    (l): l is typeof l & { rating: number } => typeof l.rating === 'number' && l.rating > 0
  );
  if (ratedLogs.length === 0) return null;
  // In DB il rating è memorizzato su scala 1-10; convertiamo a scala 0.5 - 5.0 stelle
  const sumStars = ratedLogs.reduce((acc, l) => acc + l.rating / 2, 0);
  const avgStars = sumStars / ratedLogs.length;
  return roundToHalfStar(avgStars);
};

export const useMobileSeriesSeasonsLogic = ({
  tmdbSeries,
  userTracking,
  initialEpisode,
}: UseMobileSeriesSeasonsLogicProps) => {
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(initialEpisode || null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(
    initialEpisode ? initialEpisode.season_number : null
  );
  const [drawerTarget, setDrawerTarget] = useState<MobileWatchActionTarget | null>(null);
  const [rewatchTarget, setRewatchTarget] = useState<{ episode: TMDBEpisode } | null>(null);

  const { toggleEpisodeWatched, updateSeries } = useTrackersMutations();
  const { data: extras } = useSeriesExtras(tmdbSeries.tmdb_id);

  useEffect(() => {
    if (initialEpisode) {
      setSelectedEpisode(initialEpisode);
      setExpandedSeason(initialEpisode.season_number);
    }
  }, [initialEpisode]);

  const episodes = tmdbSeries.episodes || [];

  // Mappa dei nomi propri delle stagioni (es. AHS: "Murder House", "Asylum", ecc.)
  const seasonNamesMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (extras?.seasons) {
      extras.seasons.forEach((s) => {
        if (s.season_number === 0) {
          map[0] = 'Episodi Speciali';
        } else if (s.name) {
          map[s.season_number] = s.name;
        }
      });
    }
    return map;
  }, [extras?.seasons]);

  const getSeasonTitle = useCallback(
    (sn: number) => {
      if (sn === 0) return 'Episodi Speciali';
      return seasonNamesMap[sn] || `Stagione ${sn}`;
    },
    [seasonNamesMap]
  );

  // Raggruppa episodi per stagione
  const seasonsMap = useMemo(() => {
    const map: Record<number, TMDBEpisode[]> = {};
    episodes.forEach((ep) => {
      if (!map[ep.season_number]) map[ep.season_number] = [];
      map[ep.season_number].push(ep);
    });
    return map;
  }, [episodes]);

  const seasonsList = useMemo(() => {
    return Object.keys(seasonsMap)
      .map(Number)
      .sort((a, b) => a - b);
  }, [seasonsMap]);

  // Se l'utente non ha la serie a catalogo, avviso non bloccante
  const requireTracking = useCallback(() => {
    if (!userTracking) {
      showTrackerToast('Aggiungi prima la serie alla tua libreria', 'warning');
      return false;
    }
    return true;
  }, [userTracking]);

  // Calcolo media delle medie per l'intera stagione
  const getSeasonAverageRating = useCallback((seasonEpisodes: TMDBEpisode[]): number | null => {
    let sumEpAverages = 0;
    let ratedEpisodesCount = 0;
    seasonEpisodes.forEach((ep) => {
      const epAvg = getEpisodeAverageRating(ep);
      if (epAvg !== null) {
        sumEpAverages += epAvg;
        ratedEpisodesCount++;
      }
    });
    return ratedEpisodesCount > 0 ? roundToHalfStar(sumEpAverages / ratedEpisodesCount) : null;
  }, []);

  // Gestione tocco pallino episodio
  const handleEpisodeCircleClick = useCallback(
    (e: React.MouseEvent, ep: TMDBEpisode) => {
      e.stopPropagation();
      if (!requireTracking()) return;

      const count = ep.watch_count || 0;
      if (count === 0) {
        toggleEpisodeWatched({ episode_id: ep.id, watched: true });
      } else {
        setDrawerTarget({
          type: 'episode',
          id: ep.id,
          title: ep.title || `Episodio ${ep.episode_number}`,
          seasonNumber: ep.season_number,
          episodeNumber: ep.episode_number,
          watchCount: count,
        });
      }
    },
    [requireTracking, toggleEpisodeWatched]
  );

  // Gestione tocco pallino intera stagione
  const handleSeasonCircleClick = useCallback(
    (
      e: React.MouseEvent,
      seasonNumber: number,
      seasonEpisodes: TMDBEpisode[],
      seasonMinWatchCount: number
    ) => {
      e.stopPropagation();
      if (!requireTracking()) return;

      if (seasonMinWatchCount === 0) {
        seasonEpisodes.forEach((ep) => {
          if ((ep.watch_count || 0) === 0) {
            toggleEpisodeWatched({ episode_id: ep.id, watched: true });
          }
        });
      } else {
        setDrawerTarget({
          type: 'season',
          id: seasonNumber,
          title: getSeasonTitle(seasonNumber),
          seasonNumber,
          watchCount: seasonMinWatchCount,
        });
      }
    },
    [requireTracking, toggleEpisodeWatched, getSeasonTitle]
  );

  // Esecuzione azioni dal Drawer
  const handleDrawerAddWatch = useCallback(() => {
    if (!drawerTarget) return;
    if (drawerTarget.type === 'episode') {
      const ep = episodes.find((e) => e.id === drawerTarget.id);
      if (ep && userTracking && !userTracking.is_rewatching) {
        setRewatchTarget({ episode: ep });
        return;
      }
      toggleEpisodeWatched({ episode_id: drawerTarget.id, watched: true });
    } else {
      const seasonEpisodes = seasonsMap[drawerTarget.id] || [];
      seasonEpisodes.forEach((ep) => {
        toggleEpisodeWatched({ episode_id: ep.id, watched: true });
      });
    }
  }, [drawerTarget, episodes, userTracking, seasonsMap, toggleEpisodeWatched]);

  const handleConfirmSingleWatch = useCallback(() => {
    if (!rewatchTarget) return;
    toggleEpisodeWatched({ episode_id: rewatchTarget.episode.id, watched: true });
    setRewatchTarget(null);
  }, [rewatchTarget, toggleEpisodeWatched]);

  const handleConfirmRewatchSeries = useCallback(() => {
    if (!rewatchTarget || !userTracking) return;
    toggleEpisodeWatched({ episode_id: rewatchTarget.episode.id, watched: true });
    updateSeries({
      id: userTracking.series_tmdb_id || tmdbSeries.tmdb_id,
      updates: { is_rewatching: true },
    });
    setRewatchTarget(null);
  }, [rewatchTarget, userTracking, tmdbSeries.tmdb_id, toggleEpisodeWatched, updateSeries]);

  const handleDrawerResetWatch = useCallback(() => {
    if (!drawerTarget) return;
    if (drawerTarget.type === 'episode') {
      for (let i = 0; i < drawerTarget.watchCount; i++) {
        toggleEpisodeWatched({ episode_id: drawerTarget.id, watched: false });
      }
    } else {
      const seasonEpisodes = seasonsMap[drawerTarget.id] || [];
      seasonEpisodes.forEach((ep) => {
        const count = ep.watch_count || 0;
        for (let i = 0; i < count; i++) {
          toggleEpisodeWatched({ episode_id: ep.id, watched: false });
        }
      });
    }
  }, [drawerTarget, seasonsMap, toggleEpisodeWatched]);

  const handleDrawerSubWatch = useCallback(() => {
    if (!drawerTarget) return;
    if (drawerTarget.type === 'episode') {
      toggleEpisodeWatched({ episode_id: drawerTarget.id, watched: false });
    } else {
      const seasonEpisodes = seasonsMap[drawerTarget.id] || [];
      seasonEpisodes.forEach((ep) => {
        toggleEpisodeWatched({ episode_id: ep.id, watched: false });
      });
    }
  }, [drawerTarget, seasonsMap, toggleEpisodeWatched]);

  return {
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
  };
};
