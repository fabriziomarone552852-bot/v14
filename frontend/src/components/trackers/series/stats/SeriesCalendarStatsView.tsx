// src/components/trackers/SeriesStatsViews/SeriesCalendarStatsView.tsx
import React, { useState, useMemo } from 'react';
import { useSeriesWatchCalendar } from '@/hooks/trackers/useSeriesWatchCalendar';
import type { DayWatchSummary } from '@/hooks/trackers/useSeriesWatchCalendar';
import { CalendarIcon } from '@/components/shared/utils/CalendarTimeIcons';
import {
  MediaCalendarHeader,
  MediaStatsCalendarGrid,
  CalendarDayDetailModal,
  type CalendarGridDayData,
  type CalendarDayWatchItem,
} from '@/components/trackers/shared/stats';

export const SeriesCalendarStatsView: React.FC = () => {
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
    setCurrentDate,
  } = useSeriesWatchCalendar();

  const [selectedDay, setSelectedDay] = useState<DayWatchSummary | null>(null);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const handleDateChange = (dateStr: string) => {
    const [yyyy, mm] = dateStr.split('-').map(Number);
    setCurrentDate(new Date(yyyy, mm - 1, 1));
  };

  const gridDaysMap: Record<number, CalendarGridDayData> = useMemo(() => {
    const map: Record<number, CalendarGridDayData> = {};
    Object.entries(currentMonthDaysMap).forEach(([dayStr, d]) => {
      const dayNum = Number(dayStr);
      map[dayNum] = {
        dayNumber: dayNum,
        dateStr: d.dateStr,
        hasWatches: d.items.length > 0,
        itemCount: d.items.length,
        posters: d.seriesList.map((s) => s.posterPath),
        bottomTitle: d.uniqueSeriesTitles.join(', '),
      };
    });
    return map;
  }, [currentMonthDaysMap]);

  const dayDetailItems: CalendarDayWatchItem[] = useMemo(() => {
    if (!selectedDay) return [];
    return selectedDay.items.map((item, idx) => ({
      id: `${item.episodeId}-${idx}`,
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
    }));
  }, [selectedDay]);

  return (
    <div className="flex flex-col h-full gap-2.5 overflow-hidden text-left">
      {/* 1. Header Mese Unificato */}
      <MediaCalendarHeader
        year={year}
        month={month}
        monthName={monthName}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        onDateChange={handleDateChange}
        isCurrentMonth={isCurrentMonth}
        todayLabel="Mese Corrente"
        rightBadges={
          <>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg whitespace-nowrap">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-700">
                {monthStats.totalEpisodes}{' '}
                {monthStats.totalEpisodes === 1 ? 'episodio' : 'episodi'}
              </span>
            </div>

            {monthStats.uniqueSeriesCount > 0 && (
              <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700 whitespace-nowrap">
                {monthStats.uniqueSeriesCount} serie
              </div>
            )}

            {monthStats.activeDaysCount > 0 && (
              <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-700 whitespace-nowrap">
                {monthStats.activeDaysCount} gg
              </div>
            )}
          </>
        }
      />

      {/* 2. Griglia Calendario Standardizzata (mostrata sempre anche vuota) */}
      <MediaStatsCalendarGrid
        weeks={weeks}
        currentMonthDaysMap={gridDaysMap}
        isCurrentMonth={isCurrentMonth}
        todayDayNumber={today.getDate()}
        countUnitShort="ep"
        onSelectDay={(dayData) => {
          const raw = currentMonthDaysMap[dayData.dayNumber];
          if (raw) setSelectedDay(raw);
        }}
      />

      {/* 3. Modal Dettaglio Visioni */}
      <CalendarDayDetailModal
        isOpen={Boolean(selectedDay && selectedDay.items.length > 0)}
        onClose={() => setSelectedDay(null)}
        dayNumber={selectedDay?.dayNumber || 1}
        monthName={monthName}
        year={year}
        itemTypeLabelSingular="episodio registrato"
        itemTypeLabelPlural="episodi registrati"
        items={dayDetailItems}
      />
    </div>
  );
};

export default SeriesCalendarStatsView;
