// src/mobile/components/trackers/shared/MobileTrackerHighlightCard.tsx
import React from 'react';

export type TrackerHighlightType = 'watching' | 'added' | 'completed' | 'watched' | 'obtained' | 'custom';

export interface MobileTrackerHighlightCardProps {
  type: TrackerHighlightType;
  posterUrl?: string | null;
  title?: string | null;
  topLabel?: string | null;
  placeholderIcon?: React.ReactNode;
  onClick: () => void;
  customBadgeIcon?: React.ReactNode;
  badgeBgColor?: string;
  borderColorClass?: string;
}

export const MobileTrackerHighlightCard: React.FC<MobileTrackerHighlightCardProps> = ({
  type,
  posterUrl,
  title,
  topLabel,
  placeholderIcon,
  onClick,
  customBadgeIcon,
  badgeBgColor,
  borderColorClass = 'border-gray-200/80',
}) => {
  const renderBadgeIcon = () => {
    if (customBadgeIcon) return customBadgeIcon;

    if (type === 'watching') {
      return (
        <svg className="w-3 h-3 fill-current translate-x-[0.5px]" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    }
    if (type === 'added') {
      return (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    }
    if (type === 'obtained') {
      return (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      );
    }
    // completed or watched
    return (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    );
  };

  const getBadgeBg = () => {
    if (badgeBgColor) return badgeBgColor;
    if (type === 'obtained') return 'bg-amber-600';
    return 'bg-blue-600';
  };

  return (
    <div className="flex flex-col items-center w-full">
      {topLabel && (
        <span className="text-[9px] font-extrabold uppercase text-gray-500 truncate w-full text-center mb-1">
          {topLabel}
        </span>
      )}

      <div
        onClick={onClick}
        className={`relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xs border ${borderColorClass} cursor-pointer select-none active:scale-[0.97] transition-all bg-gray-100 shrink-0`}
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title || ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-1.5 text-center text-gray-400">
            {placeholderIcon || (
              <svg className="w-5 h-5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        )}

        {/* Badge in basso a destra con icona identificativa */}
        <div
          className={`absolute bottom-1 right-1 z-10 w-5 h-5 rounded-md ${getBadgeBg()} text-white flex items-center justify-center shadow-md border border-white/30`}
        >
          {renderBadgeIcon()}
        </div>
      </div>
    </div>
  );
};

export default MobileTrackerHighlightCard;
