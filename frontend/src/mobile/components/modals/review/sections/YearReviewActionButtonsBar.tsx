// src/mobile/components/modals/review/sections/YearReviewActionButtonsBar.tsx
import React from 'react';
import { YearInPixelsIcon } from '@/components/year/review/YearInPixelsIcon';
import { PieChartIcon } from '../shared/PieChartIcon';

export interface YearReviewActionButtonsBarProps {
  onSelectRecap: (recap: 'tasks' | 'habits' | 'pixels' | 'charts') => void;
}

export const YearReviewActionButtonsBar: React.FC<YearReviewActionButtonsBarProps> = ({
  onSelectRecap,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2.5 p-2.5 bg-white border-t border-gray-200 shrink-0 pb-[max(env(safe-area-inset-bottom,0px),10px)]">
      <button
        type="button"
        onClick={() => onSelectRecap('tasks')}
        className="flex items-center justify-center h-11 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 active:scale-95 transition-all shadow-xs cursor-pointer"
        title="Statistiche Task"
        aria-label="Statistiche Task"
      >
        <span className="text-xl leading-none">📊</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectRecap('habits')}
        className="flex items-center justify-center h-11 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 active:scale-95 transition-all shadow-xs cursor-pointer"
        title="Statistiche Abitudini"
        aria-label="Statistiche Abitudini"
      >
        <span className="text-xl leading-none">🔄</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectRecap('pixels')}
        className="flex items-center justify-center h-11 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 active:scale-95 transition-all shadow-xs cursor-pointer"
        title="Anno in Pixel"
        aria-label="Anno in Pixel"
      >
        <YearInPixelsIcon className="w-5 h-5 text-emerald-600" />
      </button>

      <button
        type="button"
        onClick={() => onSelectRecap('charts')}
        className="flex items-center justify-center h-11 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-600 active:scale-95 transition-all shadow-xs cursor-pointer"
        title="Grafici Radar"
        aria-label="Grafici Radar"
      >
        <PieChartIcon className="w-5 h-5 text-purple-600" />
      </button>
    </div>
  );
};
