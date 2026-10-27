import React, { useState } from 'react';
import { generateWeeksGrid, nomiMesiLungo, getFirstDayIndex, getDaysInMonth } from '@/utils/dateUtils';
import { useUpcomingMovies } from '@/hooks/queries/useMovieQueries';
import type { UpcomingMovie, MovieDetailTarget } from '@/types/movies';

interface UpcomingMovieCalendarWidgetProps {
  openMovieDetail: (movie: MovieDetailTarget) => void;
}

export const UpcomingMovieCalendarWidget: React.FC<UpcomingMovieCalendarWidgetProps> = ({
  openMovieDetail,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDayIdx = getFirstDayIndex(year, month);
  const daysInMo = getDaysInMonth(year, month);
  const weeks = generateWeeksGrid(firstDayIdx, daysInMo);

  // Calcola le date inizio e fine mese per il backend
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const startDateStr = startOfMonth.toISOString().split('T')[0];
  const endDateStr = endOfMonth.toISOString().split('T')[0];

  const { data: upcomingMovies = [], isLoading } = useUpcomingMovies(startDateStr, endDateStr);

  // Mappa dei film per giorno del mese
  const movieDayMap: Record<number, UpcomingMovie[]> = {};
  upcomingMovies.forEach((m) => {
    const rawDate = m.italy_release_date || m.release_date;
    if (!rawDate) return;
    try {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        const mYear = parseInt(parts[0], 10);
        const mMonth = parseInt(parts[1], 10) - 1;
        const mDay = parseInt(parts[2], 10);
        if (mYear === year && mMonth === month) {
          if (!movieDayMap[mDay]) movieDayMap[mDay] = [];
          movieDayMap[mDay].push(m);
        }
      }
    } catch {
      // Ignora date malformate
    }
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs relative flex flex-col h-full">
      {/* Header Calendario */}
      <div className="flex justify-center items-center mb-3 border-b border-gray-100 pb-3 gap-4">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-xs bg-white active:scale-95 cursor-pointer"
          title="Mese precedente"
          aria-label="Mese precedente"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-1.5 items-baseline select-none">
          <h3 className="text-lg font-extrabold text-gray-800 capitalize">
            {nomiMesiLungo[month]}
          </h3>
          <span className="text-sm font-bold text-gray-400">{year}</span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-xs bg-white active:scale-95 cursor-pointer"
          title="Mese successivo"
          aria-label="Mese successivo"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Intestazione Giorni Settimana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 shrink-0">
        {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-xs font-bold text-gray-400 uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Griglia Calendario (Sempre visibile, anche se vuota) */}
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 pb-1 auto-rows-fr">
        {weeks.map((week, wIdx) => (
          <React.Fragment key={wIdx}>
            {week.map((day, dIdx) => {
              if (day === null) {
                return (
                  <div key={`empty-${wIdx}-${dIdx}`} className="p-2 border-transparent min-h-0" />
                );
              }

              const isToday =
                year === today.getFullYear() &&
                month === today.getMonth() &&
                day === today.getDate();
              const moviesForDay = movieDayMap[day] || null;

              let dayClasses =
                'w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors select-none';

              if (isToday) {
                if (moviesForDay) {
                  dayClasses += ' bg-blue-500 text-white shadow-md ring-4 ring-amber-200 hover:bg-blue-600';
                } else {
                  dayClasses += ' bg-amber-500 text-white shadow-md ring-4 ring-amber-100 hover:bg-amber-600';
                }
              } else {
                if (moviesForDay) {
                  dayClasses += ' bg-blue-500 text-white shadow-md hover:bg-blue-600 ring-2 ring-blue-200';
                } else {
                  dayClasses += ' text-gray-700 hover:bg-gray-100';
                }
              }

              let tooltipPosClass = 'bottom-full mb-2';
              if (wIdx === 0 || wIdx === 1) tooltipPosClass = 'top-full mt-2';

              let tooltipAlignClass = 'left-1/2 -translate-x-1/2';
              if (dIdx === 0 || dIdx === 1) tooltipAlignClass = 'left-0';
              if (dIdx === 5 || dIdx === 6) tooltipAlignClass = 'right-0';

              return (
                <div
                  key={dIdx}
                  className="relative p-1 flex items-center justify-center cursor-pointer group min-h-0"
                >
                  <span className={dayClasses}>{day}</span>

                  {moviesForDay && (
                    <div
                      className={`absolute ${tooltipPosClass} ${tooltipAlignClass} bg-slate-900 text-white rounded-xl shadow-2xl p-3 border border-slate-800 text-xs z-[100] w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto`}
                    >
                      <div className="font-extrabold text-[11px] text-blue-300 uppercase tracking-wider border-b border-slate-700 pb-1 mb-2 text-left">
                        {`${day} ${nomiMesiLungo[month]}`}
                      </div>

                      <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-0.5 custom-scrollbar">
                        {moviesForDay.map((m, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              openMovieDetail({
                                tmdb_id: m.movie_tmdb_id,
                                title: m.title,
                                poster_path: m.poster_path,
                              });
                            }}
                            className="bg-slate-800/90 rounded-lg p-1.5 text-[11px] font-medium text-slate-200 flex items-center gap-2 border-l-2 border-blue-500 text-left hover:bg-slate-700 cursor-pointer transition-colors"
                          >
                            <img
                              src={
                                m.poster_path
                                  ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
                                  : '/no-poster.png'
                              }
                              alt={m.title}
                              className="w-6 h-9 object-cover rounded shrink-0 shadow-xs"
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-bold truncate text-white" title={m.title}>
                                {m.title}
                              </span>
                              <span className="text-[10px] text-blue-300 font-semibold">
                                {m.is_recent_release ? '🎬 Al cinema' : 'Uscita'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10 pointer-events-none">
          <span className="text-xs font-bold text-gray-500 bg-white/90 px-3 py-1 rounded-full shadow-xs">
            Caricamento...
          </span>
        </div>
      )}
    </div>
  );
};
