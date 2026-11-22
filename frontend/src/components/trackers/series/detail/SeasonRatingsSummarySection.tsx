// src/components/trackers/series/detail/SeasonRatingsSummarySection.tsx
import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import type { TMDBSeries, UserSeasonLog, UserSeriesTracking } from '@/types/trackers';
import { getEpisodeAverageRating, getSeasonPersonalRating, roundRatingToHalfStar } from '@/utils/ratingUtils';

interface SeasonRatingsSummarySectionProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  onOpenSeason?: (seasonNumber: number) => void;
  compact?: boolean;
}

interface SeasonRatingChipItem {
  seasonNumber: number;
  label: string;
  seasonRating: number | null;
  seasonCount: number;
  episodesRating: number | null;
}

export const SeasonRatingsSummarySection: React.FC<SeasonRatingsSummarySectionProps> = ({
  tmdbSeries,
  userTracking,
  onOpenSeason,
  compact = false,
}) => {
  const items = useMemo<SeasonRatingChipItem[]>(() => {
    const episodes = tmdbSeries.episodes || [];
    const seasonLogs: UserSeasonLog[] =
      tmdbSeries.season_logs || userTracking?.season_logs || [];

    const seasonNumbersSet = new Set<number>();
    episodes.forEach((ep) => seasonNumbersSet.add(ep.season_number));
    seasonLogs.forEach((log) => seasonNumbersSet.add(log.season_number));

    const sortedSeasons = Array.from(seasonNumbersSet).sort((a, b) => a - b);

    return sortedSeasons
      .map((sn) => {
        const personal = getSeasonPersonalRating(seasonLogs, sn);
        const seasonEps = episodes.filter((ep) => ep.season_number === sn);
        let epSum = 0;
        let epCount = 0;
        seasonEps.forEach((ep) => {
          const avg = getEpisodeAverageRating(ep);
          if (avg !== null) {
            epSum += avg;
            epCount++;
          }
        });
        const epAvg = epCount > 0 ? roundRatingToHalfStar(epSum / epCount) : null;

        return {
          seasonNumber: sn,
          label: sn === 0 ? 'Speciali' : `S${sn}`,
          seasonRating: personal?.rating ?? null,
          seasonCount: personal?.count ?? 0,
          episodesRating: epAvg,
        };
      })
      .filter((item) => item.seasonRating !== null || item.episodesRating !== null);
  }, [tmdbSeries.episodes, tmdbSeries.season_logs, userTracking?.season_logs]);

  if (items.length === 0) return null;

  return (
    <div
      className={`bg-white border border-gray-200/80 rounded-2xl shadow-2xs shrink-0 ${
        compact ? 'p-4' : 'p-5 shadow-sm border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
        <h3
          className={
            compact
              ? 'text-xs font-black uppercase tracking-wider text-gray-700'
              : 'text-sm font-bold uppercase tracking-wider text-gray-700'
          }
        >
          Voti per Stagione
        </h3>
        <span className="text-[11px] text-gray-400 font-medium">
          Tocca una stagione per aprire
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const hasSeasonVote = item.seasonRating !== null;
          const displayVal = hasSeasonVote ? item.seasonRating : item.episodesRating;
          const formatted =
            displayVal !== null
              ? displayVal % 1 === 0
                ? displayVal.toFixed(0)
                : displayVal.toFixed(1)
              : '--';

          return (
            <button
              key={item.seasonNumber}
              type="button"
              onClick={() => onOpenSeason?.(item.seasonNumber)}
              title={
                hasSeasonVote
                  ? `${item.label}: tuo voto stagione ${formatted}/5 (${item.seasonCount} ${
                      item.seasonCount === 1 ? 'recensione' : 'recensioni'
                    })`
                  : `${item.label}: media episodi ${formatted}/5 (nessun voto diretto alla stagione)`
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                hasSeasonVote
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-yellow-50/70 text-yellow-700 border-yellow-200 hover:bg-yellow-100/70'
              }`}
            >
              <span>{item.label}</span>
              <Star
                className={`w-3.5 h-3.5 shrink-0 ${
                  hasSeasonVote
                    ? 'fill-amber-600 text-amber-600'
                    : 'fill-yellow-400 text-yellow-400'
                }`}
              />
              <span>{formatted}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
