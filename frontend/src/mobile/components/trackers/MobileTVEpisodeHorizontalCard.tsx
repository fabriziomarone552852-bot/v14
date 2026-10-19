// src/mobile/components/trackers/MobileTVEpisodeHorizontalCard.tsx
import React from 'react';
import type { UpcomingEpisode } from '@/types/trackers';
import { TvIcon, CheckIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';

export interface MobileTVEpisodeHorizontalCardProps {
  episode: UpcomingEpisode;
  customPosterUrl?: string | null;
  onClick: (episode: UpcomingEpisode) => void;
  onOpenSeriesDetail?: (episode: UpcomingEpisode) => void;
  onToggleWatch?: (episode: UpcomingEpisode) => void;
  isToday?: boolean;
}

export const MobileTVEpisodeHorizontalCard: React.FC<MobileTVEpisodeHorizontalCardProps> = ({
  episode,
  customPosterUrl,
  onClick,
  onOpenSeriesDetail,
  onToggleWatch,
  isToday = false,
}) => {
  const isWatched = Boolean(episode.is_watched);

  // Sfondo dinamico: still dell'episodio se disponibile, altrimenti backdrop della serie
  const rawBackdrop = episode.episode_still_path || episode.series_backdrop_path;
  const backdropUrl = rawBackdrop
    ? rawBackdrop.startsWith('http') || rawBackdrop.startsWith('data:')
      ? rawBackdrop
      : rawBackdrop.startsWith('/uploads')
      ? resolveImageUrl(rawBackdrop)
      : `https://image.tmdb.org/t/p/w780${rawBackdrop}`
    : null;

  // Risoluzione locandina serie (personalizzata o TMDB)
  const rawPoster = customPosterUrl || episode.series_poster_path;
  const posterUrl = rawPoster
    ? rawPoster.startsWith('http') || rawPoster.startsWith('data:')
      ? rawPoster
      : rawPoster.startsWith('/uploads')
      ? resolveImageUrl(rawPoster)
      : `https://image.tmdb.org/t/p/w200${rawPoster}`
    : null;

  // Calcolo data relativa e formattazione
  const epDate = new Date(`${episode.air_date}T00:00:00`);
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((epDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  // Data di uscita in nero: "Oggi" o "Domani" senza giorno/mese, altrimenti formato standard (es. "22 ott")
  let dateText = '';
  if (diffDays === 0 || isToday) {
    dateText = 'Oggi';
  } else if (diffDays === 1) {
    dateText = 'Domani';
  } else if (diffDays === -1) {
    dateText = 'Ieri';
  } else {
    const dayStr = epDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    const isCurrentYear = epDate.getFullYear() === now.getFullYear();
    const yearStr = !isCurrentYear ? ` '${String(epDate.getFullYear()).slice(-2)}` : '';
    dateText = `${dayStr}${yearStr}`;
  }

  // Codice SXX EXX con spazio come da specifica
  const seasonNum = String(episode.season_number).padStart(2, '0');
  const epNum = String(episode.episode_number).padStart(2, '0');
  const seasonEpCode = `S${seasonNum} E${epNum}`;

  const displayName = episode.episode_title && episode.episode_title.trim().length > 0
    ? episode.episode_title
    : `Episodio ${episode.episode_number}`;

  const episodeFullLabel = `${seasonEpCode} | ${displayName}`;

  return (
    <div
      onClick={() => onClick(episode)}
      className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer select-none group ${
        isWatched
          ? 'bg-gray-100/90 border-gray-300/80 shadow-2xs'
          : isToday
          ? 'bg-white border-blue-300/80 shadow-xs hover:border-blue-400 active:scale-[0.99]'
          : 'bg-white border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-blue-200 active:scale-[0.99]'
      }`}
    >
      {/* SFONDO DINAMICO CON BACKDROP DELL'EPISODIO O DELLA SERIE */}
      {backdropUrl && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={backdropUrl}
            alt=""
            className={`w-full h-full object-cover transition-opacity ${
              isWatched ? 'opacity-30 grayscale' : 'opacity-70'
            }`}
            loading="lazy"
          />
          <div
            className={`absolute inset-0 ${
              isWatched
                ? 'bg-gradient-to-r from-gray-200/95 via-gray-200/90 to-gray-300/80'
                : 'bg-gradient-to-r from-white/95 via-white/85 to-white/70'
            }`}
          />
        </div>
      )}

      {/* CONTENUTO DELLA CARD (Z-10) */}
      <div className="relative z-10 flex items-center gap-3 p-2">
        {/* 1. LOCANDINA VERTICALE A SINISTRA */}
        <div
          className={`w-14 h-[84px] rounded-xl overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200 shadow-2xs transition-all ${
            isWatched ? 'grayscale-[60%] opacity-70' : ''
          }`}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={episode.series_title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <TvIcon className="w-6 h-6 opacity-40" />
            </div>
          )}
        </div>

        {/* 2. INFORMAZIONI A SINISTRA (ALLINEATE SUBITO ACCANTO ALLA LOCANDINA) */}
        <div
          className={`flex-1 min-w-0 flex flex-col justify-center gap-1 transition-all ${
            isWatched ? 'grayscale-[40%] opacity-70' : ''
          }`}
        >
          {/* Data di uscita in alto a sinistra (blu per episodi non guardati, grigio per visti) */}
          <span
            className={`text-[11px] font-extrabold uppercase tracking-wider leading-none ${
              isWatched ? 'text-gray-600' : 'text-blue-600'
            }`}
          >
            {dateText}
          </span>

          {/* Codice episodio e nome: "SXX EXX | NNNNNN" in nero ed evidenziato (senza barramento per i visti) */}
          <h4
            className={`text-xs sm:text-sm font-extrabold leading-tight line-clamp-1 break-words ${
              isWatched ? 'text-gray-700' : 'text-black'
            }`}
            title={episodeFullLabel}
          >
            {episodeFullLabel}
          </h4>

          {/* Nome della serie cerchiato: cliccabile per aprire il dettaglio della serie */}
          <div className="flex items-center pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSeriesDetail?.(episode);
              }}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-gray-400 bg-white/70 hover:bg-gray-100 text-[11px] font-bold text-black shadow-2xs active:scale-95 transition-all truncate max-w-[200px] cursor-pointer"
              title={`Apri scheda serie: ${episode.series_title}`}
            >
              <span className="truncate">{episode.series_title}</span>
            </button>
          </div>
        </div>

        {/* 3. PALLINO VISTO A DESTRA: CENTRATO VERTICALMENTE VERSO IL MARGINE DESTRO */}
        <div className="shrink-0 flex items-center justify-center pl-1 pr-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch?.(episode);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs ${
              isWatched
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border-2 border-gray-400 bg-white/50 hover:border-blue-500 hover:bg-blue-50/60 text-transparent'
            }`}
            title={isWatched ? 'Segna come non visto' : 'Segna come visto'}
            aria-label={isWatched ? 'Segna come non visto' : 'Segna come visto'}
          >
            {isWatched ? (
              <CheckIcon className="w-4 h-4 text-white stroke-[3]" />
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileTVEpisodeHorizontalCard;
