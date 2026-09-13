// src/mobile/components/modals/countdown/MobileCountdownHubRow.tsx
import React from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import starsGif from '@/assets/stars.gif';
import TickDisplay from '@/components/day/utils/TickDisplay';
import { useLongPress } from '@/mobile/hooks/useLongPress';

export interface MobileCountdownHubRowProps {
  cd: CountdownItem;
  now: Date;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelect: (id: number) => void;
  onSelect: (cd: CountdownItem) => void;
}

export const MobileCountdownHubRow: React.FC<MobileCountdownHubRowProps> = ({
  cd,
  now,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onSelect,
}) => {
  const targetDate = new Date(cd.targetDateStr);
  const isPast = targetDate.getTime() <= now.getTime();

  const longPressHandlers = useLongPress({
    onLongPress: () => onToggleSelect(cd.id),
    onClick: () => {
      if (isSelectionMode) {
        onToggleSelect(cd.id);
      } else {
        onSelect(cd);
      }
    },
  });

  return (
    <div
      {...longPressHandlers}
      className={`relative h-24 w-full rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md border active:scale-[0.99] transition-all select-none ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-inset border-blue-400 shadow-[0_0_14px_rgba(59,130,246,0.5)] relative z-10'
          : 'border-gray-200/80 hover:border-blue-400'
      } ${isPast && !isSelected ? 'opacity-65 grayscale-[25%]' : ''}`}
    >
      {/* Background Cover */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${cd.imageUrl})`,
          backgroundPosition: cd.immaginePosizione || 'center',
        }}
      />

      {/* Stars animation if past */}
      {isPast && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 z-0 mix-blend-screen"
          style={{ backgroundImage: `url(${starsGif})` }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10" />

      {/* Titolo e Data in Basso a Sinistra, Timer in Basso a Destra */}
      <div className="absolute bottom-0 left-0 w-full p-3.5 z-20 flex justify-between items-end pointer-events-none">
        <div className="flex flex-col overflow-hidden mr-3">
          <h3 className="text-white font-extrabold text-sm uppercase tracking-wide truncate drop-shadow-sm">
            {cd.title}
          </h3>
          <span
            className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${
              isPast ? 'text-green-400' : 'text-gray-300'
            }`}
          >
            {targetDate.toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {!isPast && (
          <div className="shrink-0 mb-0.5">
            <TickDisplay targetDateStr={cd.targetDateStr} variant="hub" />
          </div>
        )}
      </div>
    </div>
  );
};
