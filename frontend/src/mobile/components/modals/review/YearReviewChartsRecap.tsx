// src/mobile/components/modals/review/YearReviewChartsRecap.tsx
import React from 'react';
import { TrackerPanel } from '@/components/weekmonth/TrackerPanel';
import type { TrackerItem } from '@/types/monthlyentries';

interface YearReviewChartsRecapProps {
  safeMoods: TrackerItem[];
  safeSpheres: TrackerItem[];
  onUpdateMood?: (id: string, value: number) => void;
  onUpdateSphere?: (id: string, value: number) => void;
}

export const YearReviewChartsRecap: React.FC<YearReviewChartsRecapProps> = ({
  safeMoods,
  safeSpheres,
  onUpdateMood,
  onUpdateSphere,
}) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 pb-[max(env(safe-area-inset-bottom,0px),20px)] space-y-4 flex flex-col items-center justify-start">
      <div className="w-full max-w-md h-[340px] bg-white rounded-2xl border border-gray-200 shadow-xs p-3 flex flex-col items-center justify-center shrink-0">
        <TrackerPanel
          titleTop="Come mi sento"
          showBottom={false}
          items={safeMoods}
          onUpdateValue={(id, val) => onUpdateMood?.(id, val)}
        />
      </div>

      <div className="w-full max-w-md h-[340px] bg-white rounded-2xl border border-gray-200 shadow-xs p-3 flex flex-col items-center justify-center shrink-0">
        <TrackerPanel
          titleTop="Sfere di Influenza"
          showBottom={false}
          items={safeSpheres}
          onUpdateValue={(id, val) => onUpdateSphere?.(id, val)}
        />
      </div>
    </div>
  );
};
