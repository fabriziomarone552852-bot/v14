// src/mobile/components/trackers/detail/MobileEpisodeDetailBanner.tsx
import React from 'react';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { Tv } from 'lucide-react';

export interface MobileEpisodeDetailBannerProps {
  backdropUrl?: string | null;
  title: string;
  onClose: () => void;
}

export const MobileEpisodeDetailBanner: React.FC<MobileEpisodeDetailBannerProps> = ({
  backdropUrl,
  title,
  onClose,
}) => {
  return (
    <div className="relative w-full h-56 shrink-0 bg-gray-900 select-none overflow-hidden">
      {/* 1. IMMAGINE STILL / BACKDROP EPISODIO */}
      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-950">
          <Tv className="w-12 h-12 opacity-30" />
        </div>
      )}

      {/* Sfumatura di contrasto per garantire massima leggibilità */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/30 to-black/40 pointer-events-none" />

      {/* 2. PULSANTE IN ALTO A DESTRA: "X" PER CHIUDERE */}
      <div className="absolute top-3 right-3 flex items-center z-30">
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-90 shadow-lg"
          title="Chiudi"
          aria-label="Chiudi dettaglio episodio"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 3. TITOLO DELL'EPISODIO NEL MARGINE INFERIORE */}
      <div className="absolute bottom-3 left-3.5 right-3.5 z-20">
        <h1 className="font-black text-white text-lg sm:text-xl drop-shadow-md leading-tight line-clamp-2">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default MobileEpisodeDetailBanner;
