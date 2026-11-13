// src/mobile/components/trackers/stats/MobileMovieStatsCalendarModal.tsx
import React, { useMemo } from 'react';
import { useMovieWatchCalendar } from '@/hooks/trackers/useMovieWatchCalendar';
import {
  MobileTrackerStatsCalendarModal,
  type MobileCalendarDayData,
} from '../../shared/stats/MobileTrackerStatsCalendarModal';

export interface MobileMovieStatsCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndexClass?: string;
}

export const MobileMovieStatsCalendarModal: React.FC<MobileMovieStatsCalendarModalProps> = ({
  isOpen,
  onClose,
  zIndexClass = 'z-[10030]',
}) => {
  const {
    year,
    month,
    monthName,
    weeks,
    currentMonthDaysMap,
    monthStats,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
  } = useMovieWatchCalendar();

  const daysMap = useMemo(() => {
    const map: Record<number, MobileCalendarDayData> = {};
    Object.entries(currentMonthDaysMap).forEach(([dayStr, d]) => {
      const dayNum = Number(dayStr);
      map[dayNum] = {
        dayNumber: dayNum,
        dateStr: d.dateStr,
        items: d.items.map((item) => ({
          id: `${item.movieId}-${item.watchedAt}`,
          title: item.movieTitle,
          subtitle: item.platformName || (item.notes ? item.notes : undefined),
          posterPath: item.posterPath,
          rating: item.rating,
          notes: item.notes,
          typeFallbackLabel: 'FILM',
        })),
        posters:
          d.posters && d.posters.length > 0
            ? d.posters
            : d.primaryPoster
            ? [d.primaryPoster]
            : [],
        bottomTitle: d.uniqueMovieTitles.join(', '),
      };
    });
    return map;
  }, [currentMonthDaysMap]);

  return (
    <MobileTrackerStatsCalendarModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title="Calendario"
      subtitle="Visioni Film"
      year={year}
      month={month}
      monthName={monthName}
      weeks={weeks}
      daysMap={daysMap}
      totalCount={monthStats.totalMoviesWatched}
      unitLabel={monthStats.totalMoviesWatched === 1 ? 'film' : 'film'}
      goToPrevMonth={goToPrevMonth}
      goToNextMonth={goToNextMonth}
      goToToday={goToToday}
      itemTypeLabelSingular="film visto"
      itemTypeLabelPlural="film visti"
    />
  );
};

export default MobileMovieStatsCalendarModal;
