import { useState, useMemo, useCallback } from 'react';
import { useMyMovies } from '@/hooks/queries/useMovieQueries';
import {
  getFirstDayIndex,
  getDaysInMonth,
  generateWeeksGrid,
  nomiMesiLungo,
} from '@/utils/dateUtils';
import type { Movie } from '@/types/movies';

export interface CalendarMovieItem {
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  watchedAt: string;
  rating?: number | null;
  notes?: string | null;
  platformName?: string | null;
}

export interface DayMovieSummary {
  dateStr: string;
  dayNumber: number;
  items: CalendarMovieItem[];
  primaryPoster: string | null;
  posters: string[];
  movieTitles: string[];
  uniqueMovieTitles: string[];
}

export const useMovieWatchCalendar = (initialMovies?: Movie[]) => {
  const { data: fetchedMovies, isLoading } = useMyMovies();
  const movies = initialMovies || fetchedMovies || [];

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

  // Mappa di tutte le visioni registrate per data YYYY-MM-DD
  const watchesByDate = useMemo(() => {
    const map: Record<string, CalendarMovieItem[]> = {};

    movies.forEach((m) => {
      const moviePoster = m.custom_poster_path || m.poster_path || null;
      const logs = m.logs || [];

      if (logs.length > 0) {
        logs.forEach((log) => {
          if (!log.watched_at) return;
          const datePart = log.watched_at.substring(0, 10);
          if (!map[datePart]) {
            map[datePart] = [];
          }

          map[datePart].push({
            movieId: m.tmdb_id,
            movieTitle: m.title,
            posterPath: moviePoster,
            watchedAt: log.watched_at,
            rating: log.rating,
            notes: log.notes,
            platformName: log.viewing_platform_name,
          });
        });
      } else if (m.status === 'watched' && m.my_last_watched_at) {
        const datePart = m.my_last_watched_at.substring(0, 10);
        if (!map[datePart]) {
          map[datePart] = [];
        }
        map[datePart].push({
          movieId: m.tmdb_id,
          movieTitle: m.title,
          posterPath: moviePoster,
          watchedAt: m.my_last_watched_at,
          rating: m.my_rating,
          notes: null,
          platformName: null,
        });
      }
    });

    return map;
  }, [movies]);

  const daysInCurrentMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDayIndex = useMemo(() => getFirstDayIndex(year, month), [year, month]);

  const currentMonthDaysMap = useMemo(() => {
    const map: Record<number, DayMovieSummary> = {};

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const items = watchesByDate[dateStr] || [];
      const posters = Array.from(
        new Set(items.map((i) => i.posterPath).filter(Boolean) as string[])
      );
      const uniqueMovieTitles = Array.from(new Set(items.map((i) => i.movieTitle)));

      map[day] = {
        dateStr,
        dayNumber: day,
        items,
        primaryPoster: posters.length > 0 ? posters[0] : null,
        posters,
        movieTitles: items.map((i) => i.movieTitle),
        uniqueMovieTitles,
      };
    }

    return map;
  }, [year, month, daysInCurrentMonth, watchesByDate]);

  const weeks = useMemo(() => {
    return generateWeeksGrid(firstDayIndex, daysInCurrentMonth);
  }, [firstDayIndex, daysInCurrentMonth]);

  const monthStats = useMemo(() => {
    let totalMoviesWatched = 0;
    const daysWithWatches = new Set<number>();

    Object.values(currentMonthDaysMap).forEach((daySummary) => {
      if (daySummary.items.length > 0) {
        totalMoviesWatched += daySummary.items.length;
        daysWithWatches.add(daySummary.dayNumber);
      }
    });

    return {
      totalMoviesWatched,
      activeDaysCount: daysWithWatches.size,
    };
  }, [currentMonthDaysMap]);

  const monthName = nomiMesiLungo[month];

  return {
    year,
    month,
    monthName,
    weeks,
    currentMonthDaysMap,
    monthStats,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    setCurrentDate,
    isLoading,
    firstDayIndex,
  };
};
