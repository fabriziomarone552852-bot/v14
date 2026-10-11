// src/components/trackers/SeriesDetailModal/SeriesMainOverview.tsx
import React from 'react';
import type { TMDBEpisode } from '@/types/trackers';
import { StarRating } from './StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';

interface SeriesQuoteItem {
  id: string | number;
  episodeStr: string;
  text: string;
  episodeData: TMDBEpisode;
}

interface SeriesMainOverviewProps {
  tmdbValue: number | null;
  friendsAverage: number | null;
  myAverage: number | null;
  logsCount: number;
  quotes: SeriesQuoteItem[];
  onOpenFriendsReviews: () => void;
  onOpenMyReviews: () => void;
  onOpenEpisode?: (episode: TMDBEpisode) => void;
}

export const SeriesMainOverview: React.FC<SeriesMainOverviewProps> = ({
  tmdbValue,
  friendsAverage,
  myAverage,
  logsCount,
  quotes,
  onOpenFriendsReviews,
  onOpenMyReviews,
  onOpenEpisode,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full">
      {/* Voti Globali */}
      <div className="flex items-center justify-center gap-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">TMDB</span>
          <div className="flex items-center">
            {tmdbValue !== null ? (
              <StarRating value={tmdbValue} hideNumber readonly iconClassName="w-6 h-6" />
            ) : (
              <span className="text-gray-400 font-medium">--</span>
            )}
          </div>
        </div>

        <div className="w-px h-12 bg-gray-200"></div>

        <div
          onClick={onOpenFriendsReviews}
          className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-2 -m-2 group"
        >
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
            Amici
          </span>
          <div className="flex items-center">
            {friendsAverage !== null ? (
              <StarRating value={friendsAverage} hideNumber readonly iconClassName="w-6 h-6" />
            ) : (
              <span className="text-gray-400 font-medium">--</span>
            )}
          </div>
        </div>

        <div className="w-px h-12 bg-gray-200"></div>

        <div
          onClick={onOpenMyReviews}
          className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-2 -m-2 group"
        >
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
            Il Tuo Voto
          </span>
          <div
            className="flex items-center"
            title={`Media basata su ${logsCount} voti`}
          >
            {myAverage !== null ? (
              <StarRating value={myAverage} hideNumber readonly iconClassName="w-6 h-6" />
            ) : (
              <span className="text-gray-400 font-medium">--</span>
            )}
          </div>
        </div>
      </div>

      {/* Citazioni (sola lettura) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Citazioni
            {quotes.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {quotes.length}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-5 pr-2">
          {quotes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <EmptyState message="Nessuna citazione salvata per questa serie." />
            </div>
          ) : (
            quotes.map((q) => (
              <div
                key={q.id}
                className="relative bg-white border border-gray-200 rounded-2xl p-4 pt-5 flex flex-col gap-2"
              >
                <span
                  onClick={() => onOpenEpisode && onOpenEpisode(q.episodeData)}
                  className="absolute -top-3 left-4 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 shadow-sm tracking-wider cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  title="Apri Dettaglio Episodio"
                >
                  {q.episodeStr}
                </span>
                <p className="text-gray-800 italic font-medium leading-relaxed">&ldquo;{q.text}&rdquo;</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
