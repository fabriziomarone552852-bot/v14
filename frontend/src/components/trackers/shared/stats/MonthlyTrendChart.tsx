import React, { useState } from 'react';
import { EditIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';

export interface MonthlyTrendDataPoint {
  period: string; // es. "Gen", "Feb", ...
  hours: number;
  count?: number;
  movies?: number;
  episodes?: number;
}

export interface MonthlyTrendChartProps {
  timeTrend?: Record<string, MonthlyTrendDataPoint[]>;
  currentYear?: string;
  goal?: number;
  currentCount?: number;
  onSaveGoal?: (newGoal: number) => void;
  mediaUnitLabel?: string;
  title?: string;
  className?: string;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  timeTrend = {},
  currentYear = new Date().getFullYear().toString(),
  goal = 50,
  currentCount = 0,
  onSaveGoal,
  mediaUnitLabel = 'film',
  title = 'Andamento Mensile',
  className = '',
}) => {
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [viewMode, setViewMode] = useState<'hours' | 'count'>('count');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInputValue, setGoalInputValue] = useState('');

  const yearData = timeTrend[selectedYear] || [];

  const handleEditGoal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGoalInputValue(goal.toString());
    setIsEditingGoal(true);
  };

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInputValue, 10);
    if (!isNaN(newGoal) && newGoal > 0 && onSaveGoal) {
      onSaveGoal(newGoal);
    }
    setIsEditingGoal(false);
  };

  const maxVal = Math.max(
    ...yearData.map((x) => {
      const c = x.count ?? x.movies ?? x.episodes ?? 0;
      return viewMode === 'hours' ? x.hours : c;
    }),
    1
  );

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden cursor-pointer hover:border-blue-300 transition-colors text-left ${className}`}
      onClick={() => setViewMode((m) => (m === 'hours' ? 'count' : 'hours'))}
      title="Clicca per alternare Ore/Conteggio"
    >
      {/* Header card: Titolo, Obiettivo annuale, Navigatore Anno */}
      <div className="flex flex-wrap justify-between items-center mb-3 border-b border-slate-100 pb-2 shrink-0 group/goal gap-2">
        <h3 className="text-sm font-extrabold text-slate-800 select-none">
          {title} {selectedYear}
        </h3>

        {/* Obiettivo Annuale */}
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            Obiettivo annuale: {currentCount}/
            {isEditingGoal ? (
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                className="w-16 px-1 py-0.5 border border-blue-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={goalInputValue}
                onChange={(e) => setGoalInputValue(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={handleSaveGoal}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveGoal();
                  } else if (e.key === 'Escape') {
                    setIsEditingGoal(false);
                  }
                }}
              />
            ) : (
              <span>{goal}</span>
            )}
          </span>
          {!isEditingGoal && onSaveGoal && (
            <button
              type="button"
              onClick={handleEditGoal}
              className="opacity-0 group-hover/goal:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity cursor-pointer"
              title="Modifica obiettivo annuale"
            >
              <EditIcon className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Pulsanti Cambio Anno */}
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedYear((y) => (parseInt(y, 10) - 1).toString())}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 shadow-2xs bg-white flex items-center justify-center cursor-pointer"
            title="Anno precedente"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear((y) => (parseInt(y, 10) + 1).toString())}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 shadow-2xs bg-white flex items-center justify-center cursor-pointer"
            title="Anno successivo"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Barre dei 12 Mesi */}
      <div className="flex-1 min-h-0 flex items-end justify-between gap-1 pt-3">
        {yearData.length > 0 ? (
          yearData.map((t) => {
            const countVal = t.count ?? t.movies ?? t.episodes ?? 0;
            const val = viewMode === 'hours' ? t.hours : countVal;
            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
            return (
              <div
                key={t.period}
                className="flex flex-col items-center gap-1 w-full group h-full justify-end relative"
              >
                <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 pointer-events-none whitespace-nowrap">
                  {val}
                  {viewMode === 'hours' ? 'h' : ` ${mediaUnitLabel}`}
                </span>
                <div
                  className="w-full max-w-[32px] bg-blue-500 rounded-t-sm transition-all duration-300 group-hover:bg-blue-600"
                  style={{ height: `${Math.max(2, pct)}%` }}
                />
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 truncate w-full text-center">
                  {t.period}
                </span>
              </div>
            );
          })
        ) : (
          <div className="w-full flex justify-center pb-4">
            <EmptyState
              message="Nessun dato per questo anno."
              icon={<span className="not-italic text-xl">📅</span>}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
