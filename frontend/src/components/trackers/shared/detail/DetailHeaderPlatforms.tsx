import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export interface HeaderWatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
}

export interface DetailHeaderPlatformsProps {
  providers?: HeaderWatchProviderItem[] | null;
  onPlatformClick?: (platformName: string) => void;
}

interface HoveredTooltipState {
  name: string;
  top: number;
  left: number;
  alignLeftEdge: boolean;
}

/**
 * Mostra i loghi delle piattaforme streaming nell'header del modale dettaglio desktop,
 * renderizzando il tooltip nome piattaforma in un Portal sopra locandina e bordi del modale.
 */
export const DetailHeaderPlatforms: React.FC<DetailHeaderPlatformsProps> = ({
  providers,
  onPlatformClick,
}) => {
  const [hovered, setHovered] = useState<HoveredTooltipState | null>(null);

  if (!providers || providers.length === 0) return null;

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, name: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const alignLeftEdge = rect.left < 90;
    setHovered({
      name,
      top: rect.bottom + 6,
      left: alignLeftEdge ? Math.max(8, rect.left) : rect.left + rect.width / 2,
      alignLeftEdge,
    });
  };

  const handleMouseLeave = () => {
    setHovered(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        {providers.map((provider) => (
          <button
            key={provider.provider_id}
            type="button"
            onClick={() => {
              setHovered(null);
              onPlatformClick?.(provider.provider_name);
            }}
            onMouseEnter={(e) => handleMouseEnter(e, provider.provider_name)}
            onMouseLeave={handleMouseLeave}
            aria-label={provider.provider_name}
            className={`relative flex items-center rounded-md focus:outline-none ${
              onPlatformClick ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            }`}
          >
            {provider.logo_path ? (
              <img
                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                alt={provider.provider_name}
                className="w-7 h-7 rounded-md shadow-md border border-white/20 bg-white"
              />
            ) : (
              <div className="w-7 h-7 rounded-md shadow-md border border-white/20 bg-white text-[10px] font-black text-gray-800 flex items-center justify-center">
                {provider.provider_name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </button>
        ))}
      </div>

      {hovered &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${hovered.top}px`,
              left: `${hovered.left}px`,
              transform: hovered.alignLeftEdge ? 'none' : 'translateX(-50%)',
              zIndex: 10070,
            }}
            className="bg-gray-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap pointer-events-none shadow-xl border border-white/15"
          >
            {hovered.name}
          </div>,
          document.body
        )}
    </>
  );
};

export default DetailHeaderPlatforms;
