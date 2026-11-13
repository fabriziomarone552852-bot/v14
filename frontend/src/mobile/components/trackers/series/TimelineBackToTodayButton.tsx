// src/mobile/components/trackers/TimelineBackToTodayButton.tsx
import React from 'react';

export interface TimelineBackToTodayButtonProps {
  visible: boolean;
  isAnchorBelow: boolean;
  onClick: () => void;
}

export const TimelineBackToTodayButton: React.FC<TimelineBackToTodayButtonProps> = ({
  visible,
  isAnchorBelow,
  onClick,
}) => {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer animate-fadeIn border-2 border-white/90"
      title="Torna ad oggi / prossimo"
      aria-label="Torna ad oggi / prossimo"
    >
      {isAnchorBelow ? (
        // Freccia verso il basso: riporta in basso all'episodio di oggi/prossimo
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      ) : (
        // Freccia verso l'alto: riporta in alto all'episodio di oggi/prossimo
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      )}
    </button>
  );
};

export default TimelineBackToTodayButton;
