// src/mobile/components/trackers/diary/MobileTVEpisodeDiaryCard.tsx
import React from 'react';
import type { TVSeries, TMDBEpisode } from '@/types/trackers';
import { TvIcon, CheckIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';

export interface MobileTVEpisodeDiaryCardProps {
  series: TVSeries;
  episode: TMDBEpisode;
  remainingCount?: number;
  isWatched?: boolean;
  watchedDateStr?: string;
  onClick: (series: TVSeries, episode: TMDBEpisode) => void;
  onOpenSeriesDetail?: (series: TVSeries) => void;
  onToggleWatch?: (series: TVSeries, episode: TMDBEpisode) => void;
}

export const MobileTVEpisodeDiaryCard: React.FC<MobileTVEpisodeDiaryCardProps> = ({
  series,
  episode,
  remainingCount,
  isWatched = false,
  watchedDateStr,
  onClick,
  onOpenSeriesDetail,
  onToggleWatch,
}) => {
  // Sfondo dinamico: still dell'episodio se disponibile, altrimenti backdrop della serie
  const rawBackdrop = episode.still_path || series.backdrop_path;
  const backdropUrl = rawBackdrop
    ? rawBackdrop.startsWith('http') || rawBackdrop.startsWith('data:')
      ? rawBackdrop
      : rawBackdrop.startsWith('/uploads')
      ? resolveImageUrl(rawBackdrop)
      : `https://image.tmdb.org/t/p/w780${rawBackdrop}`
    : null;

  // Risoluzione locandina serie (personalizzata o TMDB)
  const rawPoster = series.custom_poster_path || series.poster_path || series.tmdb_series?.poster_path;
  const posterUrl = rawPoster
    ? rawPoster.startsWith('http') || rawPoster.startsWith('data:')
      ? rawPoster
      : rawPoster.startsWith('/uploads')
      ? resolveImageUrl(rawPoster)
      : `https://image.tmdb.org/t/p/w200${rawPoster}`
    : null;

  // Formattazione data di uscita con anno
  const formatAirDate = (dateVal?: string | null) => {
    if (!dateVal) return 'Data da definire';
    try {
      const d = new Date(`${dateVal.substring(0, 10)}T00:00:00`);
      if (isNaN(d.getTime())) return dateVal;
      return d.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateVal;
    }
  };

  const airDateLabel = watchedDateStr
    ? `Visto ${watchedDateStr}`
    : formatAirDate(episode.air_date);

  const seasonNum = String(episode.season_number).padStart(2, '0');
  const epNum = String(episode.episode_number).padStart(2, '0');
  const seasonEpCode = `S${seasonNum} E${epNum}`;

  const displayName = episode.title && episode.title.trim().length > 0
    ? episode.title
    : `Episodio ${episode.episode_number}`;

  return (
    <div
      onClick={() => onClick(series, episode)}
      className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer select-none group ${
        isWatched
          ? 'bg-gray-100/90 border-gray-300/80 shadow-2xs'
          : 'bg-white border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-blue-300 active:scale-[0.99]'
      }`}
    >
      {/* Sfondo con backdrop/still sfumato */}
      {backdropUrl && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={backdropUrl}
            alt=""
            className={`w-full h-full object-cover transition-opacity ${
              isWatched ? 'opacity-25 grayscale' : 'opacity-65'
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

      {/* Contenuto della card */}
      <div className="relative z-10 flex items-center gap-3 p-2">
        {/* 1. Locandina poster verticale a sinistra */}
        <div
          className={`w-14 h-[84px] rounded-xl overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200 shadow-2xs transition-all ${
            isWatched ? 'grayscale-[60%] opacity-70' : ''
          }`}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={series.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <TvIcon className="w-6 h-6 opacity-40" />
            </div>
          )}
        </div>

        {/* 2. Informazioni episodio e serie */}
        <div
          className={`flex-1 min-w-0 flex flex-col justify-center gap-1 transition-all ${
            isWatched ? 'grayscale-[40%] opacity-70' : ''
          }`}
        >
          {/* 1. Data di uscita o visione con anno */}
          <span
            className={`text-[11px] font-extrabold uppercase tracking-wider leading-none ${
              isWatched ? 'text-gray-500' : 'text-blue-600'
            }`}
          >
            {airDateLabel}
          </span>

          {/* 2. Codice, nome episodio e "+ N" in grassetto senza sfondo */}
          <div className="flex items-baseline gap-1.5 min-w-0">
            <h4
              className={`text-xs font-bold leading-snug truncate ${
                isWatched ? 'text-gray-700' : 'text-black'
              }`}
              title={`${seasonEpCode} | ${displayName}`}
            >
              <span className="font-extrabold">{seasonEpCode}</span>
              <span className="text-gray-400 mx-1">|</span>
              <span>{displayName}</span>
            </h4>
            {remainingCount !== undefined && remainingCount > 0 && (
              <span className="shrink-0 text-xs font-black text-gray-900">
                + {remainingCount}
              </span>
            )}
          </div>

          {/* 3. Nome della serie cerchiato / pillola cliccabile sotto l'episodio */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSeriesDetail?.(series);
              }}
              className="inline-flex items-center px-2 py-0.5 rounded-full border border-gray-300 bg-white/80 hover:bg-gray-100 text-[11px] font-bold text-gray-900 shadow-2xs active:scale-95 transition-all truncate max-w-[210px] cursor-pointer"
              title={`Apri scheda serie: ${series.title}`}
            >
              <span className="truncate">{series.title}</span>
            </button>
          </div>
        </div>

        {/* 3. Pallino visto a destra */}
        <div className="shrink-0 flex items-center justify-center pl-1 pr-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch?.(series, episode);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs ${
              isWatched
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border-2 border-gray-400 bg-white/60 hover:border-blue-500 hover:bg-blue-50 text-transparent'
            }`}
            title={isWatched ? 'Segna come non visto' : 'Segna come visto'}
            aria-label={isWatched ? 'Segna come non visto' : 'Segna come visto'}
          >
            {isWatched && <CheckIcon className="w-4 h-4 text-white stroke-[3]" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileTVEpisodeDiaryCard;
