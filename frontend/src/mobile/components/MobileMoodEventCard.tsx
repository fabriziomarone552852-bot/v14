// src/mobile/components/MobileMoodEventCard.tsx
import React, { useRef } from 'react';
import type { DailyEntry } from '@/types/dailyentries';
import type { DbMonthlyEntry } from '@/types/monthlyentries';
import { getOriginClass, getNumCols } from '@/utils/uiUtils';

export type MoodEvent = DailyEntry | DbMonthlyEntry;

export const getEventText = (ev: MoodEvent): string => {
  if ('testo' in ev && ev.testo) return ev.testo;
  if ('monthly_field' in ev && ev.monthly_field) return ev.monthly_field;
  return '';
};

const textStyle =
  'text-[length:clamp(0.85rem,10cqmin,1.15rem)] font-black leading-tight break-words whitespace-pre-wrap w-full min-w-0 max-w-full select-none line-clamp-3';

interface MobileMoodEventCardProps {
  ev: MoodEvent;
  index: number;
  totalBlocks: number;
  themeColor: 'green' | 'red';
  onTap: () => void;
  onLongPress: () => void;
}

export const MobileMoodEventCard: React.FC<MobileMoodEventCardProps> = ({
  ev,
  index,
  totalBlocks,
  themeColor,
  onTap,
  onLongPress,
}) => {
  const originClass = getOriginClass(index, getNumCols(totalBlocks));
  const isGreen = themeColor === 'green';

  const colors = isGreen
    ? {
        bgHover: 'hover:bg-green-50',
        bgIdle: 'bg-green-100',
        border: 'border-green-200',
        text: 'text-green-900',
      }
    : {
        bgHover: 'hover:bg-red-50',
        bgIdle: 'bg-red-100',
        border: 'border-red-200',
        text: 'text-red-900',
      };

  // Timer e flag per rilevare la Pressione Prolungata (Long Press ~450ms)
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const startLongPress = () => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      onLongPress();
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const endLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isLongPressTriggeredRef.current) {
      onTap();
    }
  };

  return (
    <div className="relative w-full h-full @container select-none z-10">
      <div
        onTouchStart={startLongPress}
        onTouchEnd={endLongPress}
        onTouchMove={cancelLongPress}
        onMouseDown={startLongPress}
        onMouseUp={endLongPress}
        onMouseLeave={cancelLongPress}
        className={`absolute bottom-0 left-0 right-0 flex flex-col justify-center items-center text-center rounded-xl border transition-all duration-300 ease-out min-h-full w-full ${originClass} overflow-hidden shadow-2xs ${colors.bgIdle} ${colors.border} ${colors.text} ${colors.bgHover} cursor-pointer active:scale-[0.98] p-2`}
        title="Tocca per espandere • Tieni premuto per modificare"
      >
        <span className={textStyle}>{getEventText(ev)}</span>
      </div>
    </div>
  );
};

export default MobileMoodEventCard;
