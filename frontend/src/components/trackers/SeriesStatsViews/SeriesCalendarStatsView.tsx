// src/components/trackers/SeriesStatsViews/SeriesCalendarStatsView.tsx
import React, { useState } from 'react';
import { useSeriesWatchCalendar } from '@/hooks/trackers/useSeriesWatchCalendar';
import type { DayWatchSummary, CalendarWatchItem } from '@/hooks/trackers/useSeriesWatchCalendar';
import { CalendarIcon } from '@/components/shared/utils/CalendarTimeIcons';
import { BackIcon, ForwardIcon } from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { DayCellPostersGrid } from './DayCellPostersGrid';

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
  const [isSelectingDate, setIsSelectingDate] = useState<boolean>(false);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const handleDateChange = (dateStr: string) => {
    const [yyyy, mm] = dateStr.split('-').map(Number);
    setCurrentDate(new Date(yyyy, mm - 1, 1));
  };

  const getPosterUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w200${path}`;
  };

  const currentValueForPicker = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  return (
    <div className="flex flex-col h-full gap-2.5 overflow-hidden">
      {/* 1. Header Mese con frecce laterali in stile CalendarHeader / Homepage Agenda */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm bg-white cursor-pointer active:scale-95"
            title="Mese precedente"
          >
            <BackIcon className="h-4 w-4" />
          </button>

          <div className="relative flex justify-center items-center select-none">
            <DatePicker
              value={currentValueForPicker}
              onChange={handleDateChange}
              isOpen={isSelectingDate}
              onClose={() => setIsSelectingDate(false)}
              onToggle={() => setIsSelectingDate(!isSelectingDate)}
              align="center"
              selectionMode="month"
              customTrigger={
                <div
                  className={`flex gap-1.5 items-baseline cursor-pointer px-3 py-1 rounded-md transition-colors group ${
                    isSelectingDate ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <h3 className="text-xl font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors capitalize">
                    {monthName}
                  </h3>
                  <span className="text-sm font-bold text-gray-400">
                    {year}
                  </span>
                </div>
              }
            />
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm bg-white cursor-pointer active:scale-95"
            title="Mese successivo"
          >
            <ForwardIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Badge Statistiche Mensili compatti a destra */}
        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-xs active:scale-95 cursor-pointer mr-1"
            >
              Mese Corrente
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-bold text-blue-700">
              {monthStats.totalEpisodes} {monthStats.totalEpisodes === 1 ? 'episodio' : 'episodi'}
            </span>
          </div>

          {monthStats.uniqueSeriesCount > 0 && (
            <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700">
              {monthStats.uniqueSeriesCount} {monthStats.uniqueSeriesCount === 1 ? 'serie' : 'serie'}
            </div>
          )}

          {monthStats.activeDaysCount > 0 && (
            <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-700">
              {monthStats.activeDaysCount} gg
            </div>
          )}
        </div>
      </div>

      {/* 2. Griglia Calendario Compatta (Adatta al 100% dell'altezza, senza scrollbar) */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex flex-col overflow-hidden">
        {/* Intestazione Giorni Settimana */}
        <div className="grid grid-cols-7 gap-1.5 pb-1 border-b border-slate-100 text-center shrink-0">
          {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map((d) => (
            <div key={d} className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider py-0.5">
              {d}
            </div>
          ))}
        </div>

        {/* Griglia Settimane / Giorni (auto-rows-fr senza overflow-y-auto per evitare la scrollbar) */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-0 pt-1.5 auto-rows-fr h-full">
          {weeks.map((week, wIdx) => (
            <React.Fragment key={`week-${wIdx}`}>
              {week.map((day, dIdx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${wIdx}-${dIdx}`}
                      className="bg-slate-50/40 border border-dashed border-slate-100 rounded-xl min-h-0"
                    />
                  );
                }

                const isToday = isCurrentMonth && day === today.getDate();
                const daySummary = currentMonthDaysMap[day];
                const hasWatches = Boolean(daySummary && daySummary.items.length > 0);

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => {
                      if (hasWatches) {
                        setSelectedDay(daySummary);
                      }
                    }}
                    className={`relative rounded-xl border transition-all flex flex-col overflow-hidden select-none min-h-0 h-full ${
                      hasWatches
                        ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] border-slate-300'
                        : 'border-slate-100 bg-slate-50/40'
                    } ${
                      isToday
                        ? 'ring-2 ring-blue-500 border-blue-500'
                        : ''
                    }`}
                  >
                    {/* Suddivisione fino a 4 serie (1 locandina, 2 a metà, 3 a 3 spicchi, 4 a 4 quadranti) */}
                    {hasWatches && daySummary.seriesList && (
                      <DayCellPostersGrid seriesList={daySummary.seriesList} />
                    )}

                    {/* Header Giorno: Numero & Badge */}
                    <div className="relative z-10 flex items-center justify-between p-1">
                      <span
                        className={`text-[11px] font-black leading-none px-1 py-0.5 rounded-md ${
                          hasWatches
                            ? 'bg-black/60 text-white backdrop-blur-xs'
                            : isToday
                            ? 'bg-blue-500 text-white'
                            : 'text-slate-600'
                        }`}
                      >
                        {day}
                      </span>

                      {hasWatches && daySummary.items.length > 1 && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-blue-600 text-white shadow-xs">
                          {daySummary.items.length} ep
                        </span>
                      )}
                    </div>

                    {/* Footer Giorno: Titolo Serie compatto in basso */}
                    {hasWatches && (
                      <div className="relative z-10 mt-auto p-1">
                        <p className="text-[10px] font-extrabold text-white truncate drop-shadow-md leading-tight">
                          {daySummary.uniqueSeriesTitles.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. Modal Dettaglio Episodi del Giorno Selezionato */}
      {selectedDay && (
        <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDay(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 z-10 flex flex-col gap-4 animate-fadeIn border border-slate-200 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Visioni di {selectedDay.dayNumber} {monthName} {year}
                </h3>
                <p className="text-xs text-slate-400 font-bold">
                  {selectedDay.items.length} {selectedDay.items.length === 1 ? 'episodio registrato' : 'episodi registrati'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
              {selectedDay.items.map((item: CalendarWatchItem, idx: number) => {
                const poster = getPosterUrl(item.posterPath);
                return (
                  <div
                    key={`detail-${idx}-${item.episodeId}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors"
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt=""
                        className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-xs font-bold text-slate-400">
                        TV
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate">
                        {item.seriesTitle}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 truncate">
                        {item.seasonNumber > 0
                          ? `S${String(item.seasonNumber).padStart(2, '0')}E${String(item.episodeNumber).padStart(2, '0')}${
                              item.episodeTitle ? ` - ${item.episodeTitle}` : ''
                            }`
                          : item.episodeTitle || 'Visione serie'}
                      </p>
                      {item.rating && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                          ★ {item.rating}/10
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesCalendarStatsView;
