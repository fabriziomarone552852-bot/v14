// src/components/trackers/shared/MediaPosterFolderTab.tsx
import React from 'react';
import { getMediaStatusConfig, getMediaStatusLabel } from '@/utils/mediaStatusTheme';
import type { MediaType } from '@/utils/mediaStatusTheme';

interface MediaPosterFolderTabProps {
  status?: string | null;
  externalStatus?: string | null;
  mediaType?: MediaType;
}

/**
 * Linguetta stile portadocumenti (folder/index tab) ancorata al bordo inferiore
 * della locandina che spunta verso l'alto (slide-up) quando si passa con il mouse.
 */
export const MediaPosterFolderTab: React.FC<MediaPosterFolderTabProps> = ({
  status,
  externalStatus,
  mediaType = 'movies',
}) => {
  const config = getMediaStatusConfig(status, externalStatus);
  const label = getMediaStatusLabel(status, externalStatus, mediaType);

  return (
    <div
      className="absolute bottom-[-2px] left-4 z-40 pointer-events-none transition-all duration-300 ease-out transform translate-y-full group-hover/poster:translate-y-0 opacity-0 group-hover/poster:opacity-100"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Profilo Linguetta Portadocumenti */}
      <div
        className={`px-3 pt-1.5 pb-2 rounded-t-lg rounded-b-none ${config.tabBg} ${config.tabText} border-t-2 border-x-2 ${config.tabBorder} border-b-0 shadow-[0_-8px_14px_-6px_rgba(0,0,0,0.3)] flex items-center justify-center`}
      >
        {/* Etichetta stile schedario */}
        <span className="text-[10.5px] font-black uppercase tracking-wider leading-none select-none">
          {label}
        </span>
      </div>
    </div>
  );
};

export default MediaPosterFolderTab;
