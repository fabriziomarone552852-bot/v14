// src/mobile/components/MobileMoodEventsBoard.tsx
import React from 'react';
import type { MoodEventType } from '@/types';
import type { MoodEvent } from './MobileMoodEventCard';
import { MobileMoodEventColumn } from './MobileMoodEventColumn';

interface MobileMoodEventsBoardProps {
  positiveEvents: MoodEvent[];
  negativeEvents: MoodEvent[];
  periodLabel?: string;
  onAddMoodEvent: (type: MoodEventType, title: string) => Promise<unknown> | void;
  onUpdateMoodEvent: (id: number, newTitle: string) => Promise<unknown> | void;
  onDeleteMoodEvent: (id: number) => void;
}

export const MobileMoodEventsBoard: React.FC<MobileMoodEventsBoardProps> = ({
  positiveEvents,
  negativeEvents,
  periodLabel = 'questa settimana',
  onAddMoodEvent,
  onUpdateMoodEvent,
  onDeleteMoodEvent,
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 w-full h-full overflow-hidden">
      {/* 1. RIQUADRO COSE POSITIVE (Sopra) */}
      <MobileMoodEventColumn
        title="Cose Positive"
        type="EP"
        events={positiveEvents}
        themeColor="green"
        periodLabel={periodLabel}
        onAdd={onAddMoodEvent}
        onUpdate={onUpdateMoodEvent}
        onDelete={onDeleteMoodEvent}
      />

      {/* 2. RIQUADRO COSE NEGATIVE (Sotto) */}
      <MobileMoodEventColumn
        title="Cose Negative"
        type="EN"
        events={negativeEvents}
        themeColor="red"
        periodLabel={periodLabel}
        onAdd={onAddMoodEvent}
        onUpdate={onUpdateMoodEvent}
        onDelete={onDeleteMoodEvent}
      />
    </div>
  );
};

export default MobileMoodEventsBoard;
