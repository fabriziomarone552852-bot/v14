import React from 'react';
import type {
  MovieCastMember,
  MovieRecommendation,
  MovieDetailTarget,
} from '@/types/movies';

interface MovieOverviewTabProps {
  title?: string;
  originalTitle?: string;
  releaseYear?: string;
  runtime?: number | null;
  director?: string | null;
  overview?: string | null;
  cast?: MovieCastMember[];
  recommendations?: MovieRecommendation[];
  isLoadingExtras?: boolean;
  onSelectRecommendation?: (movie: MovieDetailTarget) => void;
}

export const MovieOverviewTab: React.FC<MovieOverviewTabProps> = ({
  title,
  originalTitle,
  releaseYear,
  runtime,
  director,
  overview,
  cast = [],
  recommendations = [],
  isLoadingExtras = false,
  onSelectRecommendation,
}) => {
  const formatRuntime = (mins?: number | null) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="flex h-full animate-fadeIn min-w-0 overflow-hidden text-left">
      {/* Colonna Sinistra (Titoli, Info, Trama e Cast) */}
      <div className="flex-1 flex flex-col pr-6 min-w-0">
        {/* Title, Year & Meta Info */}
        <div className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {releaseYear && (
              <span className="text-gray-500 font-semibold tracking-wider text-xs">
                {releaseYear}
              </span>
            )}
            {runtime && (
              <span className="text-gray-500 font-medium text-xs">
                • ⏱ {formatRuntime(runtime)}
              </span>
            )}
            {director && (
              <span className="text-gray-500 font-medium text-xs">
                • 🎬 <strong className="text-gray-700">{director}</strong>
              </span>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {title}
          </h2>

          {originalTitle && originalTitle !== title && (
            <p className="text-xs text-gray-500 italic font-medium">
              Titolo originale: {originalTitle}
            </p>
          )}
        </div>

        {/* Overview Scrollabile */}
        <div className="mt-4 mb-4 text-sm text-gray-700 leading-relaxed overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
          {overview ? (
            <p>{overview}</p>
          ) : (
            <p className="italic text-gray-400">Nessuna trama disponibile in italiano.</p>
          )}
        </div>

        {/* Cast Section in Basso Orizzontale */}
        <div className="flex flex-col gap-3 mt-auto shrink-0 min-w-0">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-1">
            Cast Principale
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 modal-scrollbar">
            {isLoadingExtras ? (
              <div className="w-full flex items-center justify-center p-4">
                <span className="text-gray-400 italic text-sm">Caricamento cast...</span>
              </div>
            ) : cast.length === 0 ? (
              <div className="w-full flex items-center justify-center p-4">
                <span className="text-gray-400 italic text-sm">Nessun membro del cast da mostrare</span>
              </div>
            ) : (
              cast.map((actor: MovieCastMember) => (
                <div key={actor.id} className="flex flex-col gap-1 w-[80px] shrink-0">
                  <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-200 shadow-inner shrink-0">
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-1">
                    <p
                      className="font-bold text-gray-900 text-xs leading-tight line-clamp-2"
                      title={actor.name}
                    >
                      {actor.name}
                    </p>
                    {actor.character && (
                      <p
                        className="text-[10px] text-gray-500 mt-0.5 leading-tight line-clamp-2"
                        title={actor.character}
                      >
                        {actor.character}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Colonna Destra (Recommendations / Film Consigliati con Backdrop 16:9) */}
      <div className="w-[190px] shrink-0 border-l border-gray-200 pl-5 flex flex-col gap-3 overflow-y-auto modal-scrollbar">
        <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
          Consigliati
        </h3>
        <div className="flex flex-col gap-3 pb-4">
          {isLoadingExtras ? (
            <div className="w-full flex items-center justify-center p-4">
              <span className="text-gray-400 italic text-xs text-center">Caricamento...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="w-full flex items-center justify-center p-4">
              <span className="text-gray-400 italic text-xs text-center">
                Nessuna raccomandazione
              </span>
            </div>
          ) : (
            recommendations.slice(0, 15).map((rec) => {
              const imageUrl = rec.backdrop_path
                ? `https://image.tmdb.org/t/p/w300${rec.backdrop_path}`
                : rec.poster_path
                ? `https://image.tmdb.org/t/p/w300${rec.poster_path}`
                : '/no-poster.png';

              return (
                <div
                  key={rec.id}
                  onClick={() =>
                    onSelectRecommendation?.({
                      tmdb_id: rec.id,
                      title: rec.title,
                      poster_path: rec.poster_path,
                      backdrop_path: rec.backdrop_path,
                      release_date: rec.release_date,
                    })
                  }
                  className="group cursor-pointer flex flex-col gap-1"
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-900 shadow-sm border border-gray-200 transition-all group-hover:shadow-md group-hover:border-blue-400">
                    <img
                      src={imageUrl}
                      alt={rec.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p
                    className="text-xs font-semibold text-gray-800 line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors"
                    title={rec.title}
                  >
                    {rec.title}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
