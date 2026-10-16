// src/mobile/components/trackers/detail/MobileSeriesOverviewTab.tsx
import React from 'react';
import type { TMDBSeries, SeriesCastMember, SeriesRecommendation } from '@/types/trackers';
import type { TMDBProvidersResponse } from '@/components/trackers/SeriesDetailModal/hooks/useSeriesDetailModalLogic';
import { useSeriesExtras } from '@/hooks/queries/useTrackersQueries';
import { TvIcon } from '@/components/shared/utils/Icons';

export interface MobileSeriesOverviewTabProps {
  tmdbSeries: TMDBSeries;
  isUserTracked: boolean;
  handleClickTrack: () => void;
  providersData?: TMDBProvidersResponse | null;
  onPlatformClick?: (platform: string, providerId?: number) => void;
  onSelectRecommendation?: (series: SeriesRecommendation) => void;
  isLoading?: boolean;
}

export const MobileSeriesOverviewTab: React.FC<MobileSeriesOverviewTabProps> = ({
  tmdbSeries,
  isUserTracked,
  handleClickTrack,
  providersData,
  onPlatformClick,
  onSelectRecommendation,
  isLoading = false,
}) => {
  const { data: extras, isLoading: isExtrasLoading } = useSeriesExtras(tmdbSeries.tmdb_id);

  const cast = extras?.cast || [];
  const recommendations = extras?.recommendations || [];

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fadeIn select-none">
      {/* 1. DOVE GUARDARLO & AZIONE CATALOGO */}
      <section className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <TvIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Dove guardarlo?</span>
          </h3>

          {/* Tasto quadrato con spunta stile Webpage per aggiungere/rimuovere serie dal catalogo */}
          <button
            type="button"
            onClick={handleClickTrack}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
              isUserTracked
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500'
            }`}
            title={
              isUserTracked
                ? 'In catalogo (tocca per rimuovere)'
                : 'Aggiungi al catalogo'
            }
            aria-label={isUserTracked ? 'In catalogo' : 'Aggiungi al catalogo'}
          >
            {isUserTracked ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>

        {/* Pills dei distributori di streaming */}
        <div>
          {providersData?.flatrate && providersData.flatrate.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 items-center">
              {providersData.flatrate.map((provider) => (
                <button
                  key={provider.provider_id}
                  type="button"
                  onClick={() => onPlatformClick && onPlatformClick(provider.provider_name, provider.provider_id)}
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
          ) : (
            <p className="text-xs text-gray-400 font-medium italic">
              Nessuna piattaforma streaming segnalata al momento
            </p>
          )}
        </div>
      </section>

      {/* 2. TRAMA (Senza duplicare il titolo della serie già presente nel banner) */}
      <section className="flex flex-col gap-1.5 px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
          Trama
        </h3>
        <div className="text-sm text-gray-700 leading-relaxed font-normal">
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-2 pt-1">
              <div className="h-3.5 bg-gray-200 rounded w-full"></div>
              <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3.5 bg-gray-200 rounded w-4/6"></div>
            </div>
          ) : tmdbSeries.overview ? (
            <p>{tmdbSeries.overview}</p>
          ) : (
            <p className="italic text-xs text-gray-400">
              Nessuna trama disponibile in italiano.
            </p>
          )}
        </div>
      </section>

      {/* 3. CAST PRINCIPALE (Scorrimento Orizzontale) */}
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
              <span className="text-gray-400 italic text-xs">Nessun membro del cast disponibile</span>
            </div>
          ) : (
            cast.map((actor: SeriesCastMember) => (
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
                  <p className="font-bold text-gray-900 text-[11px] leading-tight line-clamp-1" title={actor.name}>
                    {actor.name}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight line-clamp-1 mt-0.5" title={actor.character}>
                    {actor.character}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. CONSIGLIATI (Scorrimento Orizzontale) */}
      <section className="flex flex-col gap-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 px-1">
          Consigliati
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 modal-scrollbar">
          {isExtrasLoading ? (
            <div className="w-full flex items-center justify-center py-4">
              <span className="text-gray-400 italic text-xs">Caricamento consigliati...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="w-full flex items-center justify-center py-4">
              <span className="text-gray-400 italic text-xs">Nessuna serie consigliata disponibile</span>
            </div>
          ) : (
            recommendations.map((rec: SeriesRecommendation) => {
              const recTitle = rec.title || rec.name || '';
              return (
                <div
                  key={rec.tmdb_id || rec.id}
                  onClick={() => onSelectRecommendation && rec.tmdb_id !== undefined && onSelectRecommendation(rec)}
                  className="w-44 shrink-0 aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-xs active:scale-95 transition-all cursor-pointer relative group border border-gray-200/80"
                  title={recTitle}
                >
                  {rec.backdrop_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${rec.backdrop_path}`}
                      alt={recTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : rec.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${rec.poster_path}`}
                      alt={recTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-gray-400 text-[10px] font-medium leading-tight">
                        Nessuna immagine
                      </span>
                    </div>
                  )}

                  {/* Gradiente sfumato scuro per massima leggibilità del titolo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Titolo serie in sovrimpressione in basso */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end">
                    <p className="font-bold text-white text-xs leading-tight line-clamp-2 drop-shadow-md">
                      {recTitle}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default MobileSeriesOverviewTab;
