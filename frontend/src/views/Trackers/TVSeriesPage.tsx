import React, { useState, useEffect } from 'react';
import { useMySeries } from '@/hooks/queries/useTrackersQueries';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { TvIcon, EyeIcon, EyeHalfOpenIcon, EyeClosedIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { GlassCardWidget } from './components/GlassCardWidget';
import RandomSeriesModal from './components/RandomSeriesModal';
import { SeriesDetailModal, type TabType } from './components/SeriesDetailModal';
import type { TMDBEpisode } from '../../types/trackers';
import { generateWeeksGrid, nomiMesiLungo, getFirstDayIndex, getDaysInMonth } from '@/utils/dateUtils';

const UpcomingCalendarWidget = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDayIdx = getFirstDayIndex(year, month);
  const daysInMo = getDaysInMonth(year, month);
  const weeks = generateWeeksGrid(firstDayIdx, daysInMo);

  // Mock data for upcoming episodes
  const upcomingMap: Record<number, any[]> = {
    [today.getDate()]: [{ seriesName: 'Scissione', episode: 'S02E01' }],
    [today.getDate() + 1]: [{ seriesName: 'The Last of Us', episode: 'S02E01' }],
    [today.getDate() + 4]: [{ seriesName: 'Silo', episode: 'S02E05' }]
  };

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
               const upcomingForDay = month === today.getMonth() ? upcomingMap[day] : null;

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
                   onClick={() => {/* TODO: Apri modale */}}
                   className="relative p-1 flex items-center justify-center cursor-pointer group min-h-0"
                 >
                   <span className={dayClasses}>
                     {day}
                   </span>
                   
                   {upcomingForDay && (
                     <div className={`absolute ${tooltipPosClass} ${tooltipAlignClass} bg-slate-900 text-white rounded-xl shadow-xl p-3 border border-slate-800 text-xs z-[100] w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                       <div className="font-extrabold text-[11px] text-blue-300 uppercase tracking-wider border-b border-slate-700 pb-1 mb-2 text-left">
                         {`${day} ${nomiMesiLungo[month]}`}
                       </div>
                       <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
                         {upcomingForDay.map((item: any, idx: number) => (
                           <div
                             key={idx}
                             className="bg-slate-800/80 rounded px-2 py-1.5 text-[11px] font-medium text-slate-200 truncate flex items-center gap-2 border-l-2 border-blue-500 text-left"
                           >
                             <span className="text-[9px] font-bold text-slate-400 shrink-0 inline-flex items-center">
                               {item.episode}
                             </span>
                             <span className="truncate flex-1" title={item.seriesName}>
                               {item.seriesName}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               )
             })}
           </React.Fragment>
         ))}
       </div>
    </div>
  );
};

const UpcomingEpisodesWidget = () => {
  const upcoming = [
    { id: 1, seriesName: 'Scissione', episode: 'S02E01', date: 'Oggi', poster: null },
    { id: 2, seriesName: 'The Last of Us', episode: 'S02E01', date: 'Domani', poster: null },
    { id: 3, seriesName: 'Silo', episode: 'S02E05', date: '23/09', poster: null }
  ];

  return (
    <div className="flex flex-col h-full overflow-visible justify-center w-full">
      <div className="flex gap-5 overflow-x-auto pt-4 pb-4 px-4 snap-x items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {upcoming.map(ep => (
          <div key={ep.id} className="w-[110px] flex flex-col shrink-0 snap-start cursor-pointer hover:scale-110 hover:z-20 transition-all duration-300">
            <div className="aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden shadow-sm relative border-2 border-transparent hover:border-blue-400 transition-colors group">
              <img src="/no-poster.png" alt="" className="w-full h-full object-cover opacity-50" />
              
              {/* TOP: Date */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent pt-2 pb-5 px-1">
                <p className="text-[10px] text-blue-400 font-extrabold uppercase text-center drop-shadow-md">{ep.date}</p>
              </div>

              {/* BOTTOM: Episode and Name */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-2 px-1 flex flex-col justify-end items-center">
                <p className="text-[10px] text-white/90 font-bold text-center drop-shadow-md">{ep.episode}</p>
                <p className="text-[11px] text-white font-extrabold text-center drop-shadow-md truncate w-full px-1" title={ep.seriesName}>{ep.seriesName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TVSeriesPage: React.FC = () => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalSeries, setDetailModalSeries] = useState<any>(null);
  const [detailModalTab, setDetailModalTab] = useState<TabType>('overview');
  const [detailModalEpisode, setDetailModalEpisode] = useState<TMDBEpisode | undefined>(undefined);

  const openSeriesDetail = (series: any, tab: TabType = 'overview', episode?: TMDBEpisode) => {
    setDetailModalSeries(series);
    setDetailModalTab(tab);
    setDetailModalEpisode(episode);
    setDetailModalOpen(true);
  };
  const queryClient = useQueryClient();
  const { data: series, isLoading, isError } = useMySeries();

  const [activeTab, setActiveTab] = useState<'all' | 'watching' | 'to_watch'>('all');
  const [goalViewType, setGoalViewType] = useState<'percent' | 'fraction'>('fraction');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [isRandomModalOpen, setRandomModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['tmdb', 'search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const data = await api.get<any>(`/trackers/series/search`, { params: { query: debouncedQuery, page: 1 } });
      return data;
    },
    enabled: !!debouncedQuery.trim(),
  });

  const addSeriesMutation = useMutation({
    mutationFn: async (payload: { tmdb_id: number; status: string }) => {
      const data = await api.post<any, any>('/trackers/series', payload);
      return data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'series'] });
      const previousSeries = queryClient.getQueryData(['trackers', 'series']);
      
      const seriesDetails = searchResults?.results?.find((s: any) => s.id === payload.tmdb_id);

      if (seriesDetails) {
        queryClient.setQueryData(['trackers', 'series'], (old: any) => {
          const newSeries = {
            id: -Math.floor(Math.random() * 100000), // Fake ID
            tmdb_id: seriesDetails.id,
            title: seriesDetails.name,
            original_title: seriesDetails.original_name || '',
            overview: seriesDetails.overview || '',
            poster_path: seriesDetails.poster_path || '',
            backdrop_path: seriesDetails.backdrop_path || '',
            status: payload.status,
            added_at: new Date().toISOString(),
            episodes: [],
          };
          return [newSeries, ...(old || [])];
        });
      }
      return { previousSeries };
    },
    onError: (err: any, _variables, context: any) => {
      if (context?.previousSeries) {
        queryClient.setQueryData(['trackers', 'series'], context.previousSeries);
      }
      console.error("Error adding series:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    }
  });

  const handleAdd = (tmdbId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    addSeriesMutation.mutate({ tmdb_id: tmdbId, status: 'to_watch' });
  };

  if (isLoading) {
    return <PageLoadingState messages={['Caricamento Libreria Serie TV...']} />;
  }

  if (isError) {
    return <PageErrorState message="Errore nel caricamento delle Serie TV." onRetry={() => queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] })} />;
  }

  const watchingSeries = series?.filter(s => s.status === 'watching') || [];
  const toWatchSeries = series?.filter(s => s.status === 'to_watch') || [];
  const watchedSeries = series?.filter(s => s.status === 'watched') || [];
  
  const displaySeries = (activeTab === 'all' ? (series || []) : activeTab === 'watching' ? watchingSeries : toWatchSeries)
    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Mocks for top cards
  const lastAdded = series && series.length > 0 ? series[series.length - 1] : null;
  const lastWatched = watchingSeries.length > 0 ? watchingSeries[0] : null;
  const lastCompleted = watchedSeries.length > 0 ? watchedSeries[0] : null;

  const goal = 300;
  const currentEpisodes = 120; // Mock
  const goalPercent = Math.min(100, Math.round((currentEpisodes / goal) * 100));

  return (
    <div className="flex flex-col gap-5 max-w-[1600px] mx-auto min-h-full xl:h-full xl:overflow-hidden relative p-2 xl:p-0">
      
      {/* HEADER PRINCIPALE & PROGRESS BAR (Flex 20 Colonne) */}
      <div className="flex flex-col md:flex-row items-center px-2 py-1 shrink-0 w-full gap-4 md:gap-0">
        
        {/* 1. Titolo (1 parte) */}
        <div className="flex items-center w-full md:w-auto" style={{ flex: 1 }}>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 uppercase tracking-tight select-none whitespace-nowrap">Serie TV</h1>
        </div>
        
        {/* 2. Spazio vuoto (3 parti) */}
        <div className="hidden md:block" style={{ flex: 3 }}></div>

        {/* 3. Goal Widget (11 parti centrali) */}
        <div className="flex justify-center w-full" style={{ flex: 11 }}>
          <div 
            onClick={() => setGoalViewType(prev => prev === 'percent' ? 'fraction' : 'percent')}
            className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow select-none relative group"
          >
             <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); /* TODO: apri statistiche */ }} 
                  className="bg-blue-50 text-blue-600 p-1.5 rounded-lg hover:bg-blue-100 border border-blue-200 shadow-sm transition-colors"
                  title="Vedi Statistiche"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </button>
             </div>
             <div className="flex justify-center items-center mb-2 gap-4">
               <span className="text-sm md:text-base font-extrabold text-gray-600 uppercase tracking-wider text-center">Obiettivo Annuale di Episodi</span>
               <span className="text-lg font-bold text-blue-600">
                  {goalViewType === 'percent' ? `${goalPercent}%` : `${currentEpisodes}/${goal}`}
               </span>
             </div>
             <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${goalPercent}%` }} />
             </div>
          </div>
        </div>

        {/* 4. Spazio vuoto (3 parti) */}
        <div className="hidden md:block" style={{ flex: 3 }}></div>

        {/* 5. Pulsante Random (Cerchio col Punto Interrogativo espandibile, 1 parte) */}
        <div className="flex justify-center items-center w-full md:w-auto relative h-12" style={{ flex: 1 }}>
           <button 
             onClick={() => setRandomModalOpen(true)}
             title="Non sai cosa guardare? Scegliamo noi per te!"
             className="absolute right-0 group h-12 px-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all z-30"
           >
              <span className="max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:mr-2 transition-all duration-500 ease-in-out font-bold text-xs overflow-hidden whitespace-nowrap text-left leading-tight">
                Non sai cosa guardare?<br/>Scegliamo noi per te!
              </span>
              <svg className="w-6 h-6 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </button>
        </div>

        {/* 6. Spazio vuoto finale (1 parte) */}
        <div className="hidden md:block" style={{ flex: 1 }}></div>
      </div>

      {/* TOP ROW: 3 GLASS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 shrink-0">
         <GlassCardWidget 
           label="Ultima aggiunta" 
           title={lastAdded?.title || "Nessuno"} 
           subtitle={""}
           posterPath={lastAdded?.poster_path || null} onClick={() => lastAdded && openSeriesDetail(lastAdded)} 
         />
         <GlassCardWidget 
           label="Continua a guardare" 
           title={lastWatched?.title || "Nessuno"} 
           subtitle={lastWatched ? "S02E04" : ""}
           posterPath={lastWatched?.poster_path || null} onClick={() => lastWatched && openSeriesDetail(lastWatched)} 
         />
         <GlassCardWidget 
           label="Completata!" 
           title={lastCompleted?.title || "Nessuno"} 
           subtitle={""}
           posterPath={lastCompleted?.poster_path || null} onClick={() => lastCompleted && openSeriesDetail(lastCompleted)} 
         />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LIBRERIA PRINCIPALE (8 Colonne) */}
        <div className="xl:col-span-8 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[600px] xl:h-full min-h-0 overflow-hidden relative">
           
           {/* Top Bar (Fluttuante) */}
           <div className="absolute top-5 left-5 right-8 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pointer-events-none">
             {/* Search Bar */}
             <div className="relative w-full sm:flex-1 sm:max-w-sm pointer-events-auto">
                <button 
                  onClick={() => { /* TODO: Implementare apertura modale Ricerca Approfondita */ }}
                  className="absolute inset-y-0 left-0 pl-3 pr-2 flex items-center cursor-pointer text-gray-400 hover:text-blue-500 transition-colors z-10 outline-none"
                  title="Ricerca approfondita"
                >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <input 
                  type="text" 
                  placeholder="Cerca serie TV..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white/95 backdrop-blur-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                />
             </div>

             <div className="flex items-center gap-3 pointer-events-auto">
                 {/* Filter Toggle Espandibile */}
                 <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-full border border-gray-200 shrink-0 shadow-sm group transition-all duration-300 hover:gap-1">
                    {['watching', 'all', 'to_watch'].map((tab) => {
                      const isActive = activeTab === tab;
                      let icon = null;
                      let label = '';
                      if (tab === 'watching') { icon = <EyeIcon className="w-4 h-4" />; label = 'Visti'; }
                      else if (tab === 'all') { icon = <EyeHalfOpenIcon className="w-4 h-4" />; label = 'Tutti'; }
                      else { icon = <EyeClosedIcon className="w-4 h-4" />; label = 'Non Visti'; }
                      
                      return (
                        <button 
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          title={label}
                          className={`rounded-full flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden
                            ${isActive ? 'w-8 h-8 opacity-100 bg-blue-50 shadow-sm text-blue-600' : 'w-0 h-8 opacity-0 group-hover:w-8 group-hover:opacity-100 text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
                          `}
                        >
                          {icon}
                        </button>
                      );
                    })}
                 </div>
             </div>
           </div>

           {/* GRIGLIA LOCANDINE CON CUSTOM SCROLLBAR E FADE EFFECT */}
           <div 
             className="relative flex-1 min-h-0 -mr-2"
             style={{ 
               WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 40px), transparent 100%)', 
               maskImage: 'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 40px), transparent 100%)' 
             }}
           >
             <div 
               className="absolute inset-0 overflow-y-auto modal-scrollbar pr-4 pb-8 pt-[120px] sm:pt-[80px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 content-start"
             >
                {debouncedQuery ? (
                  isSearchLoading ? (
                    <div className="col-span-full h-40 flex flex-col items-center justify-center gap-3 text-blue-500">
                      <LoadingIcon className="w-8 h-8 animate-spin" />
                      <p className="text-sm font-medium">Ricerca in corso...</p>
                    </div>
                  ) : searchResults?.results?.length === 0 ? (
                    <div className="col-span-full h-40">
                       <EmptyState 
                         message={`Nessun risultato trovato per "${debouncedQuery}"`} 
                         icon={<TvIcon className="w-12 h-12 opacity-20" />} 
                       />
                    </div>
                  ) : (
                    searchResults?.results?.map((res: any) => {
                      const existingSeries = series?.find(s => s.tmdb_id === res.id);
                      return (
                         <div key={res.id} className="flex flex-col group cursor-pointer w-full relative" onClick={() => !existingSeries && handleAdd(res.id, { stopPropagation: () => {} } as any)}>
                            <div className={`relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-100 shadow-sm border-[3px] transition-all duration-300 group-hover:scale-105 ${
                              existingSeries 
                                ? (existingSeries.status === 'watching' ? 'border-yellow-400' : (existingSeries.status === 'completed' || existingSeries.status === 'watched') ? (existingSeries.tmdb_status === 'Returning Series' ? 'border-purple-500' : 'border-green-500') : 'border-transparent') 
                                : 'border-transparent'
                            }`}>
                               {res.poster_path ? (
                                 <img src={`https://image.tmdb.org/t/p/w500${res.poster_path}`} alt={res.name} className="w-full h-full object-cover" />
                               ) : (
                                 <img src="/no-poster.png" alt="No Image" className="w-full h-full object-cover opacity-50" />
                               )}
                               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                               <div className="absolute bottom-0 inset-x-0 p-3">
                                  <h4 className="font-bold text-white line-clamp-2 text-sm leading-tight drop-shadow-md">{res.name}</h4>
                               </div>
                               
                               {/* Pulsantino + / V in stile AddButton */}
                               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); if(!existingSeries) handleAdd(res.id, e as any); }}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
                                      existingSeries 
                                        ? 'bg-blue-500 border-2 border-solid border-blue-500 text-white shadow-md' 
                                        : 'bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 text-white hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/90 shadow-sm'
                                    }`}
                                    title={existingSeries ? "Già in lista" : "Aggiungi alla lista"}
                                  >
                                    {existingSeries ? (
                                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    )}
                                  </button>
                               </div>
                            </div>
                         </div>
                      );
                    })
                  )
                ) : displaySeries.length === 0 ? (
                  <div className="col-span-full h-40">
                     <EmptyState 
                       message="Nessuna serie trovata." 
                       icon={<TvIcon className="w-12 h-12 opacity-20" />} 
                     />
                  </div>
                ) : (
                  displaySeries.map(s => {
                    const getBorderColor = (status: string, tmdbStatus?: string | null) => {
                      if (status === 'watching') return 'border-yellow-400';
                      if (status === 'completed' || status === 'watched') {
                        return tmdbStatus === 'Returning Series' ? 'border-purple-500' : 'border-green-500';
                      }
                      return 'border-transparent';
                    };
                    const borderColor = getBorderColor(s.status, s.tmdb_status);

                    return (
                      <div key={s.id} className="flex flex-col group cursor-pointer w-full relative" onClick={() => openSeriesDetail(s)}>
                         <div className={`relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-100 shadow-sm border-[3px] transition-all duration-300 group-hover:scale-105 ${borderColor}`}>
                            {s.poster_path ? (
                              <img src={`https://image.tmdb.org/t/p/w500${s.poster_path}`} alt={s.title} className="w-full h-full object-cover" />
                            ) : (
                              <img src="/no-poster.png" alt="No Image" className="w-full h-full object-cover opacity-50" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 inset-x-0 p-3">
                               <h4 className="font-bold text-white line-clamp-2 text-sm leading-tight drop-shadow-md">{s.title}</h4>
                            </div>
                         </div>
                      </div>
                    );
                  })
                )}
             </div>
           </div>
        </div>

        {/* SIDEBAR (4 Colonne) */}
        <div className="xl:col-span-4 flex flex-col gap-6 h-[600px] xl:h-full min-h-0 overflow-y-auto no-scrollbar pr-2">
           

           {/* CITAZIONI (Espandibile al clic) */}
           <div className={`relative mt-2 mb-4 mx-2 drop-shadow-sm transition-all duration-500 z-50 cursor-pointer ${isQuoteExpanded ? 'h-[250px]' : 'h-[130px]'}`}>
             
             {/* SVG Quote Icon spostato in absolute sul parent e NON nella card con overflow-hidden */}
             <svg className="absolute -top-3 right-4 w-8 h-8 text-gray-200 pointer-events-none z-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>

             <div 
               onClick={() => setIsQuoteExpanded(!isQuoteExpanded)}
               className={`bg-gray-50 border border-gray-200 rounded-2xl p-4 absolute top-0 left-0 right-0 h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 z-10 overflow-hidden`}
             >
                <style>
                  {`
                    /* Rimuoviamo scrollbar-width standard per forzare Webkit su Chrome */
                    .custom-quote-scrollbar::-webkit-scrollbar {
                      width: 6px;
                    }
                    .custom-quote-scrollbar::-webkit-scrollbar-track {
                      background: transparent;
                    }
                    .custom-quote-scrollbar::-webkit-scrollbar-thumb {
                      background-color: #cbd5e1;
                      border-radius: 10px;
                    }
                    .custom-quote-scrollbar::-webkit-scrollbar-button {
                      display: none !important;
                      width: 0px !important;
                      height: 0px !important;
                    }
                  `}
                </style>
                <div className={`relative flex-1 min-h-0 custom-quote-scrollbar transition-all duration-500 ${isQuoteExpanded ? 'overflow-y-auto pr-2 pb-2 mt-6 mb-4' : 'overflow-hidden'}`}>
                  <p className="text-gray-700 italic text-xs leading-relaxed">
                    {!isQuoteExpanded 
                      ? "\"Credo che la coscienza umana sia un tragico passo falso dell'evoluzione. Siamo diventati troppo consapevoli di noi stessi, la natura ha creato un aspetto della natura separato da se stessa...\""
                      : "\"Credo che la coscienza umana sia un tragico passo falso dell'evoluzione. Siamo diventati troppo consapevoli di noi stessi, la natura ha creato un aspetto della natura separato da se stessa, siamo creature che non dovrebbero esistere per le leggi della natura. E penso che l'unica cosa onorevole che la nostra specie possa fare sia negare la nostra programmazione, smetterla di riprodurci, procedere mano nella mano verso l'estinzione, un'ultima notte, fratelli e sorelle, che si tirano fuori da un patto iniquo.\""
                    }
                  </p>
                </div>

                <p className="text-[10px] font-bold text-gray-400 text-right shrink-0 mt-2 relative z-10">S01E01 True Detective</p>
                
                {/* Coda del fumetto */}
                <div className={`absolute -bottom-2 left-6 w-4 h-4 bg-gray-50 border-b border-l border-gray-200 transform -rotate-45 z-0 transition-opacity duration-300 ${isQuoteExpanded ? 'opacity-0' : 'opacity-100'}`}></div>
             </div>
           </div>

           {/* CALENDARIO / LOCANDINE */}
           <div className="mx-2 mb-4 overflow-visible flex-1 flex flex-col min-h-0 relative">
             <div className={`absolute inset-0 transition-all duration-500 ease-in-out origin-top flex flex-col min-h-0 ${isQuoteExpanded ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0 delay-100'}`}>
               <UpcomingCalendarWidget />
             </div>
             <div className={`absolute top-0 left-0 right-0 transition-all duration-500 ease-in-out origin-top flex flex-col min-h-0 ${isQuoteExpanded ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 pointer-events-none -translate-y-4'}`}>
               <UpcomingEpisodesWidget />
             </div>
           </div>

        </div>

      </div>

      <RandomSeriesModal 
        isOpen={isRandomModalOpen} 
        onClose={() => setRandomModalOpen(false)} 
        series={series || []} 
        onSeriesClick={(series) => {
          setRandomModalOpen(false);
          openSeriesDetail(series);
        }}
      />

      {detailModalSeries && (
        <SeriesDetailModal 
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          series={detailModalSeries}
          initialTab={detailModalTab}
          initialEpisode={detailModalEpisode}
          onToggleTrack={(tmdbId: number, isTracked: boolean) => {
            if (!isTracked) {
              addSeriesMutation.mutate({ tmdb_id: tmdbId, status: 'to_watch' } as any);
            }
          }}
        />
      )}
    </div>
  );
};

export default TVSeriesPage;
