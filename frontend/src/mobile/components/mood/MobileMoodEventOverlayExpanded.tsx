// src/mobile/components/mood/MobileMoodEventOverlayExpanded.tsx
import React from 'react';
import { type MoodEvent, getEventText } from '../MobileMoodEventCard';

interface MobileMoodEventOverlayExpandedProps {
  expandedEvent: MoodEvent;
  bgIdle: string;
  border: string;
  text: string;
  onStartLongPress: (id: number) => void;
  onEndLongPress: () => void;
  onCancelLongPress: () => void;
}

export const MobileMoodEventOverlayExpanded: React.FC<MobileMoodEventOverlayExpandedProps> = ({
  expandedEvent,
  bgIdle,
  border,
  text,
  onStartLongPress,
  onEndLongPress,
  onCancelLongPress,
}) => {
  return (
    <div
      onTouchStart={() => onStartLongPress(expandedEvent.id)}
      onTouchEnd={onEndLongPress}
      onTouchMove={onCancelLongPress}
      onMouseDown={() => onStartLongPress(expandedEvent.id)}
      onMouseUp={onEndLongPress}
      onMouseLeave={onCancelLongPress}
      className={`absolute inset-1.5 z-50 rounded-2xl border shadow-xl p-4 flex flex-col justify-center items-center text-center animate-fadeIn cursor-pointer ${bgIdle} ${border} ${text}`}
      title="Tocca per chiudere • Tieni premuto per modificare"
    >
      <div className="w-full flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar pointer-events-none">
        <p className="text-[length:clamp(0.95rem,10cqmin,1.25rem)] font-black leading-tight break-words whitespace-pre-wrap w-full select-none">
          {getEventText(expandedEvent)}
        </p>
      </div>
    </div>
  );
};

export default MobileMoodEventOverlayExpanded;
