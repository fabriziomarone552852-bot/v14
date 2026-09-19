import React, { useState, useEffect } from 'react';
import { useMySeries } from '@/hooks/queries/useTrackersQueries';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { TvIcon, EyeIcon, EyeHalfOpenIcon, EyeClosedIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { GlassCardWidget } from './components/GlassCardWidget';
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
    [today.getDate()]: [{ seriesName: 'Scissione', episode: '01 S02' }],
    [today.getDate() + 1]: [{ seriesName: 'The Last of Us', episode: '01 S02' }],
    [today.getDate() + 4]: [{ seriesName: 'Silo', episode: '05 S02' }]
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative flex flex-col h-[320px]">
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

               return (
                 <div 
                   key={dIdx}
                   onClick={() => {/* TODO: Apri modale */}}
                   className={`relative p-1.5 border rounded-lg cursor-pointer min-h-0 flex flex-col justify-between group transition-colors duration-300 ${
                     isToday ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-400' : 'border-gray-200 bg-gray-50 hover:bg-blue-100/50 hover:border-blue-400'
                   }`}
                 >
                   <div className="flex justify-between items-start w-full">
                     <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
                       isToday ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 font-extrabold' : 'text-gray-600 font-bold group-hover:text-blue-700'
                     }`}>
                       {day}
                     </span>
                   </div>
                   
                   {/* Spazio per pallini stile MonthDayCell */}
                   <div className="flex flex-col gap-1 justify-center items-center mt-auto h-4 mb-0.5 pointer-events-none">
                     {upcomingForDay && (
                       <div className="flex gap-1 justify-center items-center w-full">
                         {upcomingForDay.slice(0, 4).map((evt, idx) => (
                           <div key={idx} className="h-1.5 w-1.5 rounded-full shrink-0 bg-blue-500" title={evt.seriesName}></div>
                         ))}
                         {upcomingForDay.length > 4 && <span className="text-[8px] leading-none text-gray-400 font-bold">+</span>}
                       </div>
                     )}
                   </div>
                 </div>
               )
             })}
           </React.Fragment>
         ))}
       </div>
    </div>
  )
}

const TVSeriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: series, isLoading, isError } = useMySeries();

  const [activeTab, setActiveTab] = useState<'all' | 'watching' | 'to_watch'>('all');
  const [goalViewType, setGoalViewType] = useState<'percent' | 'fraction'>('fraction');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
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
      
      {/* HEADER PRINCIPALE & PROGRESS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 items-center px-2 py-1 gap-4 shrink-0">
        <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 uppercase tracking-tight select-none xl:col-span-1">Serie TV</h1>
        
        {/* Goal Widget */}
        <div className="xl:col-span-3 flex justify-center w-full">
          <div 
            onClick={() => setGoalViewType(prev => prev === 'percent' ? 'fraction' : 'percent')}
            className="flex flex-col w-full max-w-lg bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow select-none relative group"
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
      </div>

      {/* TOP ROW: 3 GLASS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 shrink-0">
         <GlassCardWidget 
           label="Ultima aggiunta" 
           title={lastAdded?.title || "Nessuno"} 
           subtitle={""}
           posterPath={lastAdded?.poster_path || null} 
         />
         <GlassCardWidget 
           label="Continua a guardare" 
           title={lastWatched?.title || "Nessuno"} 
           subtitle={lastWatched ? "04 S02" : ""}
           posterPath={lastWatched?.poster_path || null} 
         />
         <GlassCardWidget 
           label="Completata!" 
           title={lastCompleted?.title || "Nessuno"} 
           subtitle={""}
           posterPath={lastCompleted?.poster_path || null} 
         />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LIBRERIA PRINCIPALE (8 Colonne) */}
        <div className="xl:col-span-8 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[600px] xl:h-full min-h-0 overflow-hidden relative">
           
           {/* Top Bar (Fluttuante) */}
           <div className="absolute top-5 left-5 right-8 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pointer-events-none">
             {/* Search Bar */}
             <div className="relative w-full sm:flex-1 sm:max-w-sm pointer-events-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Cerca serie TV..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white/95 backdrop-blur-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                />
             </div>

             <div className="flex items-center gap-3 pointer-events-auto">
                 {/* Filter Toggle */}
                 <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-full border border-gray-200 shrink-0 shadow-sm">
                    <button 
                      onClick={() => setActiveTab('watching')}
                      title="Visti"
                      className={`p-2 rounded-full transition-colors ${activeTab === 'watching' ? 'bg-blue-50 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('all')}
                      title="Tutti"
                      className={`p-2 rounded-full transition-colors ${activeTab === 'all' ? 'bg-blue-50 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <EyeHalfOpenIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('to_watch')}
                      title="Non Visti"
                      className={`p-2 rounded-full transition-colors ${activeTab === 'to_watch' ? 'bg-blue-50 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <EyeClosedIcon className="w-4 h-4" />
                    </button>
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
                      <div key={s.id} className="flex flex-col group cursor-pointer w-full relative" onClick={() => {/* TODO: apri modal serie */}}>
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
           

           {/* RANDOM BUTTON */}
           <div className="relative z-10 mt-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-sm p-5 text-white flex items-center justify-between cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0">
             <div>
                <h3 className="font-extrabold text-lg uppercase tracking-wider mb-1">Non so cosa guardare!</h3>
                <p className="text-sm font-medium text-blue-100">Scegliamo una serie a caso per te</p>
             </div>
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
           </div>
           
           {/* CITAZIONI (Nuvoletta) */}
           <div className="relative mt-2 mb-4 mx-2 drop-shadow-sm">
             <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 relative">
                <svg className="absolute -top-3 right-4 w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                <p className="text-gray-700 italic text-sm font-medium leading-relaxed">
                  "I am the one who knocks."
                </p>
                <p className="text-xs font-bold text-gray-400 mt-2 text-right">stagione 04 episodio 06, Breaking Bad</p>
             </div>
             {/* Coda del fumetto */}
             <div className="absolute -bottom-2 left-6 w-4 h-4 bg-gray-50 border-b border-l border-gray-200 transform -rotate-45"></div>
           </div>

           {/* CALENDARIO USCITE (sostituisce prossime uscite) */}
           <div className="mx-2 mb-4">
             <UpcomingCalendarWidget />
           </div>

        </div>

      </div>
    </div>
  );
};

export default TVSeriesPage;
