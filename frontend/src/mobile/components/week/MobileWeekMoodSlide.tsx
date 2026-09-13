// src/mobile/components/week/MobileWeekMoodSlide.tsx
import React from 'react';
import type { MoodEventType } from '@/types';
import type { MoodEvent } from '../MobileMoodEventCard';
import MobileMoodEventsBoard from '../MobileMoodEventsBoard';

interface MobileWeekMoodSlideProps {
  activePageIndex: 0 | 1;
  positiveEvents: MoodEvent[];
  negativeEvents: MoodEvent[];
  onAddMoodEvent: (tipo: MoodEventType, title: string) => Promise<unknown> | void;
  onUpdateMoodEvent: (id: number, newTitle: string) => Promise<unknown> | void;
  onDeleteMoodEvent: (id: number) => void;
}

export const MobileWeekMoodSlide: React.FC<MobileWeekMoodSlideProps> = ({
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
        activePageIndex === 1
          ? 'translate-x-0 pointer-events-auto'
          : 'translate-x-full pointer-events-none'
      }`}
    >
      <MobileMoodEventsBoard
        positiveEvents={positiveEvents}
        negativeEvents={negativeEvents}
        onAddMoodEvent={onAddMoodEvent}
        onUpdateMoodEvent={onUpdateMoodEvent}
        onDeleteMoodEvent={onDeleteMoodEvent}
      />
    </div>
  );
};

export default MobileWeekMoodSlide;
