import React, { useMemo } from 'react';
import type { MovieCastMember } from '@/types/movies';
import type { MovieProvidersResponse } from '@/hooks/queries/useMovieQueries';
import { TvIcon } from '@/components/shared/utils/Icons';

export interface MobileCinemaOverviewViewProps {
  title: string;
  originalTitle?: string;
  releaseDateStr?: string;
  runtime?: number | null;
  director?: string | null;
  overview?: string | null;
  cast?: MovieCastMember[];
  isExtrasLoading?: boolean;
  providersData?: MovieProvidersResponse | null;
  onPlatformClick?: (platform: string) => void;
}

export const MobileCinemaOverviewView: React.FC<MobileCinemaOverviewViewProps> = ({
  title,
  originalTitle,
  releaseDateStr,
  runtime,
  director,
  overview,
  cast = [],
  isExtrasLoading = false,
  providersData,
  onPlatformClick,
}) => {
  // Formattazione data italiana "dal DD/MM/YYYY"
  const formattedCinemaDate = useMemo(() => {
    if (!releaseDateStr) return null;
    try {
      const parts = releaseDateStr.split('-');
      if (parts.length === 3) {
        return `dal ${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(releaseDateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `dal ${day}/${month}/${d.getFullYear()}`;
      }
    } catch {
      return `dal ${releaseDateStr}`;
    }
    return `dal ${releaseDateStr}`;
  }, [releaseDateStr]);

  // Formattazione durata
  const formattedRuntime = useMemo(() => {
    if (!runtime) return null;
    const h = Math.floor(runtime / 60);
    const m = runtime % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [runtime]);

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fadeIn select-none">
      {/* 1. SCHEDA DETTAGLI TECNICI DEL FILM (Data di uscita, Durata, Regista, Titolo originale) */}
      <section className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center gap-2.5 flex-wrap text-xs text-gray-600 font-medium">
          {/* Data nera senza sfondo blu né contorno */}
          {formattedCinemaDate && (
            <span className="font-bold text-gray-900 text-xs">
              {formattedCinemaDate}
            </span>
          )}

          {formattedRuntime && (
            <span className="flex items-center gap-1">
              <span>⏱</span>
              <strong className="text-gray-800">{formattedRuntime}</strong>
            </span>
          )}

          {/* Regia senza parola 'Regia:', solo icona e nome */}
          {director && (
            <span className="flex items-center gap-1">
              <span>🎬</span>
              <strong className="text-gray-900">{director}</strong>
            </span>
          )}
        </div>

        {originalTitle && originalTitle.toLowerCase() !== title.toLowerCase() && (
          <p className="text-xs text-gray-400 italic font-medium">
            Titolo originale: {originalTitle}
          </p>
        )}
      </section>

      {/* 2. TRAMA */}
      <section className="flex flex-col gap-1.5 px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
          Trama
        </h3>
        <div className="text-sm text-gray-700 leading-relaxed font-normal">
          {isExtrasLoading ? (
            <div className="animate-pulse flex flex-col gap-2 pt-1">
              <div className="h-3.5 bg-gray-200 rounded w-full"></div>
              <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3.5 bg-gray-200 rounded w-4/6"></div>
            </div>
          ) : overview ? (
            <p>{overview}</p>
          ) : (
            <p className="italic text-xs text-gray-400">
              Nessuna trama disponibile in italiano per questo film.
            </p>
          )}
        </div>
      </section>

      {/* 3. CAST PRINCIPALE */}
      <section className="flex flex-col gap-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 px-1">
          Cast Principale
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-1.5 px-1 modal-scrollbar">
          {isExtrasLoading ? (
            <div className="w-full flex items-center justify-center py-4">
              <span className="text-gray-400 italic text-xs">Caricamento cast...</span>
            </div>
          ) : cast.length === 0 ? (
            <div className="w-full flex items-center justify-center py-4">
              <span className="text-gray-400 italic text-xs">Nessun membro del cast segnalato</span>
            </div>
          ) : (
            cast.map((actor) => (
              <div key={actor.id} className="flex flex-col items-center gap-1 w-18 shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs shrink-0">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center w-full px-0.5">
                  {/* Nome attore su due righe */}
                  <p
                    className="font-bold text-gray-900 text-[11px] leading-tight line-clamp-2 min-h-[26px] flex items-center justify-center"
                    title={actor.name}
                  >
                    {actor.name}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight line-clamp-1 mt-0.5" title={actor.character || ''}>
                    {actor.character}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. DOVE GUARDARLO (Se presenti piattaforme streaming future o attuali) */}
      {providersData?.flatrate && providersData.flatrate.length > 0 && (
        <section className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs flex flex-col gap-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <TvIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Disponibile anche in Streaming</span>
          </h3>

          <div className="flex flex-wrap gap-1.5 items-center">
            {providersData.flatrate.map((provider) => (
              <button
                key={provider.provider_id}
                type="button"
                onClick={() => onPlatformClick && onPlatformClick(provider.provider_name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200/90 rounded-xl shadow-2xs ${
                  onPlatformClick ? 'cursor-pointer hover:bg-gray-100 active:scale-95' : ''
                }`}
                title={provider.provider_name}
              >
                {provider.logo_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt=""
                    className="w-4 h-4 rounded-md object-cover bg-white shrink-0"
                  />
                ) : null}
                <span className="text-xs font-bold text-gray-800">
                  {provider.provider_name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MobileCinemaOverviewView;
