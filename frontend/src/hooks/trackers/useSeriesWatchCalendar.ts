// src/hooks/trackers/useSeriesWatchCalendar.ts
import { useState, useMemo, useCallback } from 'react';
import { useMySeries } from '@/hooks/queries/useTrackersQueries';
import {
  getFirstDayIndex,
  getDaysInMonth,
  generateWeeksGrid,
  nomiMesiLungo,
} from '@/utils/dateUtils';
import type { TVSeries } from '@/types/trackers';

export interface CalendarWatchItem {
  seriesId: number;
  seriesTitle: string;
  posterPath: string | null;
  episodeId: number;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle?: string | null;
  watchedAt: string;
  rating?: number | null;
  notes?: string | null;
}

export interface DaySeriesPoster {
  seriesId: number;
  seriesTitle: string;
  posterPath: string | null;
}

export interface DayWatchSummary {
  dateStr: string;
  dayNumber: number;
  items: CalendarWatchItem[];
  seriesList: DaySeriesPoster[];
  primaryPoster: string | null;
  uniqueSeriesTitles: string[];
}

export const useSeriesWatchCalendar = (initialSeries?: TVSeries[]) => {
  const { data: fetchedSeries, isLoading } = useMySeries();
  const series = initialSeries || fetchedSeries || [];

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  // Mappa di tutte le visioni registrate raggruppate per data YYYY-MM-DD
  const watchesByDate = useMemo(() => {
    const map: Record<string, CalendarWatchItem[]> = {};

    series.forEach((s) => {
      const seriesPoster = s.custom_poster_path || s.poster_path || null;
      const eps = s.episodes || [];

      eps.forEach((ep) => {
        const logs = ep.logs || [];
        logs.forEach((log) => {
          if (!log.watched_at) return;
          // Estrai YYYY-MM-DD in modo sicuro
          const datePart = log.watched_at.substring(0, 10);
          if (!map[datePart]) {
            map[datePart] = [];
          }
          map[datePart].push({
            seriesId: s.id || s.tmdb_id,
            seriesTitle: s.title,
            posterPath: seriesPoster,
            episodeId: ep.id,
            seasonNumber: ep.season_number,
            episodeNumber: ep.episode_number,
            episodeTitle: ep.title,
            watchedAt: log.watched_at,
            rating: log.rating,
            notes: log.notes,
          });
        });
      });

      // Gestione di eventuali log a livello di serie
      const sLogs = s.logs || [];
      sLogs.forEach((log) => {
        if (!log.watched_at) return;
        const datePart = log.watched_at.substring(0, 10);
        if (!map[datePart]) {
          map[datePart] = [];
        }
        // Se non abbiamo già registrato questa serie per questo giorno
        const exists = map[datePart].some((item) => item.seriesId === (s.id || s.tmdb_id));
        if (!exists) {
          map[datePart].push({
            seriesId: s.id || s.tmdb_id,
            seriesTitle: s.title,
            posterPath: seriesPoster,
            episodeId: 0,
            seasonNumber: 0,
            episodeNumber: 0,
            episodeTitle: 'Serie completata / vista',
            watchedAt: log.watched_at,
            rating: log.rating,
            notes: log.notes,
          });
        }
      });
    });

    return map;
  }, [series]);

  // Calcolo della griglia delle settimane per il mese corrente
  const firstDayIdx = getFirstDayIndex(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const weeks = generateWeeksGrid(firstDayIdx, daysInMonth);

  // Mappa dei giorni del mese corrente con visioni
  const currentMonthDaysMap = useMemo(() => {
    const map: Record<number, DayWatchSummary> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const items = watchesByDate[dateStr] || [];

      if (items.length > 0) {
        const uniqueTitles = Array.from(new Set(items.map((i) => i.seriesTitle)));
        const seenSeriesIds = new Set<number>();
        const seriesList: DaySeriesPoster[] = [];
        items.forEach((item) => {
          if (!seenSeriesIds.has(item.seriesId)) {
            seenSeriesIds.add(item.seriesId);
            seriesList.push({
              seriesId: item.seriesId,
              seriesTitle: item.seriesTitle,
              posterPath: item.posterPath,
            });
          }
        });
        const primaryPoster = seriesList[0]?.posterPath || null;
        map[day] = {
          dateStr,
          dayNumber: day,
          items,
          seriesList,
          primaryPoster,
          uniqueSeriesTitles: uniqueTitles,
        };
      }
    }

    return map;
  }, [year, month, daysInMonth, watchesByDate]);

  // Statistiche del mese visualizzato
  const monthStats = useMemo(() => {
    let totalEpisodes = 0;
    const seriesSet = new Set<number>();
    let activeDays = 0;

    Object.values(currentMonthDaysMap).forEach((daySummary) => {
      activeDays += 1;
      totalEpisodes += daySummary.items.length;
      daySummary.items.forEach((item) => seriesSet.add(item.seriesId));
    });

    return {
      totalEpisodes,
      uniqueSeriesCount: seriesSet.size,
      activeDaysCount: activeDays,
    };
  }, [currentMonthDaysMap]);

  return {
    currentDate,
    setCurrentDate,
    year,
    month,
    monthName: nomiMesiLungo[month],
    weeks,
    watchesByDate,
    currentMonthDaysMap,
    monthStats,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    isLoading,
  };
};

export default useSeriesWatchCalendar;
