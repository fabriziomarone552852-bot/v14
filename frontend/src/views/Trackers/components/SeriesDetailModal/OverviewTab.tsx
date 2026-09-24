import React from 'react';
import type { TMDBSeries, SeriesCastMember, SeriesRecommendation } from '@/types/trackers';

interface OverviewTabProps {
  tmdbSeries: TMDBSeries;
}

// Dati mockati temporanei
const MOCK_CAST: SeriesCastMember[] = [
  { id: 1, name: 'Attore Placeholder 1', character: 'Personaggio 1', profile_path: null },
  { id: 2, name: 'Attore Placeholder 2', character: 'Personaggio 2', profile_path: null },
  { id: 3, name: 'Attore Placeholder 3', character: 'Personaggio 3', profile_path: null },
  { id: 4, name: 'Attore Placeholder 4', character: 'Personaggio 4', profile_path: null },
];

const MOCK_RECCOMENDATIONS: SeriesRecommendation[] = [
  { id: 1, tmdb_id: 1, title: 'Serie Simile 1', poster_path: null },
  { id: 2, tmdb_id: 2, title: 'Serie Simile 2', poster_path: null },
  { id: 3, tmdb_id: 3, title: 'Serie Simile 3', poster_path: null },
];

export const OverviewTab: React.FC<OverviewTabProps> = ({ tmdbSeries }) => {
  const releaseYear = tmdbSeries.first_air_date ? tmdbSeries.first_air_date.substring(0, 4) : '';

  return (
    <div className="flex h-full animate-fadeIn">
      {/* Colonna Sinistra (Trama e Cast) */}
      <div className="flex-1 flex flex-col pr-6">
        {/* Title & Overview */}
        <div className="flex flex-col gap-1 mb-8">
          {releaseYear && (
            <span className="text-gray-500 font-semibold tracking-wider text-xs">
              {releaseYear}
            </span>
          )}
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {tmdbSeries.title}
          </h2>
          
          <div className="mt-2 text-sm text-gray-700 leading-relaxed">
            {tmdbSeries.overview ? (
              <p>{tmdbSeries.overview}</p>
            ) : (
              <p className="italic text-gray-400">Nessuna trama disponibile in italiano.</p>
            )}
          </div>
        </div>

        {/* Cast Section */}
        <div className="flex flex-col gap-3 mt-auto">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-1">
            Cast Principale <span className="text-xs font-normal text-gray-400 ml-2">(Dati d'esempio)</span>
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 modal-scrollbar">
            {MOCK_CAST.map(actor => (
              <div key={actor.id} className="flex flex-col gap-1 w-[80px] shrink-0">
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-200 shadow-inner">
                  {actor.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center mt-1">
                  <p className="font-bold text-gray-900 text-xs leading-tight">{actor.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{actor.character}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonna Destra (Recommendations) */}
      <div className="w-[180px] shrink-0 border-l border-gray-200 pl-6 flex flex-col gap-4 overflow-y-auto modal-scrollbar">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Consigliati
        </h3>
        <div className="flex flex-col gap-4 pb-4">
          {MOCK_RECCOMENDATIONS.map(rec => (
            <div key={rec.tmdb_id} className="w-full shrink-0 flex flex-col gap-1 cursor-pointer group">
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-sm group-hover:shadow-md transition-all">
                {rec.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w500${rec.poster_path}`} alt={rec.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-center p-2 text-[10px] font-medium leading-tight">
                    {rec.title}
                  </div>
                )}
              </div>
              <p className="font-semibold text-gray-800 text-xs text-center truncate group-hover:text-blue-600 transition-colors">
                {rec.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
