// src/mobile/components/modals/review/shared/WeekdayBarChartMobile.tsx
import React from 'react';
import { GIORNI_SETT } from '../yearReview.utils';

export interface WeekdayBarChartMobileProps {
  data: Record<number, number>;
}

/** Grafico a barre Giorni Settimana a tutta larghezza per Mobile */
export const WeekdayBarChartMobile: React.FC<WeekdayBarChartMobileProps> = ({ data }) => {
  const values = Array.from({ length: 7 }, (_, i) => data[i] ?? 0);
  const maxVal = Math.max(...values, 1);
  const maxIndex = values.indexOf(maxVal);
  const hasData = values.some((v) => v > 0);

  const svgWidth = 320;
  const svgHeight = 160;
  const padding = { top: 18, right: 10, bottom: 24, left: 10 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barWidth = chartWidth / 7;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-full max-h-[190px]"
      preserveAspectRatio="xMidYMid meet"
    >
      {values.map((val, i) => {
        const barH = (val / maxVal) * chartHeight;
        const x = padding.left + i * barWidth + barWidth * 0.18;
        const y = padding.top + chartHeight - barH;
        const w = barWidth * 0.64;
        const isTop = i === maxIndex && val > 0;

        return (
          <g key={i}>
            <rect
              x={x}
              y={padding.top}
              width={w}
              height={chartHeight}
              rx={3}
              fill="#f1f5f9"
            />
            {barH > 0 && (
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                rx={3}
                fill={isTop ? '#4f46e5' : '#818cf8'}
                className="transition-all duration-500 ease-out"
              />
            )}
            {val > 0 && (
              <text
                x={x + w / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize={8.5}
                fill="#1e293b"
                fontWeight="700"
              >
                {val}
              </text>
            )}
            <text
              x={x + w / 2}
              y={svgHeight - 6}
              textAnchor="middle"
              fontSize={9}
              fill="#64748b"
              fontWeight="600"
            >
              {GIORNI_SETT[i]}
            </text>
          </g>
        );
      })}

      {!hasData && (
        <text
          x={svgWidth / 2}
          y={padding.top + chartHeight / 2}
          textAnchor="middle"
          fontSize={11}
          fill="#94a3b8"
          fontWeight="600"
          fontStyle="italic"
        >
          Nessuna task completata nei giorni
        </text>
      )}
    </svg>
  );
};
