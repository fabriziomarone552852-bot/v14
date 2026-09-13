// frontend/src/components/weekmonth/TrackerPanel.tsx
import React from 'react';
import { PolarAreaChart } from './tracker/PolarAreaChart';

// 1. IL CONTRATTO DEI DATI (Zero 'any')
export interface TrackerItem {
  id: string;
  name: string;
  colorHex: string;
  currentValue: number;
  previousValue: number;
}

export interface TrackerPanelProps {
  titleTop: string;
  titleBottom?: string;
  showBottom?: boolean;
  items: TrackerItem[];
  onUpdateValue?: (id: string, newValue: number) => void;
}

// --- COMPONENTE PRINCIPALE ESPORTATO ---
export const TrackerPanel: React.FC<TrackerPanelProps> = ({
  titleTop,
  titleBottom,
  showBottom = true,
  items,
  onUpdateValue,
}) => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden p-2">
      {/* SEZIONE SUPERIORE */}
      <div className="flex-1 min-h-0 flex flex-col items-center relative">
        <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-2 shrink-0 z-10">
          {titleTop}
        </h4>
        {/* LA GABBIA DI CONTENIMENTO: Questo div assicura che l'SVG non esca dai bordi */}
        <div className="relative w-full flex-1 min-h-0">
          <PolarAreaChart
            items={items}
            valueKey="currentValue"
            onUpdateValue={onUpdateValue}
          />
        </div>
      </div>

      {showBottom && titleBottom && (
        <>
          <div className="w-8/12 mx-auto h-px bg-gray-200 shrink-0 my-2" />

          {/* SEZIONE INFERIORE */}
          <div className="flex-1 min-h-0 flex flex-col items-center relative">
            <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1 shrink-0 z-10">
              {titleBottom}
            </h4>
            {/* LA GABBIA DI CONTENIMENTO */}
            <div className="relative w-full flex-1 min-h-0">
              <PolarAreaChart items={items} valueKey="previousValue" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};