import React, { useState } from 'react';
import { useMySeries } from '@/hooks/queries/useTrackersQueries';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { TvIcon, PlayIcon } from '@/components/shared/utils/Icons';
import { useQueryClient } from '@tanstack/react-query';

const TVSeriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: series, isLoading, isError } = useMySeries();

  const [activeTab, setActiveTab] = useState<'watching' | 'to_watch' | 'watched'>('watching');

  if (isLoading) {
    return <PageLoadingState messages={['Caricamento Libreria Serie TV...']} />;
  }

  if (isError) {
    return <PageErrorState message="Errore nel caricamento delle Serie TV." onRetry={() => queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] })} />;
  }

  const watchingSeries = series?.filter(s => s.status === 'watching') || [];
  const toWatchSeries = series?.filter(s => s.status === 'to_watch') || [];
  const watchedSeries = series?.filter(s => s.status === 'watched') || [];

  const displaySeries = activeTab === 'watching' ? watchingSeries : activeTab === 'to_watch' ? toWatchSeries : watchedSeries;

  return (
    <div className="flex flex-col gap-4 max-w-[1600px] mx-auto min-h-full xl:h-full xl:overflow-hidden relative p-2 xl:p-0">
      
      {/* HEADER WIDGET (Goals/Stats temporaneo) */}
      <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-sm shrink-0 flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
               <TvIcon className="w-8 h-8" />
               Tracker Serie TV
            </h1>
            <p className="opacity-80 mt-1">Stai seguendo {watchingSeries.length} serie TV in questo momento.</p>
         </div>
      </div>

      {/* GRIGLIA CENTRALE - BENTO BOX */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LIBRERIA PRINCIPALE (8 Colonne) */}
        <div className="xl:col-span-8 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[600px] xl:h-full min-h-0 overflow-hidden relative">
           
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab('watching')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'watching' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  In Visione ({watchingSeries.length})
                </button>
                <button 
                  onClick={() => setActiveTab('to_watch')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'to_watch' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Da Guardare ({toWatchSeries.length})
                </button>
                <button 
                  onClick={() => setActiveTab('watched')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'watched' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Completate ({watchedSeries.length})
                </button>
             </div>

             <button className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors">
                <span className="text-xl leading-none">+</span>
                Aggiungi Serie
             </button>
           </div>

           {/* GRIGLIA LOCANDINE CON CUSTOM SCROLLBAR */}
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {displaySeries.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center h-full text-gray-400">
                   <TvIcon className="w-16 h-16 mb-4 opacity-20" />
                   <p>Nessuna serie in questa sezione.</p>
                </div>
              ) : (
                displaySeries.map(s => (
                  <div key={s.id} className="flex flex-col group cursor-pointer">
                     <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 mb-2 shadow-sm">
                        {s.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w500${s.poster_path}`} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <PlayIcon className="w-12 h-12 text-white" />
                        </div>
                     </div>
                     <h4 className="font-semibold text-gray-800 line-clamp-1 text-sm" title={s.title}>{s.title}</h4>
                     <p className="text-xs text-gray-500">
                       {s.status === 'watching' ? 'In corso...' : s.status === 'to_watch' ? 'Da iniziare' : 'Completata'}
                     </p>
                  </div>
                ))
              )}
           </div>

        </div>

        {/* SIDEBAR (4 Colonne) */}
        <div className="xl:col-span-4 flex flex-col gap-6 h-[600px] xl:h-full min-h-0 overflow-y-auto custom-scrollbar pr-2">
           
           {/* CONTINUA A GUARDARE */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <PlayIcon className="w-5 h-5 text-indigo-500" /> 
                 Continua a guardare
              </h3>
              
              <div className="flex flex-col gap-3">
                 {watchingSeries.length === 0 ? (
                    <p className="text-sm text-gray-500">Non stai guardando nulla al momento.</p>
                 ) : (
                    watchingSeries.slice(0, 3).map(s => (
                       <div key={s.id} className="flex gap-3 items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                          <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden shrink-0">
                             {s.backdrop_path ? (
                                <img src={`https://image.tmdb.org/t/p/w300${s.backdrop_path}`} alt="Backdrop" className="w-full h-full object-cover" />
                             ) : s.poster_path ? (
                                <img src={`https://image.tmdb.org/t/p/w200${s.poster_path}`} alt="Poster" className="w-full h-full object-cover" />
                             ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-semibold text-sm text-gray-800 truncate">{s.title}</h4>
                             <p className="text-xs text-gray-500 truncate">Da aggiornare...</p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default TVSeriesPage;
