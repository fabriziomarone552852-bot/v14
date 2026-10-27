import React from 'react';

export interface PlatformDistributionItem {
  platform: string;
  percentage: number;
}

export interface PlatformDistributionListProps {
  distribution: PlatformDistributionItem[];
  title?: string;
  subtitle?: string;
  barColorClass?: string;
  emptyMessage?: string;
  className?: string;
}

export const PlatformDistributionList: React.FC<PlatformDistributionListProps> = ({
  distribution = [],
  title = '📺 Dove Guardo i Film',
  subtitle = 'Piattaforme di visione',
  barColorClass = 'bg-blue-500',
  emptyMessage = 'Registra le tue visioni collegando la piattaforma streaming o il cinema per visualizzare la ripartizione.',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden ${className}`}
    >
      <h3 className="text-base font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center justify-between shrink-0">
        <span>{title}</span>
        {subtitle && (
          <span className="text-xs text-slate-400 font-semibold">{subtitle}</span>
        )}
      </h3>

      {distribution && distribution.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          {distribution.map((plat) => (
            <div key={plat.platform} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="truncate pr-2">{plat.platform}</span>
                <span className="text-blue-600 font-black shrink-0">
                  {plat.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`${barColorClass} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, plat.percentage))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
          <span className="text-3xl mb-2">🎬</span>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default PlatformDistributionList;
