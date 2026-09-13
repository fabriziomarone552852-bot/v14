// src/mobile/components/month/MobileMonthTrackersSlide.tsx
import React from 'react';
import { TrackerPanel, type TrackerItem } from '@/components/weekmonth/TrackerPanel';

interface MobileMonthTrackersSlideProps {
  activePageIndex: 0 | 1 | 2;
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  onUpdateMood: (id: string, val: number) => void;
  onUpdateSphere: (id: string, val: number) => void;
}

export const MobileMonthTrackersSlide: React.FC<MobileMonthTrackersSlideProps> = ({
  activePageIndex,
  moodsUI,
  spheresUI,
  onUpdateMood,
  onUpdateSphere,
}) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
        activePageIndex === 0
          ? 'translate-x-0 pointer-events-auto'
          : activePageIndex === 1
          ? '-translate-x-full pointer-events-none'
          : '-translate-x-[200%] pointer-events-none'
      }`}
    >
      {/* Card 1: Grafico Umore (Come mi sento) */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 overflow-hidden flex flex-col items-center">
        <TrackerPanel
          titleTop="Come mi sento"
          showBottom={false}
          items={moodsUI}
          onUpdateValue={onUpdateMood}
        />
      </div>

      {/* Card 2: Grafico Sfere di Influenza */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 overflow-hidden flex flex-col items-center">
        <TrackerPanel
          titleTop="Sfere di Influenza"
          showBottom={false}
          items={spheresUI}
          onUpdateValue={onUpdateSphere}
        />
      </div>
    </div>
  );
};

export default MobileMonthTrackersSlide;
