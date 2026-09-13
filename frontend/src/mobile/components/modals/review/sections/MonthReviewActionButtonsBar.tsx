// src/mobile/components/modals/review/sections/MonthReviewActionButtonsBar.tsx
import React from 'react';
import { PieChartIcon } from '../shared/PieChartIcon';

export interface MonthReviewActionButtonsBarProps {
  onSelectRecap: (recap: 'events' | 'tasks' | 'habits' | 'charts') => void;
}

export const MonthReviewActionButtonsBar: React.FC<MonthReviewActionButtonsBarProps> = ({
  onSelectRecap,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2.5 p-2.5 bg-white border-t border-gray-200 shrink-0 pb-[max(env(safe-area-inset-bottom,0px),10px)]">
      <button
        type="button"
        onClick={() => onSelectRecap('events')}
        className="flex items-center justify-center h-11 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 active:scale-95 transition-all shadow-xs cursor-pointer"
        title="Cose Positive e Negative"
        aria-label="Cose Positive e Negative"
      >
        <span className="text-xl leading-none">❤️</span>
      </button>

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
