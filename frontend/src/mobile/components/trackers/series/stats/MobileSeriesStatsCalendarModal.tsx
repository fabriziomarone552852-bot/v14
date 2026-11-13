// src/mobile/components/trackers/stats/MobileSeriesStatsCalendarModal.tsx
import React, { useMemo } from 'react';
import { useSeriesWatchCalendar } from '@/hooks/trackers/useSeriesWatchCalendar';
import {
  MobileTrackerStatsCalendarModal,
  type MobileCalendarDayData,
} from '../../shared/stats/MobileTrackerStatsCalendarModal';

export interface MobileSeriesStatsCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndexClass?: string;
}

export const MobileSeriesStatsCalendarModal: React.FC<MobileSeriesStatsCalendarModalProps> = ({
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
  } = useSeriesWatchCalendar();

  const daysMap = useMemo(() => {
    const map: Record<number, MobileCalendarDayData> = {};
    Object.entries(currentMonthDaysMap).forEach(([dayStr, d]) => {
      const dayNum = Number(dayStr);
      map[dayNum] = {
        dayNumber: dayNum,
        dateStr: d.dateStr,
        items: d.items.map((item) => ({
          id: item.episodeId,
          title: item.seriesTitle,
          subtitle:
            item.seasonNumber > 0
              ? `S${String(item.seasonNumber).padStart(2, '0')}E${String(
                  item.episodeNumber
                ).padStart(2, '0')}${item.episodeTitle ? ` - ${item.episodeTitle}` : ''}`
              : item.episodeTitle || 'Visione serie',
          posterPath: item.posterPath,
          rating: item.rating,
          notes: item.notes,
          typeFallbackLabel: 'TV',
        })),
        posters:
          d.seriesList && d.seriesList.length > 0
            ? d.seriesList.map((s) => s.posterPath)
            : [d.primaryPoster],
        bottomTitle: d.uniqueSeriesTitles.join(', '),
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
      subtitle="Visioni Serie TV"
      year={year}
      month={month}
      monthName={monthName}
      weeks={weeks}
      daysMap={daysMap}
      totalCount={monthStats.totalEpisodes}
      unitLabel="ep"
      goToPrevMonth={goToPrevMonth}
      goToNextMonth={goToNextMonth}
      goToToday={goToToday}
      itemTypeLabelSingular="visione registrata"
      itemTypeLabelPlural="visioni registrate"
    />
  );
};

export default MobileSeriesStatsCalendarModal;
