import React from 'react';

export interface TrackerHeaderProps {
  title: string;
  goalLabel: string;
  goalPercent: number;
  goalViewType: 'percent' | 'fraction';
  onToggleGoalViewType: () => void;
  currentCount: number;
  goalTotal: number;
  onOpenStats: () => void;
  onOpenRandom: () => void;
  statsButtonTitle?: string;
  randomButtonTooltip?: string;
}

export const TrackerHeader: React.FC<TrackerHeaderProps> = ({
  title,
  goalLabel,
  goalPercent,
  goalViewType,
  onToggleGoalViewType,
  currentCount,
  goalTotal,
  onOpenStats,
  onOpenRandom,
  statsButtonTitle = 'Vedi Statistiche',
  randomButtonTooltip = 'Non sai cosa guardare? Scegliamo noi per te!',
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center px-2 py-1 shrink-0 w-full gap-4 md:gap-0">
      {/* Colonna Sinistra (Larghezza Fissa e Rigida per azzerare lo shift) */}
      <div className="w-full md:w-56 xl:w-64 shrink-0 flex items-center justify-start">
        <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 uppercase tracking-tight select-none whitespace-nowrap">
          {title}
        </h1>
      </div>

      {/* Colonna Centrale (Card Obiettivo Perfettamente Centrata) */}
      <div className="w-full flex-1 max-w-xl mx-auto flex justify-center px-2">
        <div
          onClick={onToggleGoalViewType}
          className="flex flex-col w-full bg-white rounded-xl shadow-xs border border-gray-200 p-3.5 cursor-pointer hover:shadow-md transition-shadow select-none relative group"
        >
          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenStats();
              }}
              className="bg-blue-50 text-blue-600 p-1.5 rounded-lg hover:bg-blue-100 border border-blue-200 shadow-xs transition-colors cursor-pointer"
              title={statsButtonTitle}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>
          </div>

          <div className="flex justify-center items-center mb-1.5 gap-4">
            <span className="text-sm md:text-base font-extrabold text-gray-600 uppercase tracking-wider text-center">
              {goalLabel}
            </span>
            <span className="text-lg font-bold text-blue-600">
              {goalViewType === 'percent' ? `${goalPercent}%` : `${currentCount}/${goalTotal}`}
            </span>
          </div>

          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(goalPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Colonna Destra (Larghezza Fissa e Rigida uguale a sinistra con pulsante Random) */}
      <div className="w-full md:w-56 xl:w-64 shrink-0 flex items-center justify-end relative h-12">
        <button
          type="button"
          onClick={onOpenRandom}
          title={randomButtonTooltip}
          className="group h-12 px-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all z-30 cursor-pointer"
        >
          <span className="max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:mr-2 transition-all duration-500 ease-in-out font-bold text-xs overflow-hidden whitespace-nowrap text-left leading-tight">
            Non sai cosa guardare?
            <br />
            Scegliamo noi per te!
          </span>
          <svg className="w-6 h-6 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
