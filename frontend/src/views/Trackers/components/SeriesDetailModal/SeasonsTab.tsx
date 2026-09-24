import React, { useState } from 'react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode, UserEpisodeLog } from '@/types/trackers';
import { EpisodeDetailView } from './EpisodeDetailView';

interface SeasonsTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  initialEpisode?: TMDBEpisode | null;
}

export const SeasonsTab: React.FC<SeasonsTabProps> = ({ tmdbSeries, initialEpisode }) => {
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(initialEpisode || null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(initialEpisode ? initialEpisode.season_number : null);

  React.useEffect(() => {
    if (initialEpisode) {
      setSelectedEpisode(initialEpisode);
      setExpandedSeason(initialEpisode.season_number);
    }
  }, [initialEpisode]);

  // MOCK LOGIC - Nella realtà userTracking.user_episode_logs conterrà i dati
  // Creiamo una mappa mock episode_id -> log count
  const [mockWatchCounts, setMockWatchCounts] = useState<Record<number, number>>({});

  const handleWatchCountChange = (e: React.MouseEvent, episodeId: number, delta: number) => {
    e.stopPropagation();
    setMockWatchCounts(prev => {
      const current = prev[episodeId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [episodeId]: next };
    });
  };

  const handleToggleEpisode = (e: React.MouseEvent, episodeId: number) => {
    e.stopPropagation();
    setMockWatchCounts(prev => {
      const current = prev[episodeId] || 0;
      return { ...prev, [episodeId]: current > 0 ? 0 : 1 }; // Toggle between 0 and 1
    });
  };

  const handleSeasonToggle = (e: React.MouseEvent, _seasonNumber: number, episodes: TMDBEpisode[]) => {
    e.stopPropagation();
    let minCount = Infinity;
    episodes.forEach(ep => {
      const count = mockWatchCounts[ep.id] || 0;
      if (count < minCount) minCount = count;
    });
    if (episodes.length === 0) minCount = 0;

    const isChecked = minCount > 0;
    
    setMockWatchCounts(prev => {
      const next = { ...prev };
      episodes.forEach(ep => {
        if (isChecked) {
          next[ep.id] = 0; // Uncheck all if the season was fully watched
        } else {
          // If the season was not fully watched, bring all episodes to at least 1 (or minCount + 1)
          const current = next[ep.id] || 0;
          if (current <= minCount) {
             next[ep.id] = minCount + 1;
          }
        }
      });
      return next;
    });
  };

  const changeAllEpisodes = (episodes: TMDBEpisode[], delta: number) => {
    let targetCount = Infinity;
    episodes.forEach(ep => {
      const c = mockWatchCounts[ep.id] || 0;
      if (c < targetCount) targetCount = c;
    });
    if (episodes.length === 0) targetCount = 0;

    // Se delta < 0, potremmo voler diminuire quelli che sono a targetCount, o targetCount stesso.
    // In realtà se min è 2, e togliamo, vogliamo che i 2 diventino 1.
    // Se delta > 0, vogliamo che i min (es. 2) diventino 3.
    setMockWatchCounts(prev => {
      const next = { ...prev };
      episodes.forEach(ep => {
        const current = next[ep.id] || 0;
        if (current === targetCount) {
          next[ep.id] = Math.max(0, current + delta);
        }
      });
      return next;
    });
  };

  // Mappa mock per i voti delle recensioni (epId -> array di voti). 
  // Inseriamo alcuni dati di test solo per la prima stagione (S1E1=101, S1E2=102...) per testare la media
  const [mockEpisodeRatings] = useState<Record<number, number[]>>({
    101: [4.18],       // S1E1: 4.18
    102: [3.66],       // S1E2: 3.66
    103: [3.5, 4.5],   // S1E3: vista 2 volte, voti 3.5 e 4.5 (media = 4)
    104: [2.43]        // S1E4: 2.43
  });

  // Funzione di arrotondamento specifica:
  // < 0.25 -> .0
  // tra 0.25 e 0.75 -> .5
  // > 0.75 -> +1.0
  const roundRating = (val: number): number => {
    const intPart = Math.floor(val);
    const frac = val - intPart;
    if (frac < 0.25) return intPart;
    if (frac > 0.75) return intPart + 1;
    return intPart + 0.5;
  };

  if (selectedEpisode) {
    // Render Episode Detail View
    const count = mockWatchCounts[selectedEpisode.id] || 0;
    const epRatings = mockEpisodeRatings[selectedEpisode.id] || [];
    const mockLogs: UserEpisodeLog[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      user_id: 1,
      episode_id: selectedEpisode.id,
      tmdb_id: selectedEpisode.id,
      season_number: selectedEpisode.season_number,
      episode_number: selectedEpisode.episode_number,
      review_visibility: 'friends_only',
      rating: epRatings[i] || undefined,
      notes: epRatings[i] ? `Recensione mock per test con voto ${epRatings[i]}` : undefined,
      watched_at: new Date().toISOString()
    }));

    return (
      <EpisodeDetailView 
        episode={selectedEpisode} 
        logs={mockLogs} 
        onBack={() => setSelectedEpisode(null)} 
      />
    );
  }

  // Gruppo episodi per stagione
  const seasonsMap: Record<number, TMDBEpisode[]> = {};
  const episodes = tmdbSeries.episodes || [];
  
  // MOCK fallback per UI testing
  if (episodes.length === 0) {
    for(let s=1; s<=3; s++) {
      seasonsMap[s] = [];
      for(let e=1; e<=8; e++) {
        seasonsMap[s].push({
          id: s*100+e,
          series_tmdb_id: tmdbSeries.tmdb_id,
          season_number: s,
          episode_number: e,
          title: `Episodio ${e}`,
        });
      }
    }
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
        const watched = seasonEpisodes.filter(ep => (mockWatchCounts[ep.id] || 0) > 0).length;
        
        let seasonMinWatchCount = Infinity;
        if (total > 0) {
          seasonEpisodes.forEach(ep => {
            const count = mockWatchCounts[ep.id] || 0;
            if (count < seasonMinWatchCount) seasonMinWatchCount = count;
          });
        } else {
          seasonMinWatchCount = 0;
        }

        // Media Voti
        let totalSeasonRating = 0;
        let ratedEpisodesCount = 0;

        seasonEpisodes.forEach(ep => {
          const epRatings = mockEpisodeRatings[ep.id];
          if (epRatings && epRatings.length > 0) {
            // Media dei voti del singolo episodio (in caso di rewatch e più recensioni)
            const epAverage = epRatings.reduce((sum, r) => sum + r, 0) / epRatings.length;
            totalSeasonRating += epAverage;
            ratedEpisodesCount++;
          }
        });

        let averageRating: string | null = null;
        if (ratedEpisodesCount > 0) {
          const rawAverage = totalSeasonRating / ratedEpisodesCount;
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
                  onToggle={(e) => handleSeasonToggle(e, seasonNumber, seasonEpisodes)}
                  onAdd={(e) => { e.stopPropagation(); changeAllEpisodes(seasonEpisodes, 1); }}
                  onSub={(e) => { e.stopPropagation(); changeAllEpisodes(seasonEpisodes, -1); }}
                />
                
                <h3 className="font-bold text-gray-900 text-lg">Stagione {seasonNumber}</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md ml-2">
                  {watched} / {total}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {averageRating && (
                  <div className="flex items-center gap-1 text-yellow-500" title={`Media basata su ${ratedEpisodesCount} episodi valutati`}>
                    <span className="font-bold text-sm">{averageRating}</span>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
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
                  const watchCount = mockWatchCounts[ep.id] || 0;

                  return (
                    <div 
                      key={ep.id} 
                      className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 cursor-pointer group transition-colors"
                      onClick={() => setSelectedEpisode(ep)}
                    >
                      <div className="flex items-center gap-2">
                        
                        <RewatchControls 
                          count={watchCount} 
                          onToggle={(e) => handleToggleEpisode(e, ep.id)}
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
