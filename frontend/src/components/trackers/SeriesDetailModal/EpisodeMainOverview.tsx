// src/components/trackers/SeriesDetailModal/EpisodeMainOverview.tsx
import React from 'react';
import type { TMDBEpisode, UserEpisodeLog } from '@/types/trackers';
import { StarRating } from './StarRating';

interface EpisodeMainOverviewProps {
  episode: TMDBEpisode;
  logs: UserEpisodeLog[];
  onBack: () => void;
  handleToggleWatched: () => void;
  imagePlaceholder: string;
  onOpenQuotes: () => void;
  quotesCount: number;
  tmdbValue: number | null;
  friendsAverage: number | null;
  myAverage: number | null;
  onOpenFriendsReviews: () => void;
  onOpenMyReviews: () => void;
}

export const EpisodeMainOverview: React.FC<EpisodeMainOverviewProps> = ({
  episode,
  logs,
  onBack,
  handleToggleWatched,
  imagePlaceholder,
  onOpenQuotes,
  quotesCount,
  tmdbValue,
  friendsAverage,
  myAverage,
  onOpenFriendsReviews,
  onOpenMyReviews,
}) => {
  return (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* Intestazione */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors cursor-pointer"
            title="Torna indietro"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <span className="text-blue-600 font-bold text-sm tracking-wider uppercase flex items-center gap-2">
              <span>
                {episode.season_number === 0
                  ? `Episodi Speciali - Episodio ${episode.episode_number}`
                  : `Stagione ${episode.season_number} - Episodio ${episode.episode_number}`}
              </span>
              {episode.air_date && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500 font-medium tracking-normal capitalize">
                    {new Date(episode.air_date).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </>
              )}
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
              {episode.title || `Episodio ${episode.episode_number}`}
            </h2>
          </div>
        </div>

        <button
          onClick={handleToggleWatched}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-sm cursor-pointer ${
            logs.length > 0
              ? 'bg-blue-500 text-white shadow-md'
              : 'border-2 border-gray-300 text-transparent hover:border-blue-400'
          }`}
          title={logs.length > 0 ? 'Segna come non visto' : 'Segna come visto'}
        >
          {logs.length > 0 ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Corpo Principale (Immagine + Trama) */}
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-1/2 rounded-xl overflow-hidden bg-gray-200 shadow-md relative group">
          <img src={imagePlaceholder} alt="Episode thumbnail" className="w-full h-full object-cover" />
          <button
            onClick={onOpenQuotes}
            className={`absolute bottom-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${
              quotesCount > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            title="Citazioni"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {quotesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-sm"></span>
            )}
          </button>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="prose prose-sm text-gray-700 leading-relaxed overflow-y-auto custom-scrollbar pr-2 h-full">
            {episode.overview ? (
              <p>{episode.overview}</p>
            ) : (
              <p className="italic text-gray-400">Nessuna trama disponibile per questo episodio.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sezione Voti (In Basso) */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-6 shrink-0">
        <div className="flex items-center justify-center gap-16">
          {/* TMDB */}
          <div className="flex flex-col items-center gap-2 shrink-0 px-4">
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

          {/* Amici */}
          <div
            onClick={onOpenFriendsReviews}
            className="flex flex-col items-center gap-2 shrink-0 px-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-2 -m-2 group"
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
        </div>

        <div className="w-full max-w-xs pb-2">
          {myAverage !== null ? (
            <div
              onClick={onOpenMyReviews}
              className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl p-3 transition-colors border border-transparent hover:border-gray-200"
            >
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Il Tuo Voto</span>
              <div
                className="flex items-center"
                title={`Media basata su ${logs.filter((l) => typeof l.rating === 'number').length} voti`}
              >
                <StarRating value={myAverage} hideNumber readonly iconClassName="w-7 h-7" />
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenMyReviews}
              className="w-full flex flex-col items-center justify-center gap-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Ancora nessun voto
              </span>
              <span className="text-sm font-extrabold text-gray-700">Aggiungilo!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
