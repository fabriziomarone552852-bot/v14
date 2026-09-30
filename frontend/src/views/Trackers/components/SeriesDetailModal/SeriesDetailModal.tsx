import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode } from '@/types/trackers';
import { OverviewTab } from './OverviewTab';
import { SeasonsTab } from './SeasonsTab';
import { SeriesReviewTab } from './SeriesReviewTab';
import { MediaListManagerModal } from './MediaListManagerModal';
import { SeriesImageModal } from './SeriesImageModal';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useMediaLists, useFriendsSeriesReviews } from '@/hooks/queries/useTrackersQueries';
import { SeriesDetailListsBar } from './SeriesDetailListsBar';
import { AddButton } from '@/components/shared/utils/AddButton';
import { ListDetailModal } from './ListDetailModal';

interface SeriesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: TMDBSeries | UserSeriesTracking; // Can be global search result or user tracked
  initialTab?: TabType;
  initialEpisode?: TMDBEpisode | null;
  onToggleTrack?: (tmdbId: number, isTracked: boolean) => void;
  onSelectRecommendation?: (tmdbId: number) => void;
}

export type TabType = 'overview' | 'seasons' | 'review';

export const SeriesDetailModal: React.FC<SeriesDetailModalProps> = ({
  isOpen,
  onClose,
  series,
  initialTab = 'overview',
  initialEpisode = null,
  onToggleTrack,
  onSelectRecommendation
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [internalEpisode, setInternalEpisode] = useState<TMDBEpisode | null>(initialEpisode);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [showListsPanel, setShowListsPanel] = useState(false);
  const [isListManagerOpen, setIsListManagerOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [listDetailId, setListDetailId] = useState<number | null>(null);
  
  const [isPressing, setIsPressing] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const { markAllEpisodesWatched, updateSeries } = useTrackersMutations();
  const { data: mediaLists } = useMediaLists();

  // Reset states when opened with new series/tab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setInternalEpisode(initialEpisode);
    }
  }, [isOpen, initialTab, initialEpisode, 'tmdb_id' in series ? series.tmdb_id : series.series_tmdb_id]);

  // Fetch sempre i dettagli aggiornati per avere la lista episodi completa (lazy sync dal backend)
  const tmdbIdToFetch = 'tmdb_id' in series ? series.tmdb_id : ('series_tmdb_id' in series ? series.series_tmdb_id : (series as any).tmdb_series?.tmdb_id);
  const { data: detailData } = useQuery({
    queryKey: ['trackers', 'series', 'detail', tmdbIdToFetch],
    queryFn: async () => {
      try {
        const res = await api.get<any>(`/trackers/series/${tmdbIdToFetch}/preview`);
        return res || null;
      } catch (err) {
        return null;
      }
    },
    enabled: isOpen && !!tmdbIdToFetch,
    staleTime: 5 * 60 * 1000, // 5 minuti
    refetchInterval: (query: any) => {
      const data = query.state.data;
      if (data && (!data.episodes || data.episodes.length === 0) && data.total_episodes > 0) {
        return 2000;
      }
      return false;
    }
  });

  // Normalizziamo i dati aggirando oggetti freezati
  const isUserTracked = 'status' in series;
  let userTracking = isUserTracked ? (series as UserSeriesTracking) : null;
  
  // Creiamo una copia per non mutare l'oggetto React/Query
  let tmdbSeries = { ...('tmdb_series' in series ? series.tmdb_series! : (series as TMDBSeries)) };
  
  if (isUserTracked) {
      tmdbSeries.episodes = (series as any).episodes || [];
  }
  
  // Se abbiamo i dati dal fetch di dettaglio, li sovrascriviamo per avere gli episodi completi
  if (detailData) {
      tmdbSeries = { ...tmdbSeries, ...detailData };
      tmdbSeries.episodes = detailData.episodes || [];
  }

  const title = tmdbSeries.title || 'Dettaglio Serie';
  const posterUrl = userTracking?.custom_poster_path 
    ? resolveImageUrl(userTracking.custom_poster_path) 
    : (tmdbSeries.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbSeries.poster_path}` : 'https://placehold.co/500x750/e2e8f0/64748b?text=No+Poster');
  const backdropUrl = tmdbSeries.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbSeries.backdrop_path}` : 'https://placehold.co/1280x720/e2e8f0/64748b?text=No+Backdrop';

  const genres = tmdbSeries.genres ? tmdbSeries.genres.split(',').map(g => g.trim()) : [];

  const listsWithSeries = React.useMemo(() => {
    if (!mediaLists || !tmdbSeries.tmdb_id) return [];
    return mediaLists.filter(list => 
      list.items?.some((item: any) => item.series_tmdb_id === tmdbSeries.tmdb_id)
    );
  }, [mediaLists, tmdbSeries.tmdb_id]);
  const statusLabel = tmdbSeries.tmdb_status || 'Sconosciuto';

  // Logica icona status
  let StatusIcon = null;
  let statusColor = "bg-gray-500";
  let statusText = statusLabel;

  if (statusLabel === 'Canceled') {
    StatusIcon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>;
    statusColor = "bg-red-500";
    statusText = "Cancellata";
  } else if (statusLabel === 'Ended') {
    StatusIcon = <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
    statusColor = "bg-blue-500";
    statusText = "Conclusa";
  } else if (statusLabel === 'Returning Series' || statusLabel === 'In Production') {
    StatusIcon = <svg className="w-4 h-4 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>;
    statusColor = "bg-green-500";
    statusText = "In produzione";
  } else {
    StatusIcon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    statusText = statusLabel;
  }

  const { data: friendsReviews, isLoading: isFriendsLoading } = useFriendsSeriesReviews(tmdbIdToFetch, isOpen);
  const SERIES_FRIENDS = (friendsReviews || []).reduce((acc: any[], f) => {
    if (!acc.find(x => x.id === f.friend_id)) {
      let finalStatus = f.status || 'watching';
      if (finalStatus === 'to_watch') finalStatus = 'planned';
      if (finalStatus === 'watched') {
        const isEnded = (tmdbSeries as any).tmdb_status === 'Ended' || (tmdbSeries as any).tmdb_status === 'Canceled';
        finalStatus = isEnded ? 'completed' : 'waiting';
      }
      acc.push({
        id: f.friend_id,
        name: f.friend_name,
        avatar: f.friend_avatar ? resolveImageUrl(f.friend_avatar) : '/default_avatar.png',
        status: finalStatus
      });
    }
    return acc;
  }, []);

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'watching': return 'border-yellow-500';
      case 'completed': return 'border-green-500';
      case 'waiting': return 'border-purple-500';
      case 'dropped': return 'border-red-500';
      case 'planned':
      default: return 'border-gray-400';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidthClass="max-w-5xl"
      hideHeader={true}
    >
      <div className="-m-6 relative flex flex-col min-h-[70vh] max-h-[85vh] rounded-2xl overflow-hidden bg-gray-50">
        
        {/* HEADER BACKDROP */}
        <div className="relative h-48 shrink-0 bg-gray-900">
          <img 
            src={backdropUrl} 
            alt="Backdrop" 
            className="w-full h-full object-cover opacity-50 blur-sm scale-105"
          />
          {/* Tasto Chiudi in alto a destra */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-colors z-20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* BADGES IN ALTO A SINISTRA (sopra la locandina) */}
          <div className="absolute top-4 left-6 flex flex-wrap gap-2 max-w-xl z-20">
            {genres.map(g => (
              <span key={g} className="px-3 py-1 bg-black/40 text-white text-xs font-bold rounded-full backdrop-blur-md border border-white/20 shadow-lg">
                {g}
              </span>
            ))}
          </div>

          {/* AMICI CHE LA GUARDANO E LISTE (In basso a destra) */}
          <div className="absolute bottom-4 right-6 flex flex-col items-end gap-2 z-20 max-w-[calc(100%-340px)] justify-start">
             
             {/* AMICI (Rigo sopra) */}
             {(isFriendsLoading || SERIES_FRIENDS.length > 0) && (
               <div className="flex items-center flex-row-reverse gap-1.5">
                 {isFriendsLoading ? (
                   <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md animate-pulse border-2 border-white/50 shadow-md" title="Caricamento amici..."></div>
                 ) : SERIES_FRIENDS.length > 4 ? (
                    <div 
                      onClick={() => setShowFriendsPanel(true)}
                      className="relative cursor-pointer hover:z-30 transition-transform hover:scale-110 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-md text-blue-600"
                      title="Vedi tutti gli amici"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                    </div>
                 ) : (
                    SERIES_FRIENDS.map(f => (
                      <div key={f.id} onClick={() => setShowFriendsPanel(true)} className="relative group/friend cursor-pointer hover:z-30 transition-transform hover:scale-110">
                         <img src={f.avatar} alt={f.name} className={`w-8 h-8 object-cover rounded-full border-2 bg-gray-200 shadow-md ${getStatusBorderColor(f.status)}`} />
                         
                         {/* Tooltip on hover */}
                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/friend:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                           {f.name}
                         </div>
                      </div>
                    ))
                 )}
               </div>
             )}

             {/* Liste truncate con ResizeObserver */}
             <SeriesDetailListsBar 
               lists={listsWithSeries} 
               onOpenManager={() => setIsListManagerOpen(true)} 
               onOpenDrawer={(id) => {
                 if (id) {
                   setListDetailId(id);
                 } else {
                   setShowListsPanel(true);
                 }
               }}
             />
          </div>
        </div>

        {/* CONTENUTO PRINCIPALE */}
        <div className="flex-1 flex min-h-0 relative z-10">
          
          {/* COLONNA SINISTRA (Locandina e Menu) */}
          <div className="w-1/3 min-w-[250px] max-w-[300px] p-6 flex flex-col gap-6 relative z-20">
            {/* Locandina sovrapposta */}
            <div 
              className="group/poster -mt-32 w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-gray-200 shrink-0 relative z-30 cursor-pointer"
              onClick={() => {
                if (userTracking) {
                  setIsImageModalOpen(true);
                } else {
                  alert("Aggiungi prima la serie alla tua libreria per personalizzare la locandina.");
                }
              }}
            >
              <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
              
              {/* Overlay Fotocamera */}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 z-30">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg border border-white/30">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-bold uppercase tracking-wider drop-shadow-md">Cambia</span>
              </div>
              
              {/* Tasto Aggiungi / Segna tutti (in alto a destra) */}
              <div className="absolute top-2 right-2 z-40">
                <button 
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    isLongPressRef.current = false;
                    setIsPressing(true);
                    longPressTimerRef.current = setTimeout(() => {
                      isLongPressRef.current = true;
                      setIsPressing(false);
                      if (tmdbSeries.tmdb_id) {
                        markAllEpisodesWatched(tmdbSeries.tmdb_id);
                      }
                    }, 800); // 800ms per long press
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    setIsPressing(false);
                    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  }}
                  onPointerLeave={() => {
                    setIsPressing(false);
                    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isLongPressRef.current) {
                      isLongPressRef.current = false; // Reset for next time
                      return; // Ignora il click se è stato un long press
                    }
                    if (onToggleTrack && tmdbSeries.tmdb_id) {
                       onToggleTrack(tmdbSeries.tmdb_id, !!userTracking); 
                    }
                  }}
                  className={`w-9 h-9 flex items-center justify-center transition-all ${
                    isPressing ? 'rounded-full scale-95 duration-[800ms] ease-out bg-green-500' : 'rounded-xl active:scale-95 duration-200'
                  } ${
                    userTracking && !isPressing
                      ? 'bg-blue-500 border-2 border-solid border-blue-500 text-white shadow-md' 
                      : !isPressing ? 'bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 text-white hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/90 shadow-sm'
                      : 'border-2 border-solid border-blue-600 text-white shadow-md'
                  }`}
                  title={userTracking ? "Già in lista (Tieni premuto per segnare tutti come visti)" : "Aggiungi alla lista (Tieni premuto per segnare tutti come visti)"}
                >
                  {userTracking ? (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  )}
                </button>
              </div>

              {/* Tasto Stato in basso a destra */}
              <div className="absolute bottom-2 right-2 z-40 group/status">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white ${statusColor}`}>
                  {StatusIcon}
                </div>
                <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover/status:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                  {statusText}
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col gap-2">
              <NavButton 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                Panoramica
              </NavButton>
              <NavButton 
                active={activeTab === 'seasons'} 
                onClick={() => setActiveTab('seasons')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                }
              >
                Stagioni ed Episodi
              </NavButton>
              <NavButton 
                active={activeTab === 'review'} 
                onClick={() => setActiveTab('review')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
              >
                Recensioni e Citazioni
              </NavButton>
            </div>
          </div>

          {/* COLONNA DESTRA (Dinamica) */}
          <div className="flex-1 overflow-y-auto bg-transparent modal-scrollbar p-6 relative z-10">
            {activeTab === 'overview' && (
              <OverviewTab tmdbSeries={tmdbSeries} onSelectRecommendation={onSelectRecommendation} isLoading={false} />
            )}
            {activeTab === 'seasons' && (
              <SeasonsTab tmdbSeries={tmdbSeries} userTracking={userTracking} initialEpisode={internalEpisode} isLoading={!detailData || (!detailData.episodes || detailData.episodes.length === 0) && detailData?.total_episodes > 0} />
            )}
            {activeTab === 'review' && (
              <SeriesReviewTab 
                tmdbSeries={tmdbSeries} 
                userTracking={userTracking} 
                onOpenEpisode={(ep) => {
                  setInternalEpisode(ep);
                  setActiveTab('seasons');
                }}
              />
            )}
          </div>
        </div>
        
        {/* SIDEBAR LISTE */}
        {showListsPanel && (
          <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-2xl z-50 flex flex-col animate-fadeIn border-l border-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Liste ({listsWithSeries.length})</h3>
              <button 
                onClick={() => setShowListsPanel(false)}
                className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {listsWithSeries.map(list => (
                <div key={list.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-gray-100" onClick={() => setListDetailId(list.id)}>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-sm">{list.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <AddButton 
                 onClick={() => setIsListManagerOpen(true)} 
                 label="Aggiungi ad una lista" 
                 className="w-full justify-center"
              />
            </div>
          </div>
        )}

        {/* SIDEBAR AMICI */}
        {showFriendsPanel && (
          <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-2xl z-50 flex flex-col animate-fadeIn border-l border-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Amici ({SERIES_FRIENDS.length})</h3>
              <button 
                onClick={() => setShowFriendsPanel(false)}
                className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {SERIES_FRIENDS.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group/item">
                  <img src={f.avatar} alt={f.name} className={`w-10 h-10 rounded-full border-2 bg-gray-200 ${getStatusBorderColor(f.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-sm group-hover/item:text-blue-600 transition-colors">{f.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{f.status === 'watching' ? 'In visione' : f.status === 'completed' ? 'Completata' : f.status === 'waiting' ? 'In attesa' : f.status === 'dropped' ? 'Abbandonata' : 'In lista'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {isListManagerOpen && (
        <MediaListManagerModal 
          isOpen={isListManagerOpen}
          onClose={() => setIsListManagerOpen(false)}
          seriesId={tmdbSeries.tmdb_id}
        />
      )}
      {isImageModalOpen && (
        <SeriesImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          currentUrl={posterUrl}
          onSave={(url) => {
            if (tmdbSeries.tmdb_id) {
              updateSeries({ id: tmdbSeries.tmdb_id, updates: { custom_poster_path: url } });
            }
          }}
        />
      )}
      {listDetailId !== null && (
        <ListDetailModal
          isOpen={listDetailId !== null}
          onClose={() => setListDetailId(null)}
          listId={listDetailId}
        />
      )}
    </BaseModal>
  );
};

const NavButton = ({ active, onClick, children, icon }: { active: boolean, onClick: () => void, children: React.ReactNode, icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${
      active 
        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
    }`}
  >
    <div className={active ? 'text-blue-500' : 'text-gray-400'}>
      {icon}
    </div>
    {children}
  </button>
);





