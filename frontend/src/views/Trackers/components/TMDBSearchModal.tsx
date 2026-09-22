import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { api } from '@/api/apiService';
import { TvIcon, CloseIcon, SearchIcon, LoadingIcon } from '@/components/shared/utils/Icons';

interface TMDBSeriesSearchResult {
  id: number;
  name: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date?: string;
  vote_average?: number;
}

interface TMDBSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TMDBSearchModal: React.FC<TMDBSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, error } = useQuery({
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
      
      const seriesDetails = data?.results?.find((s: TMDBSeriesSearchResult) => s.id === payload.tmdb_id);

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
      
      onClose(); // Chiudi la modale immediatamente per UX fluida
      return { previousSeries };
    },
    onError: (err: any, _variables, context: any) => {
      if (context?.previousSeries) {
        queryClient.setQueryData(['trackers', 'series'], context.previousSeries);
      }
      console.error("Error adding series:", err);
      alert(err.response?.data?.detail || "Errore durante l'aggiunta della serie.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    }
  });

  const handleAdd = (tmdbId: number, status: string = 'to_watch') => {
    addSeriesMutation.mutate({ tmdb_id: tmdbId, status });
  };

  const results: TMDBSeriesSearchResult[] = data?.results || [];

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Aggiungi Serie TV" maxWidthClass="max-w-3xl">
      <div className="flex flex-col h-[70vh]">
        {/* Header Search */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cerca una serie su TMDB..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-blue-500 gap-3">
              <LoadingIcon className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Ricerca in corso...</p>
            </div>
          )}

          {!isLoading && !error && debouncedQuery && results.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
               <TvIcon className="w-12 h-12 opacity-20" />
               <p className="text-sm">Nessun risultato trovato per "{debouncedQuery}"</p>
             </div>
          )}

          {!isLoading && !debouncedQuery && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
               <SearchIcon className="w-12 h-12 opacity-20" />
               <p className="text-sm">Inizia a digitare per cercare una serie</p>
             </div>
          )}

          {error && (
             <div className="flex flex-col items-center justify-center h-full text-red-400 gap-3">
               <p className="text-sm font-medium">Errore durante la ricerca.</p>
             </div>
          )}

          <div className="flex flex-col gap-4">
            {results.map((series) => (
              <div key={series.id} className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Poster */}
                <div className="w-24 sm:w-32 shrink-0 bg-gray-100 flex items-center justify-center relative">
                  {series.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${series.poster_path}`} 
                      alt={series.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <TvIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 p-4 flex flex-col min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 truncate" title={series.name}>{series.name}</h4>
                      <p className="text-xs text-gray-500 mb-2 truncate">
                        {series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'Data sconosciuta'}
                        {series.vote_average ? ` • ⭐ ${series.vote_average.toFixed(1)}` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 flex-1">
                    {series.overview || "Nessuna descrizione disponibile."}
                  </p>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleAdd(series.id, 'to_watch')}
                      disabled={addSeriesMutation.isPending}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      + Da Guardare
                    </button>
                    <button 
                      onClick={() => handleAdd(series.id, 'watching')}
                      disabled={addSeriesMutation.isPending}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors hidden sm:block"
                    >
                      + In Corso
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
