import React from 'react';

const MESI_BREVI = ['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'];
const GIORNI = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];

const MonthBarChart: React.FC<{ data: Record<number, number>; currentMonth: number | null }> = ({ data, currentMonth }) => {
  const values = Array.from({ length: 12 }, (_, i) => data[i + 1] ?? 0);
  const maxVal = Math.max(...values, 1);
  const hasData = values.some(v => v > 0);

  const svgWidth = 420;
  const svgHeight = 180;
  const padding = { top: 20, right: 12, bottom: 28, left: 12 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barWidth = chartWidth / 12;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {values.map((val, i) => {
        const barH = (val / maxVal) * chartHeight;
        const x = padding.left + i * barWidth + barWidth * 0.15;
        const y = padding.top + chartHeight - barH;
        const w = barWidth * 0.7;
        const isCurrentMo = currentMonth !== null && i === currentMonth;

        return (
          <g key={i}>
            {/* Traccia di sfondo sottile (Histogram skeleton track) per una resa sempre armoniosa */}
            <rect
              x={x}
              y={padding.top}
              width={w}
              height={chartHeight}
              rx={4}
              fill="#f1f5f9"
            />

            {/* Barra valore attivo */}
            {barH > 0 && (
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                rx={4}
                fill={isCurrentMo ? '#1d4ed8' : '#3b82f6'}
                className="transition-all duration-500 ease-out"
              />
            )}

            {/* Etichetta valore sopra la barra */}
            {val > 0 && (
              <text x={x + w / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#1e293b" fontWeight="700">{val}</text>
            )}

            {/* Etichetta Mese */}
            <text x={x + w / 2} y={svgHeight - 6} textAnchor="middle" fontSize={8} fill="#64748b" fontWeight="600">{MESI_BREVI[i]}</text>
          </g>
        );
      })}

      {!hasData && (
        <text x={svgWidth / 2} y={padding.top + chartHeight / 2} textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight="600" fontStyle="italic">
          Nessuna task registrata nei mesi
        </text>
      )}
    </svg>
  );
};

const WeekdayBarChart: React.FC<{ data: Record<number, number> }> = ({ data }) => {
  const values = Array.from({ length: 7 }, (_, i) => data[i] ?? 0);
  const maxVal = Math.max(...values, 1);
  const maxIndex = values.indexOf(maxVal);
  const hasData = values.some(v => v > 0);

  const svgWidth = 320;
  const svgHeight = 180;
  const padding = { top: 20, right: 12, bottom: 28, left: 12 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barWidth = chartWidth / 7;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {values.map((val, i) => {
        const barH = (val / maxVal) * chartHeight;
        const x = padding.left + i * barWidth + barWidth * 0.18;
        const y = padding.top + chartHeight - barH;
        const w = barWidth * 0.64;
        const isTop = i === maxIndex && val > 0;

        return (
          <g key={i}>
            {/* Traccia di sfondo sottile per mantenere il grafico pieno e strutturato */}
            <rect
              x={x}
              y={padding.top}
              width={w}
              height={chartHeight}
              rx={4}
              fill="#f1f5f9"
            />

            {/* Barra valore attivo */}
            {barH > 0 && (
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                rx={4}
                fill={isTop ? '#4f46e5' : '#818cf8'}
                className="transition-all duration-500 ease-out"
              />
            )}

            {/* Etichetta valore sopra la barra */}
            {val > 0 && (
              <text x={x + w / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#1e293b" fontWeight="700">{val}</text>
            )}

            {/* Etichetta Giorno */}
            <text x={x + w / 2} y={svgHeight - 6} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight="600">{GIORNI[i]}</text>
          </g>
        );
      })}

      {!hasData && (
        <text x={svgWidth / 2} y={padding.top + chartHeight / 2} textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight="600" fontStyle="italic">
          Nessuna task nei giorni
        </text>
      )}
    </svg>
  );
};

export interface YearReviewTasksPanelProps {
  tasksCompleted: number;
  tasksTotal: number;
  tasksByMonth: Record<number, number>;
  tasksByWeekday: Record<number, number>;
}

export const YearReviewTasksPanel: React.FC<YearReviewTasksPanelProps> = ({
  tasksCompleted,
  tasksTotal,
  tasksByMonth,
  tasksByWeekday
}) => {
  const progress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Banner superiore ampio ed elegante */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 px-6 text-white shadow-md relative overflow-hidden shrink-0">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">
            Task Completate
          </span>
          <div className="text-4xl xl:text-5xl font-extrabold mb-2">
            {tasksCompleted} <span className="text-xl xl:text-2xl text-blue-200">/ {tasksTotal}</span>
          </div>
          <div className="w-full max-w-sm bg-blue-800/40 rounded-full h-3 mt-1 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-blue-200 mt-2 font-medium">
            {progress.toFixed(0)}% di completamento annuale
          </span>
        </div>
      </div>

      {/* Due colonne quadrate affiancate con tracce ed etichette perfettamente proporzionate */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col min-h-0 shadow-xs">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2 text-center shrink-0">
            Mese più Produttivo
          </h4>
          <div className="flex-1 min-h-0 flex items-center justify-center p-1">
            <MonthBarChart data={tasksByMonth} currentMonth={null} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col min-h-0 shadow-xs">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2 text-center shrink-0">
            Giorno più Produttivo
          </h4>
          <div className="flex-1 min-h-0 flex items-center justify-center p-1">
            <WeekdayBarChart data={tasksByWeekday} />
          </div>
        </div>
      </div>
    </div>
  );
};
