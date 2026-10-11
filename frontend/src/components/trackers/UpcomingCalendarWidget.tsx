import React from 'react';
import { generateWeeksGrid, nomiMesiLungo, getFirstDayIndex, getDaysInMonth } from '@/utils/dateUtils';
import { useUpcomingEpisodes } from '@/hooks/queries/useTrackersQueries';
import type { UpcomingEpisode } from '@/types/trackers';

interface UpcomingProps {
  openSeriesDetail: (series: { tmdb_id: number; title: string; poster_path?: string | null }) => void;
}

export const UpcomingCalendarWidget = ({ openSeriesDetail }: UpcomingProps) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDayIdx = getFirstDayIndex(year, month);
  const daysInMo = getDaysInMonth(year, month);
  const weeks = generateWeeksGrid(firstDayIdx, daysInMo);

  // Fetch -2 to +2 months dynamically relative to the currently viewed month
  const startDateStr = new Date(year, month - 2, 1).toISOString().split('T')[0];
  const endDateStr = new Date(year, month + 3, 0).toISOString().split('T')[0];
  const { data: upcomingData } = useUpcomingEpisodes(startDateStr, endDateStr);

  const upcomingMap: Record<number, UpcomingEpisode[]> = {};
  if (upcomingData) {
      upcomingData.forEach((ep: UpcomingEpisode) => {
          const epDate = new Date(ep.air_date);
          if (epDate.getFullYear() === year && epDate.getMonth() === month) {
              const d = epDate.getDate();
              if (!upcomingMap[d]) upcomingMap[d] = [];
              upcomingMap[d].push(ep);
          }
      });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative flex flex-col h-full">
       {/* Header */}
       <div className="flex justify-center items-center mb-3 border-b border-gray-100 pb-3 gap-4">
         <button onClick={handlePrev} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm bg-white active:scale-95">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
         </button>
         
         <div className="flex gap-1.5 items-baseline select-none">
           <h3 className="text-lg font-extrabold text-gray-800 capitalize">
             {nomiMesiLungo[month]}
           </h3>
           <span className="text-sm font-bold text-gray-400">
             {year}
           </span>
         </div>

         <button onClick={handleNext} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm bg-white active:scale-95">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
         </button>
       </div>

       {/* Days Header */}
       <div className="grid grid-cols-7 gap-1 text-center mb-1 flex-shrink-0">
         {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
           <div key={i} className="text-xs font-bold text-gray-400 uppercase py-1">{d}</div>
         ))}
       </div>

       {/* Grid Corpo */}
       <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 pb-1 auto-rows-fr">
         {weeks.map((week, wIdx) => (
           <React.Fragment key={wIdx}>
             {week.map((day, dIdx) => {
               if (day === null) return <div key={`empty-${wIdx}-${dIdx}`} className="p-2 border-transparent min-h-0"></div>;
               
               const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
               const upcomingForDay = upcomingMap[day] || null;

               let dayClasses = "w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors";
               
               if (isToday) {
                 if (upcomingForDay) {
                   dayClasses += " bg-blue-500 text-white shadow-md ring-4 ring-amber-200 hover:bg-blue-600";
                 } else {
                   dayClasses += " bg-amber-500 text-white shadow-md ring-4 ring-amber-100 hover:bg-amber-600";
                 }
               } else {
                 if (upcomingForDay) {
                   dayClasses += " bg-blue-500 text-white shadow-md hover:bg-blue-600";
                 } else {
                   dayClasses += " text-gray-700 hover:bg-gray-100";
                 }
               }

               let tooltipPosClass = "bottom-full mb-2";
               if (wIdx === 0 || wIdx === 1) tooltipPosClass = "top-full mt-2"; // Nelle prime righe lo mostriamo sotto

               let tooltipAlignClass = "left-1/2 -translate-x-1/2";
               if (dIdx === 0 || dIdx === 1) tooltipAlignClass = "left-0"; // A sinistra lo allineiamo a sinistra
               if (dIdx === 5 || dIdx === 6) tooltipAlignClass = "right-0"; // A destra lo allineiamo a destra

               return (
                 <div 
                   key={dIdx}
                   className="relative p-1 flex items-center justify-center cursor-pointer group min-h-0"
                 >
                   <span className={dayClasses}>
                     {day}
                   </span>
                   
                   {upcomingForDay && (
                     <div className={`absolute ${tooltipPosClass} ${tooltipAlignClass} bg-slate-900 text-white rounded-xl shadow-xl p-3 border border-slate-800 text-xs z-[100] w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto`}>
                       <div className="font-extrabold text-[11px] text-blue-300 uppercase tracking-wider border-b border-slate-700 pb-1 mb-2 text-left">
                         {`${day} ${nomiMesiLungo[month]}`}
                       </div>
                       <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
                         {upcomingForDay.map((ep: UpcomingEpisode, idx: number) => (
                           <div
                             key={idx}
                             onClick={(e) => {
                               e.stopPropagation();
                               openSeriesDetail({ 
                                 tmdb_id: ep.series_tmdb_id, 
                                 title: ep.series_title, 
                                 poster_path: ep.series_poster_path 
                               });
                             }}
                             className="bg-slate-800/80 rounded px-2 py-1.5 text-[11px] font-medium text-slate-200 truncate flex items-center gap-2 border-l-2 border-blue-500 text-left hover:bg-slate-700 cursor-pointer transition-colors"
                           >
                             <span className="text-[9px] font-bold text-slate-400 shrink-0 inline-flex items-center">
                               {`S${String(ep.season_number).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`}
                             </span>
                             <span className="truncate flex-1" title={ep.series_title}>
                               {ep.series_title}
                             </span>
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
    </div>
  );
};
