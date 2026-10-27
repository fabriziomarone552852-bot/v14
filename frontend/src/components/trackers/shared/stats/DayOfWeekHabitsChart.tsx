import React from 'react';

export interface DayOfWeekHabitsChartProps {
  byDay: Record<string, number>;
  title?: string;
  subtitle?: string;
  barColorClass?: string;
  barHoverColorClass?: string;
  className?: string;
}

export const DayOfWeekHabitsChart: React.FC<DayOfWeekHabitsChartProps> = ({
  byDay = {},
  title = 'Giorni Preferiti',
  subtitle = 'Opere guardate per giorno della settimana',
  barColorClass = 'bg-blue-500',
  barHoverColorClass = 'group-hover:bg-blue-600',
  className = '',
}) => {
  const daysLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const maxDayCount = Math.max(...Object.values(byDay), 1);

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

      <div className="flex-1 min-h-0 flex items-end justify-center gap-2 sm:gap-3 pt-4">
        {daysLabels.map((day) => {
          const count = byDay[day] || 0;
          const pct = maxDayCount > 0 ? (count / maxDayCount) * 100 : 0;
          return (
            <div
              key={day}
              className="flex flex-col items-center gap-1.5 flex-1 group h-full justify-end max-w-[48px]"
            >
              <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {count}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${barColorClass} ${barHoverColorClass}`}
                style={{ height: `${Math.max(6, pct)}%` }}
              />
              <span className="text-xs font-bold text-slate-700">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayOfWeekHabitsChart;
