import React from 'react';
import { EyeIcon, EyePlayIcon, EyeHalfOpenIcon, EyeClosedIcon, LoadingIcon, TvIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { TMDBSeriesCard } from './TMDBSeriesCard';
import { MediaCard } from './MediaCard';
import type { TVSeries, TMDBSeriesSearchResult, TMDBPaginatedSearch } from '@/types/trackers';
import type { MediaFilterState as SeriesFilterState } from './MediaFilterModal';
import type { TabType } from './SeriesDetailModal/SeriesDetailModal';

interface TVSeriesLibraryProps {
  setIsFilterModalOpen: (b: boolean) => void;
  hasActiveFilters: boolean;
  searchQuery: string;
  setDebouncedQuery: (q: string) => void;
  handleFilterChange: (f: SeriesFilterState) => void;
  filters: SeriesFilterState;
  activeTab: string;
  setActiveTab: (t: 'all' | 'watching' | 'watched' | 'to_watch') => void;
  debouncedQuery: string;
  isSearchLoading: boolean;
  isDiscoverLoading: boolean;
  searchResults: TMDBPaginatedSearch | null | undefined;
  discoverData: TMDBPaginatedSearch | null | undefined;
  series: TVSeries[] | undefined;
  setDetailModalSeries: (s: TVSeries | Partial<TVSeries> | TMDBSeriesSearchResult) => void;
  setDetailModalTab: (t: TabType) => void;
  setDetailModalOpen: (b: boolean) => void;
  handleAdd: (id: number, e: React.MouseEvent) => void;
  displaySeries: TVSeries[];
  openSeriesDetail: (s: TVSeries) => void;
}

export const TVSeriesLibrary: React.FC<TVSeriesLibraryProps> = ({
  setIsFilterModalOpen, hasActiveFilters, searchQuery, setDebouncedQuery,
  handleFilterChange, filters, activeTab, setActiveTab, debouncedQuery,
  isSearchLoading, isDiscoverLoading, searchResults, discoverData, series,
  setDetailModalSeries, setDetailModalTab, setDetailModalOpen, handleAdd,
  displaySeries, openSeriesDetail
}) => {
  return (
    <div className="xl:col-span-8 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[600px] xl:h-full min-h-0 overflow-hidden relative">
           
       {/* Top Bar (Fluttuante) */}
       <div className="absolute top-5 left-5 right-8 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pointer-events-none">
         {/* Search Bar */}
         <div className="relative w-full sm:flex-1 sm:max-w-sm pointer-events-auto">
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className={`absolute inset-y-0 left-0 pl-3 pr-2 flex items-center cursor-pointer transition-colors z-10 outline-none ${hasActiveFilters ? 'text-blue-600 drop-shadow-sm' : 'text-gray-400 hover:text-blue-500'}`}
              title="Ricerca approfondita"
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               {hasActiveFilters && <span className="absolute top-2 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
            <input 
              type="text" 
              placeholder="Cerca serie TV..." 
              value={searchQuery}
              onChange={(e) => {
                 setDebouncedQuery(e.target.value);
                 handleFilterChange({ ...filters, keyword: e.target.value });
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white/95 backdrop-blur-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            />
         </div>

         <div className="flex items-center gap-3 pointer-events-auto">
             <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-full border border-gray-200 shrink-0 shadow-sm group transition-all duration-300 hover:gap-1">
                {['watched', 'watching', 'all', 'to_watch'].map((tab) => {
                  const isActive = activeTab === tab;
                  let icon = null;
                  let label = '';
                  if (tab === 'watched') { icon = <EyeIcon className="w-4 h-4" />; label = 'Visti'; }
                  else if (tab === 'watching') { icon = <EyePlayIcon className="w-4 h-4" />; label = 'In Corso'; }
                  else if (tab === 'all') { icon = <EyeHalfOpenIcon className="w-4 h-4" />; label = 'Tutti'; }
                  else { icon = <EyeClosedIcon className="w-4 h-4" />; label = 'Non Visti'; }
                  
                  return (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as 'all' | 'watching' | 'watched' | 'to_watch')}
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

       {/* GRIGLIA LOCANDINE */}
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
            {debouncedQuery || (filters.globalSearch && (filters.genre !== 'all' || filters.network !== 'all' || filters.year !== 'all')) ? (() => {
              const isLoading = debouncedQuery ? isSearchLoading : isDiscoverLoading;
              const results = debouncedQuery ? searchResults?.results : discoverData?.results;
              
              if (isLoading) {
                return (
                  <div className="col-span-full h-40 flex flex-col items-center justify-center gap-3 text-blue-500">
                    <LoadingIcon className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-medium">Ricerca in corso...</p>
                  </div>
                );
              }
              
              if (!results || results.length === 0) {
                return (
                  <div className="col-span-full h-40">
                     <EmptyState 
                       message={debouncedQuery ? `Nessun risultato trovato per "${debouncedQuery}"` : `Nessun risultato trovato`} 
                       icon={<TvIcon className="w-12 h-12 opacity-20" />} 
                     />
                  </div>
                );
              }
              
              return results.map((res: TMDBSeriesSearchResult) => {
                  const existingSeries = series?.find(s => s.tmdb_id === res.id);
                  return (
                    <TMDBSeriesCard 
                      key={res.id} 
                      result={res} 
                      existingSeries={existingSeries}
                      onCardClick={(mockSeries) => {
                        setDetailModalSeries(mockSeries);
                        setDetailModalTab('overview');
                        setDetailModalOpen(true);
                      }}
                      onAddClick={(tmdbId, e) => handleAdd(tmdbId, e)}
                    />
                  );
                });
              })()
             : displaySeries.length === 0 ? (
              <div className="col-span-full h-40">
                 <EmptyState 
                   message="Nessuna serie trovata." 
                   icon={<TvIcon className="w-12 h-12 opacity-20" />} 
                 />
              </div>
            ) : (
              displaySeries.map(s => (
                <MediaCard
                  key={s.id}
                  title={s.title}
                  posterPath={s.poster_path}
                  customPosterPath={s.custom_poster_path}
                  status={s.status}
                  externalStatus={s.tmdb_status}
                  onClick={() => openSeriesDetail(s)}
                />
              ))
            )}
         </div>
       </div>
    </div>
  );
};
