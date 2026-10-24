// src/mobile/components/trackers/stats/MobileSeriesStatsCalendarModal.tsx
import React, { useState } from 'react';
import { useSeriesWatchCalendar } from '@/hooks/trackers/useSeriesWatchCalendar';
import type { DayWatchSummary, CalendarWatchItem } from '@/hooks/trackers/useSeriesWatchCalendar';
import { useBackHandler } from '@/utils/backButtonManager';
import { UndoIcon } from '@/components/shared/utils/Icons';
import { DayCellPostersGrid } from '@/components/trackers/SeriesStatsViews/DayCellPostersGrid';

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

  const [selectedDay, setSelectedDay] = useState<DayWatchSummary | null>(null);

  // Gesture Touch Swipe Verticale per scorrere i mesi in alto e in basso
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null || touchStartX === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    setTouchStartY(null);
    setTouchStartX(null);

    // Se prevale lo scorrimento orizzontale o il movimento è troppo breve, ignora
    if (Math.abs(deltaX) > Math.abs(deltaY)) return;
    if (Math.abs(deltaY) < 45) return;

    if (deltaY < 0) {
      // Dito verso l'alto (scorrimento verso il basso) -> Mese successivo
      goToNextMonth();
    } else {
      // Dito verso il basso (scorrimento verso l'alto) -> Mese precedente
      goToPrevMonth();
    }
  };

  // Supporto Tasto Indietro Hardware/Gesture Android
  useBackHandler(
    isOpen,
    () => {
      if (selectedDay) {
        setSelectedDay(null);
        return true;
      }
      onClose();
      return true;
    },
    25 // Priorità superiore rispetto al modale statistiche
  );

  if (!isOpen) return null;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const getPosterUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w200${path}`;
  };

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} bg-slate-50 flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn`}
    >
      {/* 1. Header Superiore con Titolo e Tasto "X" di Chiusura */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div>
          <h1 className="text-base font-black text-slate-800 uppercase tracking-wider leading-none">
            Calendario
          </h1>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Visioni Serie TV
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi finestra calendario"
          className="w-9 h-9 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center font-bold text-lg"
          title="Chiudi"
        >
          ✕
        </button>
      </div>

      {/* 2. Barra Mese in Stile Agenda Mobile (senza frecce, con UndoIcon per tornare al mese corrente) */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-black text-slate-800 capitalize leading-tight">
            {monthName}
          </h2>
          <span className="text-sm font-bold text-slate-400">{year}</span>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-1 border border-blue-100">
            {monthStats.totalEpisodes} {monthStats.totalEpisodes === 1 ? 'ep' : 'ep'}
          </span>
        </div>

        {/* Freccia Circolare Undo per ripristinare il mese corrente (come nell'Agenda) */}
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={goToToday}
            className="p-1.5 text-gray-500 hover:text-blue-600 active:scale-90 transition-all cursor-pointer rounded-lg hover:bg-gray-100"
            title="Torna al mese corrente"
            aria-label="Torna ad oggi"
          >
            <UndoIcon className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* 3. Area Calendario con Supporto al Touch Swipe Verticale */}
      <div
        className="flex-1 min-h-0 flex flex-col p-2.5 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Intestazione Colonne Giorni (L M M G V S D) */}
        <div className="grid grid-cols-7 gap-1.5 pb-1.5 text-center shrink-0">
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
            <div key={`col-${i}`} className="text-[11px] font-extrabold text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Griglia Settimane / Giorni */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-0 auto-rows-fr">
          {weeks.map((week, wIdx) => (
            <React.Fragment key={`week-${wIdx}`}>
              {week.map((day, dIdx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${wIdx}-${dIdx}`}
                      className="bg-transparent border border-transparent rounded-xl"
                    />
                  );
                }

                const isToday = isCurrentMonth && day === today.getDate();
                const daySummary = currentMonthDaysMap[day];
                const hasWatches = Boolean(daySummary && daySummary.items.length > 0);

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => {
                      if (hasWatches) {
                        setSelectedDay(daySummary);
                      }
                    }}
                    className={`relative rounded-xl border transition-all flex flex-col overflow-hidden select-none active:scale-95 ${
                      hasWatches
                        ? 'border-slate-300 shadow-xs cursor-pointer'
                        : 'border-slate-200/70 bg-white/70'
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

                    {/* Badge Numero Giorno */}
                    <div className="relative z-10 p-1 flex items-start justify-between w-full">
                      <span
                        className={`text-[11px] font-black leading-none px-1 py-0.5 rounded ${
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
                        <span className="text-[9px] font-black px-1 py-0.2 rounded-full bg-blue-600 text-white leading-tight shadow-xs">
                          {daySummary.items.length}
                        </span>
                      )}
                    </div>

                    {/* Titolo Serie abbreviato in basso */}
                    {hasWatches && (
                      <div className="relative z-10 mt-auto p-1 w-full text-left">
                        <p className="text-[9px] font-extrabold text-white truncate drop-shadow-xs leading-none">
                          {daySummary.uniqueSeriesTitles.join(', ')}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 4. Modale Centrato Touch-Friendly con Dettagli Episodi del Giorno */}
      {selectedDay && (
        <div className="fixed inset-0 z-[10060] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden animate-scaleUp border border-slate-200">
            {/* Header Dialog */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {selectedDay.dayNumber} {monthName} {year}
                </h3>
                <p className="text-[11px] text-slate-400 font-bold">
                  {selectedDay.items.length} {selectedDay.items.length === 1 ? 'visione registrata' : 'visioni registrate'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Lista Episodi Visti */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
              {selectedDay.items.map((item: CalendarWatchItem, idx: number) => {
                const poster = getPosterUrl(item.posterPath);
                return (
                  <div
                    key={`m-detail-${idx}-${item.episodeId}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-slate-50"
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt=""
                        className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        TV
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-800 truncate">
                        {item.seriesTitle}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
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

            {/* Footer Dialog */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSeriesStatsCalendarModal;
