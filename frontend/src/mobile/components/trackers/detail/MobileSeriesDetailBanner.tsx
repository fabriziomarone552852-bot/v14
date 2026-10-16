// src/mobile/components/trackers/detail/MobileSeriesDetailBanner.tsx
import React from 'react';
import type { MediaList, SeriesFriendDisplayItem } from '@/types/trackers';
import { CloseIcon } from '@/components/shared/utils/Icons';

export interface MobileSeriesDetailBannerProps {
  backdropUrl: string;
  title: string;
  genres: string[];
  onGenreClick?: (genre: string) => void;
  friends: SeriesFriendDisplayItem[];
  listsWithSeries: MediaList[];
  StatusIcon: React.ReactNode;
  statusColor: string;
  onClose: () => void;
  onOpenOptions: () => void;
  onOpenFriendsDrawer: () => void;
  onOpenListsDrawer: () => void;
}

export const MobileSeriesDetailBanner: React.FC<MobileSeriesDetailBannerProps> = ({
  backdropUrl,
  title,
  genres,
  onGenreClick,
  friends,
  listsWithSeries,
  StatusIcon,
  statusColor,
  onClose,
  onOpenOptions,
  onOpenFriendsDrawer,
  onOpenListsDrawer,
}) => {
  return (
    <div className="relative w-full h-56 shrink-0 bg-gray-900 select-none overflow-hidden">
      {/* 1. IMMAGINE BACKDROP NITIDA SENZA EFFETTO BLUR */}
      <img
        src={backdropUrl}
        alt={title}
        className="w-full h-full object-cover"
      />

      {/* Sfumatura di contrasto per garantire massima leggibilità di testi e icone */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/30 to-black/40 pointer-events-none" />

      {/* 2. PILLS DEI GENERI IN ALTO A SINISTRA (Stile Webpage, multilinea automatica) */}
      {genres.length > 0 && (
        <div className="absolute top-3 left-3 max-w-[calc(100%-84px)] z-20 flex flex-wrap gap-1.5 items-center">
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
      )}

      {/* 3. PULSANTI IN ALTO A DESTRA: TRE PUNTINI (...) E "X" PER CHIUDERE */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
        <button
          type="button"
          onClick={onOpenOptions}
          className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-90 shadow-lg"
          title="Opzioni serie"
          aria-label="Opzioni serie"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-90 shadow-lg"
          title="Chiudi"
          aria-label="Chiudi dettaglio serie"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 4. COLONNA VERTICALE SOTTO LA "X": LISTE E AMICI (Stile Webpage) */}
      <div className="absolute top-13 right-3 flex flex-col items-center gap-2 z-30">
        {/* Pallino Liste: sempre riassunto, stile webpage */}
        <button
          type="button"
          onClick={onOpenListsDrawer}
          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg cursor-pointer hover:bg-white/40 active:scale-90 transition-all"
          title={`Vedi liste (${listsWithSeries.length})`}
          aria-label={`Liste (${listsWithSeries.length})`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Pallino Amici: compare solo se almeno un amico ha la serie a catalogo */}
        {friends.length > 0 && (
          <button
            type="button"
            onClick={onOpenFriendsDrawer}
            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-md text-blue-600 cursor-pointer hover:scale-105 active:scale-90 transition-transform"
            title={`Vedi amici (${friends.length})`}
            aria-label={`Amici (${friends.length})`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </button>
        )}
      </div>

      {/* 5. TITOLO DELLA SERIE CON ICONA DI STATO ANTECEDENTE NEL MARGINE INFERIORE */}
      <div className="absolute bottom-3 left-3.5 right-14 z-20 flex items-center gap-2.5">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-md border-2 border-white ${statusColor}`}
          title="Stato serie"
        >
          {StatusIcon}
        </div>
        <h1 className="font-black text-white text-lg sm:text-xl drop-shadow-md leading-tight line-clamp-2">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default MobileSeriesDetailBanner;
