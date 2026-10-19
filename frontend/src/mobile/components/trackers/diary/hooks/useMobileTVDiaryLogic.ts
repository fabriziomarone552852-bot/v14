// src/mobile/components/trackers/diary/hooks/useMobileTVDiaryLogic.ts
import { useMemo, useState, useCallback } from 'react';
import type { TVSeries, TMDBEpisode } from '@/types/trackers';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';

export interface DiaryEpisodeItem {
  series: TVSeries;
  episode: TMDBEpisode;
  remainingAfter: number;
  lastActivityDate: Date;
  isNewRelease?: boolean;
}

export interface WatchedHistoryItem {
  logId: number;
  series: TVSeries;
  episode: TMDBEpisode;
  watchedAt: string;
  watchedDateStr: string;
}

export const useMobileTVDiaryLogic = (series: TVSeries[] | undefined) => {
  const { toggleEpisodeWatched, updateSeries } = useTrackersMutations();

  // Stato modale per richiesta conferma rewatch (singolo vs intera serie)
  const [rewatchConfirmTarget, setRewatchConfirmTarget] = useState<{
    series: TVSeries;
    episode: TMDBEpisode;
  } | null>(null);

  // Helper formattazione data relativa per lo storico
  const formatWatchedDate = useCallback((dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const watchDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.round((today.getTime() - watchDay.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'oggi';
      if (diffDays === 1) return 'ieri';
      if (diffDays === 2) return "l'altro ieri";

      return d.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return dateStr;
    }
  }, []);

  // Elaborazione in memoria (RAM) di tutte le sezioni del Diario
  const { nextToWatch, onHold, unstarted, watchedHistory } = useMemo(() => {
    if (!series || series.length === 0) {
      return {
        nextToWatch: [] as DiaryEpisodeItem[],
        onHold: [] as DiaryEpisodeItem[],
        unstarted: [] as DiaryEpisodeItem[],
        watchedHistory: [] as WatchedHistoryItem[],
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const nextToWatchList: DiaryEpisodeItem[] = [];
    const onHoldList: DiaryEpisodeItem[] = [];
    const unstartedList: DiaryEpisodeItem[] = [];
    const historyList: WatchedHistoryItem[] = [];

    // Estrazione dello storico di tutte le visioni registrate
    series.forEach((s) => {
      const eps = s.episodes || [];
      eps.forEach((ep) => {
        const logs = ep.logs || [];
        logs.forEach((log) => {
          historyList.push({
            logId: log.id,
            series: s,
            episode: ep,
            watchedAt: log.watched_at,
            watchedDateStr: formatWatchedDate(log.watched_at),
          });
        });
      });
    });

    // Ordina lo storico dal più remoto al più recente:
    // In questo modo, partendo da "I prossimi da guardare" e salendo verso l'alto,
    // si incontrano prima le visioni più recenti e man mano quelle più remote nel tempo.
    historyList.sort((a, b) => new Date(a.watchedAt).getTime() - new Date(b.watchedAt).getTime());

    // Analisi di ciascuna serie per determinare i prossimi episodi da guardare
    series.forEach((s) => {
      if (s.status === 'dropped') return;

      // Escludi gli episodi speciali (Stagione 0 / S00) dal calcolo dei prossimi da guardare
      const eps = [...(s.episodes || [])]
        .filter((e) => (e.season_number || 0) > 0)
        .sort((a, b) => {
          if (a.season_number !== b.season_number) return a.season_number - b.season_number;
          return a.episode_number - b.episode_number;
        });

      if (eps.length === 0) return;

      // 1. Serie non ancora iniziate (0 episodi visti e nessun rewatch)
      const totalWatchedEps = eps.filter((e) => (e.watch_count || 0) > 0).length;
      if (totalWatchedEps === 0 && !s.is_rewatching) {
        const firstEp = eps[0];
        unstartedList.push({
          series: s,
          episode: firstEp,
          remainingAfter: eps.length - 1,
          lastActivityDate: new Date(s.created_at || now),
        });
        return;
      }

      // 2. Calcolo data dell'ultimo episodio guardato della serie
      let latestWatchedDate: Date | null = null;
      for (const ep of eps) {
        for (const log of ep.logs || []) {
          const logDate = new Date(log.watched_at);
          if (!latestWatchedDate || logDate.getTime() > latestWatchedDate.getTime()) {
            latestWatchedDate = logDate;
          }
        }
      }

      // 3. Gestione ciclo normale vs Rewatch attivo
      if (s.is_rewatching) {
        // In modalità rewatch: determina il ciclo corrente
        const maxWatchCount = Math.max(0, ...eps.map((e) => e.watch_count || 0));
        const minWatchCount = Math.min(...eps.map((e) => e.watch_count || 0));
        const targetCycle = maxWatchCount === minWatchCount ? maxWatchCount + 1 : maxWatchCount;

        // Trova il primo episodio non ancora visto nel ciclo di rewatch
        const nextRewatchEp = eps.find((e) => (e.watch_count || 0) < targetCycle);
        if (nextRewatchEp) {
          const remainingInCycle = eps.filter((e) => (e.watch_count || 0) < targetCycle).length;
          const activityDate: Date = latestWatchedDate || new Date(s.updated_at || s.created_at || now);
          const isRecent = activityDate.getTime() >= thirtyDaysAgo.getTime();

          const item: DiaryEpisodeItem = {
            series: s,
            episode: nextRewatchEp,
            remainingAfter: remainingInCycle - 1,
            lastActivityDate: activityDate,
          };

          if (isRecent) {
            nextToWatchList.push(item);
          } else {
            onHoldList.push(item);
          }
        }
      } else {
        // Ciclo di prima visione
        const nextUnwatchedEp = eps.find((e) => (e.watch_count || 0) === 0);
        if (nextUnwatchedEp) {
          const remainingUnwatched = eps.filter((e) => (e.watch_count || 0) === 0).length;
          const isAired = Boolean(nextUnwatchedEp.air_date && nextUnwatchedEp.air_date <= todayStr);
          const watchedDate: Date | null = latestWatchedDate;

          // Se l'utente era in pari e sono usciti nuovi episodi
          if (watchedDate && isAired) {
            const epAirDate = new Date(`${nextUnwatchedEp.air_date}T00:00:00`);
            const isWatchedRecently = watchedDate.getTime() >= thirtyDaysAgo.getTime();
            const isNewReleaseRecent = epAirDate.getTime() >= thirtyDaysAgo.getTime();

            // Compare in "I prossimi da guardare" se visto nell'ultimo mese O se nuovo episodio uscito nell'ultimo mese
            const shouldBeInNextToWatch = isWatchedRecently || isNewReleaseRecent;

            const item: DiaryEpisodeItem = {
              series: s,
              episode: nextUnwatchedEp,
              remainingAfter: remainingUnwatched - 1,
              lastActivityDate: isWatchedRecently ? watchedDate : epAirDate,
              isNewRelease: !isWatchedRecently && isNewReleaseRecent,
            };

            if (shouldBeInNextToWatch) {
              nextToWatchList.push(item);
            } else {
              onHoldList.push(item);
            }
          } else if (watchedDate) {
            // Serie in corso normale
            const isRecent = watchedDate.getTime() >= thirtyDaysAgo.getTime();
            const item: DiaryEpisodeItem = {
              series: s,
              episode: nextUnwatchedEp,
              remainingAfter: remainingUnwatched - 1,
              lastActivityDate: watchedDate,
            };

            if (isRecent) {
              nextToWatchList.push(item);
            } else {
              onHoldList.push(item);
            }
          }
        }
      }
    });

    // Ordinamento cronologico decrescente (dal più recente al meno recente)
    nextToWatchList.sort((a, b) => b.lastActivityDate.getTime() - a.lastActivityDate.getTime());
    onHoldList.sort((a, b) => b.lastActivityDate.getTime() - a.lastActivityDate.getTime());
    unstartedList.sort((a, b) => b.lastActivityDate.getTime() - a.lastActivityDate.getTime());

    return {
      nextToWatch: nextToWatchList,
      onHold: onHoldList,
      unstarted: unstartedList,
      watchedHistory: historyList,
    };
  }, [series, formatWatchedDate]);

  // Gestione click sul pallino spunta episodio
  const handleToggleWatch = useCallback(
    (targetSeries: TVSeries, targetEpisode: TMDBEpisode) => {
      const isAlreadyWatched = (targetEpisode.watch_count || 0) > 0;

      if (isAlreadyWatched) {
        // Se la serie è già in rewatch attivo, incrementa direttamente la visione
        if (targetSeries.is_rewatching) {
          toggleEpisodeWatched({ episode_id: targetEpisode.id, watched: true });
        } else {
          // Altrimenti mostra il dialog per chiedere se guardare solo questo episodio o avviare il rewatch
          setRewatchConfirmTarget({
            series: targetSeries,
            episode: targetEpisode,
          });
        }
      } else {
        // Prima visione dell'episodio
        toggleEpisodeWatched({ episode_id: targetEpisode.id, watched: true });
      }
    },
    [toggleEpisodeWatched]
  );

  // Azione Dialog: Solo questo episodio
  const handleConfirmSingleWatch = useCallback(() => {
    if (!rewatchConfirmTarget) return;
    toggleEpisodeWatched({ episode_id: rewatchConfirmTarget.episode.id, watched: true });
    setRewatchConfirmTarget(null);
  }, [rewatchConfirmTarget, toggleEpisodeWatched]);

  // Azione Dialog: Continua il rewatch della serie
  const handleConfirmRewatchSeries = useCallback(() => {
    if (!rewatchConfirmTarget) return;
    toggleEpisodeWatched({ episode_id: rewatchConfirmTarget.episode.id, watched: true });
    updateSeries({
      id: rewatchConfirmTarget.series.id,
      updates: { is_rewatching: true },
    });
    setRewatchConfirmTarget(null);
  }, [rewatchConfirmTarget, toggleEpisodeWatched, updateSeries]);

  return {
    nextToWatch,
    onHold,
    unstarted,
    watchedHistory,
    handleToggleWatch,
    rewatchConfirmTarget,
    setRewatchConfirmTarget,
    handleConfirmSingleWatch,
    handleConfirmRewatchSeries,
  };
};

export default useMobileTVDiaryLogic;
