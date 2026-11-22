// src/components/trackers/series/detail/SeriesSeasonAccordionItem.tsx
import React from 'react';
import { Info } from 'lucide-react';
import type { TMDBEpisode } from '@/types/trackers';
import { StarRating } from '@/components/trackers/shared/detail/StarRating';
import { getEpisodePersonalRating, type SeasonPersonalRating } from '@/utils/ratingUtils';

interface RewatchControlsProps {
  count: number;
  onAdd: (e: React.MouseEvent) => void;
  onSub: (e: React.MouseEvent) => void;
  onToggle: (e: React.MouseEvent) => void;
}

export const RewatchControls: React.FC<RewatchControlsProps> = ({
  count,
  onAdd,
  onSub,
  onToggle,
}) => {
  const isWatched = count > 0;
  return (
    <div
      className="relative flex items-center justify-center gap-1 w-[104px] shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={`w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent hover:border-red-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto ${
          !isWatched ? 'invisible' : ''
        }`}
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
          <span className="text-[12px] font-extrabold leading-none tracking-tighter">
            X{count}
          </span>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <button
        type="button"
        className={`w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent hover:border-blue-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto ${
          !isWatched ? 'invisible' : ''
        }`}
        onClick={onAdd}
        title="Aggiungi visione"
      >
        +1
      </button>
    </div>
  );
};

interface SeriesSeasonAccordionItemProps {
  seasonNumber: number;
  seasonTitle: string;
  seasonEpisodes: TMDBEpisode[];
  isExpanded: boolean;
  watchedCount: number;
  totalCount: number;
  seasonMinWatchCount: number;
  seasonPersonalRating: SeasonPersonalRating | null;
  episodesAverageRating: number | null;
  ratedEpisodesCount: number;
  onToggleExpand: () => void;
  onOpenSeasonDetail: () => void;
  onToggleSeason: (e: React.MouseEvent) => void;
  onAddSeasonWatch: (e: React.MouseEvent) => void;
  onSubSeasonWatch: (e: React.MouseEvent) => void;
  onSelectEpisode: (ep: TMDBEpisode) => void;
  onToggleEpisode: (e: React.MouseEvent, episodeId: number, currentWatchCount: number) => void;
  onWatchCountChange: (e: React.MouseEvent, episodeId: number, delta: number) => void;
}

export const SeriesSeasonAccordionItem: React.FC<SeriesSeasonAccordionItemProps> = ({
  seasonTitle,
  seasonEpisodes,
  isExpanded,
  watchedCount,
  totalCount,
  seasonMinWatchCount,
  seasonPersonalRating,
  episodesAverageRating,
  ratedEpisodesCount,
  onToggleExpand,
  onOpenSeasonDetail,
  onToggleSeason,
  onAddSeasonWatch,
  onSubSeasonWatch,
  onSelectEpisode,
  onToggleEpisode,
  onWatchCountChange,
}) => {
  const hasSeasonRating = seasonPersonalRating !== null;
  const displayRating = hasSeasonRating
    ? seasonPersonalRating.rating
    : episodesAverageRating;

  const ratingTooltip = hasSeasonRating
    ? `Voto stagione: ${seasonPersonalRating.rating.toFixed(1)}/5 (${
        seasonPersonalRating.count
      } ${seasonPersonalRating.count === 1 ? 'recensione' : 'recensioni'})${
        episodesAverageRating !== null
          ? ` • Media episodi: ${episodesAverageRating.toFixed(1)}`
          : ''
      }`
    : episodesAverageRating !== null
    ? `Media basata su ${ratedEpisodesCount} episodi valutati`
    : undefined;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Season Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none group"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2 min-w-0">
          <RewatchControls
            count={seasonMinWatchCount}
            onToggle={onToggleSeason}
            onAdd={onAddSeasonWatch}
            onSub={onSubSeasonWatch}
          />

          <h3 className="font-bold text-gray-900 text-lg truncate">{seasonTitle}</h3>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md ml-2 shrink-0">
            {watchedCount} / {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {displayRating !== null && (
            <button
              type="button"
              onClick={onOpenSeasonDetail}
              title={ratingTooltip}
              className="flex items-center rounded-lg p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <StarRating
                value={displayRating}
                hideNumber={true}
                readonly
                iconClassName="w-4 h-4"
                activeColorClass={hasSeasonRating ? 'text-amber-600' : 'text-yellow-400'}
              />
            </button>
          )}

          {/* Pulsante Informazioni & Valutazione Stagione */}
          <button
            type="button"
            onClick={onOpenSeasonDetail}
            title="Informazioni, voti e recensioni della stagione"
            aria-label={`Informazioni ${seasonTitle}`}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label={isExpanded ? 'Comprimi stagione' : 'Espandi stagione'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Episodes List */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {seasonEpisodes.map((ep) => {
            const watchCount = ep.watch_count || 0;
            const epData = getEpisodePersonalRating(ep);

            return (
              <div
                key={ep.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 cursor-pointer group transition-colors"
                onClick={() => onSelectEpisode(ep)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <RewatchControls
                    count={watchCount}
                    onToggle={(e) => onToggleEpisode(e, ep.id, watchCount)}
                    onAdd={(e) => onWatchCountChange(e, ep.id, 1)}
                    onSub={(e) => onWatchCountChange(e, ep.id, -1)}
                  />

                  <div className="flex flex-col ml-1 min-w-0">
                    <span className="font-bold text-gray-800 truncate">
                      {ep.episode_number}. {ep.title || `Episodio ${ep.episode_number}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {epData !== null && (
                    <div
                      title={
                        epData.count > 1
                          ? `Media voto personale: ${epData.rating.toFixed(1)} (${epData.count} valutazioni)`
                          : `Voto personale: ${epData.rating.toFixed(1)}`
                      }
                    >
                      <StarRating value={epData.rating} hideNumber={true} readonly iconClassName="w-4 h-4" />
                    </div>
                  )}
                  <div className="w-5 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
