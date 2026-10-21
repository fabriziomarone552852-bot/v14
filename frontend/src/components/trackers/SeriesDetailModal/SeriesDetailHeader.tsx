// src/components/trackers/SeriesDetailModal/SeriesDetailHeader.tsx
import React from 'react';
import { Ban, RotateCcw } from 'lucide-react';
import type { MediaList, SeriesFriendDisplayItem } from '@/types/trackers';
import type { TMDBProvidersResponse } from './hooks/useSeriesDetailModalLogic';
import { SeriesDetailListsBar } from './SeriesDetailListsBar';

interface SeriesDetailHeaderProps {
  backdropUrl: string;
  onClose: () => void;
  isUserTracked?: boolean;
  isAbandoned?: boolean;
  onAbandon?: () => void;
  onResume?: () => void;
  genres: string[];
  onGenreClick?: (genre: string) => void;
  providersData?: TMDBProvidersResponse | null;
  onPlatformClick?: (platform: string) => void;
  isFriendsLoading: boolean;
  friends: SeriesFriendDisplayItem[];
  onOpenFriendsPanel: () => void;
  getStatusBorderColor: (status: string) => string;
  listsWithSeries: MediaList[];
  onOpenListManager: () => void;
  onOpenListDrawer: (listId?: number) => void;
}

export const SeriesDetailHeader: React.FC<SeriesDetailHeaderProps> = ({
  backdropUrl,
  onClose,
  isUserTracked = false,
  isAbandoned = false,
  onAbandon,
  onResume,
  genres,
  onGenreClick,
  providersData,
  onPlatformClick,
  isFriendsLoading,
  friends,
  onOpenFriendsPanel,
  getStatusBorderColor,
  listsWithSeries,
  onOpenListManager,
  onOpenListDrawer,
}) => {
  return (
    <div className="relative h-48 shrink-0 bg-gray-900">
      <img
        src={backdropUrl}
        alt="Backdrop"
        className="w-full h-full object-cover opacity-50 blur-sm scale-105"
      />

      {/* AZIONI IN ALTO A DESTRA: TASTO ABBANDONA / RIPRENDI E TASTO CHIUDI */}
      <div className="absolute top-4 right-4 flex items-center gap-2.5 z-20">
        {isUserTracked && (
          <button
            type="button"
            onClick={isAbandoned ? onResume : onAbandon}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all duration-200 cursor-pointer border border-white/20 bg-black/30 text-white shadow-lg flex items-center gap-1.5 active:scale-95 select-none hover:bg-red-600/80 hover:border-red-500"
            title={isAbandoned ? 'Riprendi serie' : 'Abbandona serie'}
          >
            {isAbandoned ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-white" />
                <span>Riprendi</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5 text-white" />
                <span>Abbandona</span>
              </>
            )}
          </button>
        )}

        {/* Tasto Chiudi */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-colors cursor-pointer border border-white/10"
          title="Chiudi"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* BADGES IN ALTO A SINISTRA (Generi e Piattaforme) */}
      <div className="absolute top-4 left-6 flex flex-col gap-3 max-w-xl z-20">
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <span
              key={g}
              onClick={() => onGenreClick && onGenreClick(g)}
              className={`px-3 py-1 bg-black/40 text-white text-xs font-bold rounded-full backdrop-blur-md border border-white/20 shadow-lg ${
                onGenreClick ? 'cursor-pointer hover:bg-black/60 transition-colors' : ''
              }`}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Piattaforme Streaming */}
        {Boolean(providersData?.flatrate && providersData.flatrate.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center">
            {providersData!.flatrate!.map((provider) => (
              <div
                key={provider.provider_id}
                className="relative group/provider flex items-center"
                onClick={() => onPlatformClick && onPlatformClick(provider.provider_name)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                  alt={provider.provider_name}
                  className={`w-7 h-7 rounded-md shadow-md border border-white/20 bg-white ${
                    onPlatformClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''
                  }`}
                />
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/provider:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-30">
                  {provider.provider_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AMICI E LISTE (In basso a destra) */}
      <div className="absolute bottom-4 right-6 flex flex-col items-end gap-2 z-20 max-w-[calc(100%-340px)] justify-start">
        {(isFriendsLoading || friends.length > 0) && (
          <div className="flex items-center flex-row-reverse gap-1.5">
            {isFriendsLoading ? (
              <div
                className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md animate-pulse border-2 border-white/50 shadow-md"
                title="Caricamento amici..."
              />
            ) : friends.length > 4 ? (
              <div
                onClick={onOpenFriendsPanel}
                className="relative cursor-pointer hover:z-30 transition-transform hover:scale-110 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-md text-blue-600"
                title="Vedi tutti gli amici"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            ) : (
              friends.map((f) => (
                <div
                  key={f.id}
                  onClick={onOpenFriendsPanel}
                  className="relative group/friend cursor-pointer hover:z-30 transition-transform hover:scale-110"
                >
                  <img
                    src={f.avatar}
                    alt={f.name}
                    className={`w-8 h-8 object-cover rounded-full border-2 bg-gray-200 shadow-md ${getStatusBorderColor(
                      f.status
                    )}`}
                  />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/friend:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    {f.name}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <SeriesDetailListsBar
          lists={listsWithSeries}
          onOpenManager={onOpenListManager}
          onOpenDrawer={onOpenListDrawer}
        />
      </div>
    </div>
  );
};
