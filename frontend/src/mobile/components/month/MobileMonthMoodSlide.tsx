// src/mobile/components/month/MobileMonthMoodSlide.tsx
import React from 'react';
import type { MoodEventType } from '@/types';
import type { MoodEvent } from '../MobileMoodEventCard';
import MobileMoodEventsBoard from '../MobileMoodEventsBoard';

interface MobileMonthMoodSlideProps {
  activePageIndex: 0 | 1 | 2;
  positiveEvents: MoodEvent[];
  negativeEvents: MoodEvent[];
  onAddMoodEvent: (tipo: MoodEventType, title: string) => void;
  onUpdateMoodEvent: (id: number, newTitle: string) => void;
  onDeleteMoodEvent: (id: number) => void;
}

export const MobileMonthMoodSlide: React.FC<MobileMonthMoodSlideProps> = ({
  activePageIndex,
  positiveEvents,
  negativeEvents,
  onAddMoodEvent,
  onUpdateMoodEvent,
  onDeleteMoodEvent,
}) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col gap-2.5 overflow-hidden transition-transform duration-300 ease-out ${
        activePageIndex === 2
          ? 'translate-x-0 pointer-events-auto'
          : activePageIndex === 1
          ? 'translate-x-full pointer-events-none'
          : 'translate-x-[200%] pointer-events-none'
      }`}
    >
      <MobileMoodEventsBoard
        positiveEvents={positiveEvents}
        negativeEvents={negativeEvents}
        periodLabel="questo mese"
        onAddMoodEvent={onAddMoodEvent}
        onUpdateMoodEvent={onUpdateMoodEvent}
        onDeleteMoodEvent={onDeleteMoodEvent}
      />
    </div>
  );
};

export default MobileMonthMoodSlide;
