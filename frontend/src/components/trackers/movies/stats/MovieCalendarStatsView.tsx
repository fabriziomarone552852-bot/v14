import React, { useState, useMemo } from 'react';
import { useMovieWatchCalendar } from '@/hooks/trackers/useMovieWatchCalendar';
import type { DayMovieSummary } from '@/hooks/trackers/useMovieWatchCalendar';
import { CalendarIcon } from '@/components/shared/utils/CalendarTimeIcons';
import {
  MediaCalendarHeader,
  MediaStatsCalendarGrid,
  CalendarDayDetailModal,
  type CalendarGridDayData,
  type CalendarDayWatchItem,
} from '@/components/trackers/shared/stats';

export const MovieCalendarStatsView: React.FC = () => {
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
  } = useMovieWatchCalendar();

  const [selectedDay, setSelectedDay] = useState<DayMovieSummary | null>(null);

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
        posters: d.posters,
        bottomTitle: d.uniqueMovieTitles.join(', '),
      };
    });
    return map;
  }, [currentMonthDaysMap]);

  const dayDetailItems: CalendarDayWatchItem[] = useMemo(() => {
    if (!selectedDay) return [];
    return selectedDay.items.map((item, idx) => ({
      id: `${item.movieId}-${idx}`,
      title: item.movieTitle,
      subtitle: item.platformName,
      posterPath: item.posterPath,
      rating: item.rating,
      notes: item.notes,
      platformName: item.platformName,
    }));
  }, [selectedDay]);

  return (
    <div className="flex flex-col h-full gap-2.5 overflow-hidden text-left">
      {/* 1. Header Calendario Unificato */}
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
                {monthStats.totalMoviesWatched}{' '}
                {monthStats.totalMoviesWatched === 1 ? 'film visto' : 'film visti'}
              </span>
            </div>

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
        countUnitShort="film"
        onSelectDay={(dayData) => {
          const raw = currentMonthDaysMap[dayData.dayNumber];
          if (raw) setSelectedDay(raw);
        }}
      />

      {/* 3. Modal Dettaglio Film del Giorno Selezionato */}
      <CalendarDayDetailModal
        isOpen={Boolean(selectedDay && selectedDay.items.length > 0)}
        onClose={() => setSelectedDay(null)}
        dayNumber={selectedDay?.dayNumber || 1}
        monthName={monthName}
        year={year}
        itemTypeLabelSingular="film visto"
        itemTypeLabelPlural="film visti"
        items={dayDetailItems}
      />
    </div>
  );
};

export default MovieCalendarStatsView;
