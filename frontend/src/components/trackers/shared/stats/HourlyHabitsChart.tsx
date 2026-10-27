import React from 'react';

export interface HourlyHabitsChartProps {
  byHour: Record<string, number>;
  title?: string;
  subtitle?: string;
  barColorClass?: string;
  barHoverColorClass?: string;
  className?: string;
}

export const HourlyHabitsChart: React.FC<HourlyHabitsChartProps> = ({
  byHour = {},
  title = 'Fasce Orarie',
  subtitle = 'Momenti della giornata preferiti',
  barColorClass = 'bg-indigo-500',
  barHoverColorClass = 'group-hover:bg-indigo-600',
  className = '',
}) => {
  const maxHourCount = Math.max(...Object.values(byHour), 1);

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full ${className}`}
    >
      <div className="mb-4 border-b border-slate-100 pb-2 shrink-0">
        <h3 className="text-base font-extrabold text-slate-800">{title}</h3>
        {subtitle && (
          <span className="text-xs text-slate-400 font-semibold">{subtitle}</span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex items-end justify-center gap-1 pt-4 overflow-x-auto custom-scrollbar">
        {Array.from({ length: 24 }).map((_, hour) => {
          const hourKey = String(hour).padStart(2, '0');
          const count = byHour[hourKey] || 0;
          const pct = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;
          return (
            <div
              key={hour}
              className="flex flex-col items-center gap-1 flex-1 min-w-[14px] group h-full justify-end"
            >
              <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {count}
              </span>
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${barColorClass} ${barHoverColorClass}`}
                style={{ height: `${Math.max(4, pct)}%` }}
              />
              <span className="text-[9px] font-semibold text-slate-500">{hour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyHabitsChart;
