import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';

export interface ExplorationVsNostalgiaCardProps {
  title?: string;
  firstWatchHours?: number;
  rewatchHours?: number;
  emptyMessage?: string;
  className?: string;
}

export const ExplorationVsNostalgiaCard: React.FC<ExplorationVsNostalgiaCardProps> = ({
  title = 'Esplorazione vs Nostalgia',
  firstWatchHours = 0,
  rewatchHours = 0,
  emptyMessage = 'Non hai ancora registrato tempo.',
  className = '',
}) => {
  const total = firstWatchHours + rewatchHours;
  const explorationPercent = total > 0 ? (firstWatchHours / total) * 100 : 0;

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-center items-center overflow-hidden ${className}`}
    >
      <div className="border-b border-slate-100 pb-2 mb-6 w-full text-left shrink-0">
        <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[200px]">
        {total > 0 ? (
          <div
            className="w-48 h-48 rounded-full relative shadow-inner overflow-hidden mb-6"
            style={{
              background: `conic-gradient(#3b82f6 ${explorationPercent}%, #a855f7 0)`,
            }}
          >
            <div className="absolute inset-4 bg-white rounded-full shadow-sm flex items-center justify-center">
              <span className="text-3xl">🧭</span>
            </div>
          </div>
        ) : (
          <EmptyState message={emptyMessage} />
        )}

        <div className="w-full space-y-3 shrink-0">
          <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-bold text-slate-700">Esplorazione</span>
            </div>
            <span className="font-black text-blue-600">{firstWatchHours}h</span>
          </div>
          <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm font-bold text-slate-700">Nostalgia</span>
            </div>
            <span className="font-black text-purple-600">{rewatchHours}h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
