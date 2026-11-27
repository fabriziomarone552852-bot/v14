import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FilmIcon, TvIcon } from '@/components/shared/utils/Icons';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';

export interface MobilePersonCreditPosterItem {
  id: number;
  title: string;
  year: string | null;
  posterUrl: string | null;
  status?: string | null;
  externalStatus?: string | null;
}

export interface MobilePersonCreditsSectionProps {
  variant: 'movie' | 'tv';
  title: string;
  items: MobilePersonCreditPosterItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: (tmdbId: number) => void;
}

/**
 * Sezione filmografia mobile in stile Catalogo (pillola centrale cliccabile per ridurre/espandere
 * la sezione come una finestra + griglia a 3 colonne di sole locandine).
 */
export const MobilePersonCreditsSection: React.FC<MobilePersonCreditsSectionProps> = ({
  variant,
  title,
  items,
  isCollapsed,
  onToggleCollapse,
  onSelect,
}) => {
  if (items.length === 0) return null;

  const FallbackIcon = variant === 'movie' ? FilmIcon : TvIcon;

  return (
    <section
      className={`w-full transition-[margin] duration-300 ${
        isCollapsed ? 'mb-1 last:mb-2' : 'mb-6 last:mb-2'
      }`}
    >
      {/* Pillola centrale cliccabile in stile catalogo mobile */}
      <div className="w-full flex items-center justify-center my-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? `Espandi sezione ${title}` : `Riduci sezione ${title}`}
          className={`px-4 py-1 rounded-full text-[11px] font-black tracking-wide uppercase text-center select-none inline-flex items-center gap-1.5 border shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer ${
            isCollapsed
              ? 'text-gray-500 bg-gray-100 border-gray-300/70'
              : 'text-gray-700 bg-gray-200 border-gray-300/70'
          }`}
        >
          <span>{title}</span>
          <span className="text-[10px] font-bold text-gray-500">({items.length})</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${
              isCollapsed ? 'rotate-0' : 'rotate-180'
            }`}
          />
        </button>
      </div>

      {/* Griglia a 3 colonne di sole locandine con effetto riduzione finestra */}
      <div
        aria-hidden={isCollapsed}
        className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-in-out origin-top ${
          isCollapsed
            ? 'grid-rows-[0fr] opacity-0 scale-95 pointer-events-none'
            : 'grid-rows-[1fr] opacity-100 scale-100'
        }`}
      >
        <div className="overflow-hidden">
          <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3 content-start pt-0.5 pb-1">
            {items.map((item) => {
              const borderClass = getMediaBorderClass(item.status, item.externalStatus, {
                isThick: true,
              });

              return (
                <button
                  key={`${variant}-${item.id}`}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  tabIndex={isCollapsed ? -1 : 0}
                  className={`w-full relative aspect-[2/3] rounded-xl overflow-hidden shadow-xs bg-gray-900 ${borderClass} active:scale-[0.96] transition-all duration-150 cursor-pointer flex items-center justify-center select-none`}
                  title={item.title}
                  aria-label={item.title}
                >
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-linear-to-b from-gray-800 to-gray-950 text-gray-300">
                      <FallbackIcon className="w-6 h-6 text-gray-500 mb-1" />
                      <span className="text-[11px] font-black line-clamp-2 leading-tight text-white/90">
                        {item.title}
                      </span>
                      {item.year && (
                        <span className="text-[9px] font-semibold text-gray-400 mt-1">
                          {item.year}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
