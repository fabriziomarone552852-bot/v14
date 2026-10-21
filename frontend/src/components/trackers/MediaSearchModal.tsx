import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { api } from '@/api/apiService';
import { TvIcon, SearchIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import type { GenericSuccessResponse } from '@/types/trackers';
import { showTrackerToast } from '@/components/trackers/TrackerToast';

interface SearchResultItem {
  id: number | string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  volumeInfo?: {
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

interface MediaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType?: 'series' | 'movies' | 'books'; // Renderlo opzionale per retrocompatibilità momentanea
}

export const MediaSearchModal: React.FC<MediaSearchModalProps> = ({ isOpen, onClose, mediaType = 'series' }) => {
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
    queryKey: ['media', 'search', mediaType, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const data = await api.get<{ results?: SearchResultItem[]; items?: SearchResultItem[] }>(`/trackers/${mediaType}/search`, { params: { query: debouncedQuery, page: 1 } });
      return data;
    },
    enabled: !!debouncedQuery.trim(),
  });

  const addMediaMutation = useMutation({
    mutationFn: async (payload: { tmdb_id?: number; provider_id?: string; status: string }) => {
      const endpoint = `/trackers/${mediaType}`;
      const data = await api.post<SearchResultItem | GenericSuccessResponse>(endpoint, payload);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['trackers', mediaType] });
      // Modifica ottimistica olografica: la disabilitiamo per i tipi generici per ora per evitare crash, 
      // si aggiornerà al refetch
      onClose(); // Chiudi la modale immediatamente per UX fluida
      showTrackerToast('Serie aggiunta alla libreria', 'success');
      return {};
    },
    onError: (err: unknown) => {
      console.error("Error adding media:", err);
      const apiErr = err as { response?: { data?: { detail?: string } } };
      showTrackerToast(apiErr.response?.data?.detail || "Errore durante l'aggiunta", 'warning');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', mediaType] });
    }
  });

  const handleAdd = (id: number | string, status: string = 'to_watch') => {
    // Gestione id dinamica (TMDB vs Google Books)
    const payload = typeof id === 'number' ? { tmdb_id: id, status } : { provider_id: id, status };
    addMediaMutation.mutate(payload);
  };

  const results: SearchResultItem[] = data?.results || data?.items || [];

  const getTitle = () => {
    if (mediaType === 'series') return 'Aggiungi Serie TV';
    if (mediaType === 'movies') return 'Aggiungi Film';
    if (mediaType === 'books') return 'Aggiungi Libro';
    return 'Aggiungi';
  };

  const getPlaceholder = () => {
    if (mediaType === 'series') return 'Cerca una serie su TMDB...';
    if (mediaType === 'movies') return 'Cerca un film su TMDB...';
    if (mediaType === 'books') return 'Cerca un libro...';
    return 'Cerca...';
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={getTitle()} maxWidthClass="max-w-3xl">
      <div className="flex flex-col h-[70vh]">
        {/* Header Search */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder={getPlaceholder()} 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <LoadingIcon className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-xl border border-red-200">
              Errore durante la ricerca. Riprova più tardi.
            </div>
          )}

          {!debouncedQuery.trim() ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <SearchIcon className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-lg">Inizia a digitare per cercare...</p>
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <TvIcon className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-lg">Nessun risultato trovato.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((item) => {
                const id = item.id;
                const title = item.title || item.name;
                const releaseDate = item.release_date || item.first_air_date || item.volumeInfo?.publishedDate;
                
                let posterPath = null;
                if (item.poster_path) posterPath = `https://image.tmdb.org/t/p/w200${item.poster_path}`;
                else if (item.volumeInfo?.imageLinks?.thumbnail) posterPath = item.volumeInfo.imageLinks.thumbnail;

                return (
                  <div key={id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full bg-gray-100 flex-shrink-0">
                      {posterPath ? (
                        <img src={posterPath} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-300">
                          <TvIcon className="w-10 h-10" />
                        </div>
                      )}
                      
                      {/* Overlay Azioni Hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 backdrop-blur-sm">
                        <button 
                          onClick={() => handleAdd(id, 'to_watch')}
                          className="w-full py-1.5 px-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors transform hover:scale-105"
                        >
                          Da {mediaType === 'books' ? 'Leggere' : 'Vedere'}
                        </button>
                        <button 
                          onClick={() => handleAdd(id, 'watching')}
                          className="w-full py-1.5 px-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition-colors transform hover:scale-105"
                        >
                          In {mediaType === 'books' ? 'Lettura' : 'Visione'}
                        </button>
                        <button 
                          onClick={() => handleAdd(id, 'watched')}
                          className="w-full py-1.5 px-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors transform hover:scale-105"
                        >
                          {mediaType === 'books' ? 'Letto' : 'Visto'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-3 flex flex-col flex-grow justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2" title={title}>
                          {title}
                        </h4>
                        {releaseDate && (
                          <span className="text-xs text-gray-500 font-semibold mt-1 block">
                            {new Date(releaseDate).getFullYear()}
                          </span>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleAdd(id, 'to_watch')}
                        className="mt-3 w-full py-1.5 border-2 border-blue-100 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors md:hidden"
                      >
                        Aggiungi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};
