import React from 'react';
import type { TMDBSeries, SeriesCastMember, SeriesRecommendation } from '@/types/trackers';
import { useSeriesExtras } from '@/hooks/queries/useTrackersQueries';

interface OverviewTabProps {
  tmdbSeries: TMDBSeries;
  onSelectRecommendation?: (series: any) => void;
  isLoading?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ tmdbSeries, onSelectRecommendation, isLoading }) => {
  const releaseYear = tmdbSeries.first_air_date ? tmdbSeries.first_air_date.substring(0, 4) : '';
  const { data: extras, isLoading: isExtrasLoading } = useSeriesExtras(tmdbSeries.tmdb_id);

  const cast = extras?.cast || [];
  const recommendations = extras?.recommendations || [];

  return (
    <div className="flex h-full animate-fadeIn min-w-0 overflow-hidden">
      {/* Colonna Sinistra (Trama e Cast) */}
      <div className="flex-1 flex flex-col pr-6 min-w-0">
        {/* Title */}
        <div className="flex flex-col gap-1 shrink-0">
          {releaseYear && (
            <span className="text-gray-500 font-semibold tracking-wider text-xs">
              {releaseYear}
            </span>
          )}
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {tmdbSeries.title}
          </h2>
        </div>
          
        {/* Overview Scrollabile */}
        <div className="mt-4 mb-4 text-sm text-gray-700 leading-relaxed overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          ) : tmdbSeries.overview ? (
            <p>{tmdbSeries.overview}</p>
          ) : (
            <p className="italic text-gray-400">Nessuna trama disponibile in italiano.</p>
          )}
        </div>

        {/* Cast Section */}
        <div className="flex flex-col gap-3 mt-auto shrink-0 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-1">
            Cast Principale
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 modal-scrollbar">
            {isExtrasLoading ? (
              <div className="w-full flex items-center justify-center p-4">
                <span className="text-gray-400 italic text-sm">Caricamento cast...</span>
              </div>
            ) : cast.length === 0 ? (
              <div className="w-full flex items-center justify-center p-4">
                <span className="text-gray-400 italic text-sm">Nessun membro del cast da mostrare</span>
              </div>
            ) : (
              cast.map((actor: SeriesCastMember) => (
                <div key={actor.id} className="flex flex-col gap-1 w-[80px] shrink-0">
                  <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-200 shadow-inner shrink-0">
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
                    <p className="font-bold text-gray-900 text-xs leading-tight line-clamp-2" title={actor.name}>{actor.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight line-clamp-2" title={actor.character}>{actor.character}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Colonna Destra (Recommendations) */}
      <div className="w-[180px] shrink-0 border-l border-gray-200 pl-6 flex flex-col gap-4 overflow-y-auto modal-scrollbar">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Consigliati
        </h3>
        <div className="flex flex-col gap-4 pb-4">
          {isExtrasLoading ? (
            <div className="w-full flex items-center justify-center p-4">
              <span className="text-gray-400 italic text-sm text-center">Caricamento...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="w-full flex items-center justify-center p-4">
              <span className="text-gray-400 italic text-sm text-center">Nessuna raccomandazione disponibile</span>
            </div>
          ) : (
            recommendations.map((rec: SeriesRecommendation) => (
              <div key={rec.tmdb_id} className="w-full shrink-0 flex flex-col cursor-pointer group" onClick={() => onSelectRecommendation && rec.tmdb_id !== undefined && onSelectRecommendation(rec)}>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-sm group-hover:shadow-md transition-all relative">
                  {rec.backdrop_path ? (
                    <img src={`https://image.tmdb.org/t/p/w500${rec.backdrop_path}`} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-[10px] font-medium leading-tight">Nessuna immagine</span>
                    </div>
                  )}
                  {/* Gradiente sfumato */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  {/* Titolo */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 flex items-end">
                    <p className="font-bold text-white text-xs leading-tight line-clamp-2 drop-shadow-sm">
                      {rec.title || rec.name}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

