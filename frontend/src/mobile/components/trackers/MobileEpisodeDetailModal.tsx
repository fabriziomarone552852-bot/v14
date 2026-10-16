// src/mobile/components/trackers/MobileEpisodeDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { UpcomingEpisode } from '@/types/trackers';
import { CloseIcon, TvIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileEpisodeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: UpcomingEpisode | null;
  onOpenSeriesDetail: (seriesData: { tmdb_id: number; title: string; poster_path?: string | null }) => void;
}

export const MobileEpisodeDetailModal: React.FC<MobileEpisodeDetailModalProps> = ({
  isOpen,
  onClose,
  episode,
  onOpenSeriesDetail,
}) => {
  const { toggleEpisodeWatched, isTogglingEpisodeWatched } = useTrackersMutations();
  const [isWatched, setIsWatched] = useState<boolean>(false);

  useEffect(() => {
    if (episode) {
      setIsWatched(Boolean(episode.is_watched));
    }
  }, [episode]);

  // Gestione tasto Back Android hardware
  useBackHandler(
    isOpen,
    () => {
      onClose();
      return true;
    },
    35
  );

  if (!isOpen || !episode) return null;

  const handleToggleWatched = () => {
    const nextState = !isWatched;
    setIsWatched(nextState);
    toggleEpisodeWatched({
      episode_id: episode.episode_id,
      watched: nextState,
    });
  };

  const handleViewSeries = () => {
    onClose();
    onOpenSeriesDetail({
      tmdb_id: episode.series_tmdb_id,
      title: episode.series_title,
      poster_path: episode.series_poster_path,
    });
  };

  // Backdrop immagine episodio (ancorata a still_path o backdrop serie)
  const rawBackdrop = episode.episode_still_path || episode.series_backdrop_path;
  const backdropUrl = rawBackdrop
    ? rawBackdrop.startsWith('http') || rawBackdrop.startsWith('data:')
      ? rawBackdrop
      : rawBackdrop.startsWith('/uploads')
      ? resolveImageUrl(rawBackdrop)
      : `https://image.tmdb.org/t/p/w780${rawBackdrop}`
    : null;

  const epDate = new Date(`${episode.air_date}T00:00:00`);
  const fullDateStr = epDate.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const seasonEpCode = `${episode.season_number === 0 ? 'Episodi Speciali' : `Stagione ${episode.season_number}`} • Episodio ${episode.episode_number}`;
  const displayName = episode.episode_title && episode.episode_title.trim().length > 0
    ? episode.episode_title
    : `Episodio ${episode.episode_number}`;

  return createPortal(
    <div className="fixed inset-0 z-[10030] flex items-center justify-center p-3 animate-fadeIn">
      {/* BACKDROP OSCURATO CON BLUR */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* DIALOG BOX MOBILE CENTRATO */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="episode-detail-title"
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-200/90 overflow-hidden flex flex-col max-h-[88vh] animate-scaleUp z-10"
      >
        {/* HERO IMAGE CON STILL EPISODIO O BACKDROP SERIE */}
        <div className="relative w-full h-44 bg-gray-900 shrink-0 overflow-hidden">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : episode.series_poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${episode.series_poster_path}`}
              alt=""
              className="w-full h-full object-cover blur-sm opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <TvIcon className="w-12 h-12 opacity-30" />
            </div>
          )}

          {/* Gradiente di contrasto verso la parte inferiore */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-black/30" />

          {/* TASTO CHIUDI (X) FROSTED GLASS IN ALTO A DESTRA */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-white border border-white/20 flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-sm"
            aria-label="Chiudi dettaglio episodio"
          >
            <CloseIcon className="w-4 h-4" />
          </button>

          {/* BADGE STAGIONE/EPISODIO IN BASSO A SINISTRA NELL'HERO */}
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-950/70 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-blue-400/30 shadow-xs">
              {seasonEpCode}
            </span>

            {isWatched && (
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/70 backdrop-blur-md px-2 py-0.5 rounded-lg border border-emerald-400/30 flex items-center gap-1">
                <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                Visto
              </span>
            )}
          </div>
        </div>

        {/* CONTENUTO SCROLLABILE */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          {/* TITOLO EPISODIO E NOME SERIE */}
          <div>
            <button
              type="button"
              onClick={handleViewSeries}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 mb-1 group text-left cursor-pointer"
              title="Vedi scheda serie"
            >
              <TvIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate group-hover:underline">{episode.series_title}</span>
              <span className="text-gray-400 text-[10px]">↗</span>
            </button>

            <h3
              id="episode-detail-title"
              className="text-base sm:text-lg font-black text-gray-900 leading-snug break-words"
            >
              {displayName}
            </h3>

            <p className="text-[11px] font-medium text-gray-500 capitalize mt-1">
              {fullDateStr}
            </p>
          </div>

          {/* PULSANTE AZIONE RAPIDA: SEGNALAZIONE VISTO / NON VISTO */}
          <div>
            <button
              type="button"
              disabled={isTogglingEpisodeWatched}
              onClick={handleToggleWatched}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                isWatched
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <CheckCircleIcon className={`w-4 h-4 ${isWatched ? 'text-emerald-600' : 'text-white'}`} />
              <span>{isWatched ? 'Episodio Visto (tocca per rimuovere)' : 'Segna come Visto'}</span>
            </button>
          </div>

          {/* DESCRIZIONE / TRAMA DELL'EPISODIO */}
          <div className="pt-1">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              Trama
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
              {episode.episode_overview && episode.episode_overview.trim().length > 0
                ? episode.episode_overview
                : 'Nessuna descrizione o trama inserita per questo episodio.'}
            </p>
          </div>
        </div>

        {/* FOOTER AZIONI: APRI SCHEDA COMPLETA SERIE E CHIUDI */}
        <div className="shrink-0 p-3 bg-gray-50 border-t border-gray-200/80 flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewSeries}
            className="flex-1 py-2 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all text-center cursor-pointer active:scale-95 shadow-2xs"
          >
            Scheda Serie
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-gray-800 text-white hover:bg-gray-900 text-xs font-bold transition-all text-center cursor-pointer active:scale-95 shadow-2xs"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileEpisodeDetailModal;
