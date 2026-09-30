import React, { useState } from 'react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode } from '@/types/trackers';
import { EpisodeDetailView } from './EpisodeDetailView';
import { StarRating } from './StarRating';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';

interface SeasonsTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  initialEpisode?: TMDBEpisode | null;
  initialReviewLogId?: number;
  isLoading?: boolean;
}

export const SeasonsTab: React.FC<SeasonsTabProps> = ({ tmdbSeries, initialEpisode, initialReviewLogId, isLoading, userTracking }) => {
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(initialEpisode || null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(initialEpisode ? initialEpisode.season_number : null);

  const { toggleEpisodeWatched } = useTrackersMutations();

  React.useEffect(() => {
    if (initialEpisode) {
      setSelectedEpisode(initialEpisode);
      setExpandedSeason(initialEpisode.season_number);
    }
  }, [initialEpisode]);

  const requireTracking = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!userTracking) {
      alert("Aggiungi prima la serie alla tua libreria.");
      return false;
    }
    return true;
  };

  const handleWatchCountChange = (e: React.MouseEvent, episodeId: number, delta: number) => {
    if (!requireTracking(e)) return;
    if (delta > 0) {
      toggleEpisodeWatched({ episode_id: episodeId, watched: true });
    } else if (delta < 0) {
      toggleEpisodeWatched({ episode_id: episodeId, watched: false });
    }
  };

  const handleToggleEpisode = (e: React.MouseEvent, episodeId: number, currentWatchCount: number) => {
    if (!requireTracking(e)) return;
    if (currentWatchCount > 0) {
      toggleEpisodeWatched({ episode_id: episodeId, watched: false });
    } else {
      toggleEpisodeWatched({ episode_id: episodeId, watched: true });
    }
  };

  const handleSeasonToggle = (e: React.MouseEvent, _seasonNumber: number, episodes: TMDBEpisode[], seasonMinWatchCount: number) => {
    if (!requireTracking(e)) return;
    const isChecked = seasonMinWatchCount > 0;
    
    for (const ep of episodes) {
      const current = ep.watch_count || 0;
      if (isChecked) {
         toggleEpisodeWatched({ episode_id: ep.id, watched: false });
      } else {
         if (current <= seasonMinWatchCount) {
             toggleEpisodeWatched({ episode_id: ep.id, watched: true });
         }
      }
    }
  };

  const changeAllEpisodes = (episodes: TMDBEpisode[], delta: number, targetCount: number) => {
    if (!requireTracking()) return;
    for (const ep of episodes) {
      const current = ep.watch_count || 0;
      if (current === targetCount) {
        if (delta > 0) {
          toggleEpisodeWatched({ episode_id: ep.id, watched: true });
        } else if (delta < 0) {
          toggleEpisodeWatched({ episode_id: ep.id, watched: false });
        }
      }
    }
  };

  const roundRating = (val: number): number => {
    const intPart = Math.floor(val);
    const frac = val - intPart;
    if (frac < 0.25) return intPart;
    if (frac > 0.75) return intPart + 1;
    return intPart + 0.5;
  };

  if (selectedEpisode) {
    // Find latest episode data from tmdbSeries.episodes
    const latestEpisodeData = tmdbSeries.episodes?.find(ep => ep.id === selectedEpisode.id) || selectedEpisode;
    const logs = latestEpisodeData.logs || [];

    return (
      <EpisodeDetailView 
        episode={latestEpisodeData} 
        tmdbSeries={tmdbSeries}
        logs={logs} 
        onBack={() => setSelectedEpisode(null)} 
        initialView={initialEpisode && initialEpisode.id === selectedEpisode.id ? 'reviews' : 'main'}
        initialReviewLogId={initialReviewLogId}
      />
    );
  }

  // Gruppo episodi per stagione
  const seasonsMap: Record<number, TMDBEpisode[]> = {};
  const episodes = tmdbSeries.episodes || [];
  
  
    if (episodes.length === 0) {
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Caricamento episodi...</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Sincronizzazione con il database in corso, attendere.
            </p>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Nessun episodio disponibile</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Gli episodi di questa serie non sono ancora stati rilasciati o non sono presenti nel database.
          </p>
        </div>
      );
    } else {

    episodes.forEach(ep => {
      if (!seasonsMap[ep.season_number]) seasonsMap[ep.season_number] = [];
      seasonsMap[ep.season_number].push(ep);
    });
  }

  const seasonsList = Object.keys(seasonsMap).map(Number).sort((a,b) => a-b);


  // Componente per i controlli Rewatch che preserva lo spazio fisso
  const RewatchControls = ({ 
    count, 
    onAdd, 
    onSub, 
    onToggle 
  }: { 
    count: number, 
    onAdd: (e: React.MouseEvent) => void, 
    onSub: (e: React.MouseEvent) => void, 
    onToggle: (e: React.MouseEvent) => void 
  }) => {
    const isWatched = count > 0;
    return (
      <div className="relative flex items-center justify-center gap-1 w-[104px] shrink-0" onClick={e => e.stopPropagation()}>
        <button 
          className={`w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent hover:border-red-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto ${!isWatched ? 'invisible' : ''}`}
          onClick={onSub}
          title="Rimuovi una visione"
        >
          -1
        </button>

        <div 
          className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
            isWatched 
              ? 'bg-blue-500 border-blue-500 text-white shadow-md' 
              : 'border-gray-300 text-transparent hover:border-blue-400'
          }`}
          onClick={onToggle}
        >
          {count > 1 ? (
            <span className="text-[12px] font-extrabold leading-none tracking-tighter">X{count}</span>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <button 
          className={`w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent hover:border-blue-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto ${!isWatched ? 'invisible' : ''}`}
          onClick={onAdd}
          title="Aggiungi visione"
        >
          +1
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      
      {seasonsList.map(seasonNumber => {
        const seasonEpisodes = seasonsMap[seasonNumber];
        const isExpanded = expandedSeason === seasonNumber;
        
        // Stats for season
        const total = seasonEpisodes.length;
        const watched = seasonEpisodes.filter(ep => (ep.watch_count || 0) > 0).length;
        
        let seasonMinWatchCount = Infinity;
        if (total > 0) {
          seasonEpisodes.forEach(ep => {
            const count = ep.watch_count || 0;
            if (count < seasonMinWatchCount) seasonMinWatchCount = count;
          });
        } else {
          seasonMinWatchCount = 0;
        }

        // Media Voti
        let totalSeasonRating = 0;
        let ratedEpisodesCount = 0;

        seasonEpisodes.forEach(ep => {
          const ratedLogs = (ep.logs || []).filter((l: any) => l.rating !== null && l.rating !== undefined);
          if (ratedLogs.length > 0) {
            const epAverage = ratedLogs.reduce((sum: number, r: any) => sum + r.rating, 0) / ratedLogs.length;
            totalSeasonRating += epAverage;
            ratedEpisodesCount++;
          }
        });

        let averageRating: string | null = null;
        if (ratedEpisodesCount > 0) {
          const rawAverage = (totalSeasonRating / ratedEpisodesCount) / 2;
          averageRating = roundRating(rawAverage).toString();
        }

        return (
          <div key={seasonNumber} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Season Header */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none group"
              onClick={() => setExpandedSeason(isExpanded ? null : seasonNumber)}
            >
              <div className="flex items-center gap-2">
                <RewatchControls 
                  count={seasonMinWatchCount} 
                  onToggle={(e) => handleSeasonToggle(e, seasonNumber, seasonEpisodes, seasonMinWatchCount)}
                  onAdd={(e) => { e.stopPropagation(); changeAllEpisodes(seasonEpisodes, 1, seasonMinWatchCount); }}
                  onSub={(e) => { e.stopPropagation(); changeAllEpisodes(seasonEpisodes, -1, seasonMinWatchCount); }}
                />
                
                <h3 className="font-bold text-gray-900 text-lg">Stagione {seasonNumber}</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md ml-2">
                  {watched} / {total}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {averageRating && (
                  <div title={`Media basata su ${ratedEpisodesCount} episodi valutati`}>
                    <StarRating value={parseFloat(averageRating)} hideNumber={true} readonly iconClassName="w-4 h-4" />
                  </div>
                )}
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Episodes List */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                {seasonEpisodes.map(ep => {
                  const watchCount = ep.watch_count || 0;

                  return (
                    <div 
                      key={ep.id} 
                      className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 cursor-pointer group transition-colors"
                      onClick={() => setSelectedEpisode(ep)}
                    >
                      <div className="flex items-center gap-2">
                        
                        <RewatchControls 
                          count={watchCount} 
                          onToggle={(e) => handleToggleEpisode(e, ep.id, watchCount)}
                          onAdd={(e) => handleWatchCountChange(e, ep.id, 1)}
                          onSub={(e) => handleWatchCountChange(e, ep.id, -1)}
                        />

                        <div className="flex flex-col ml-1">
                          <span className="font-bold text-gray-800">
                            {ep.episode_number}. {ep.title || `Episodio ${ep.episode_number}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
