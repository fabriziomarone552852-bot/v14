// frontend/src/components/weekmonth/review/ReadOnlyTrackerChart.tsx
// Grafico polare per il modale di review, con supporto opzionale alla modifica (onUpdateValue).
import React from 'react';
import type { TrackerItem } from '@/types/monthlyentries';

const polarToCartesian = (cx: number, cy: number, r: number, angleDegrees: number) => {
  const angleRadians = (angleDegrees - 90) * Math.PI / 180.0;
  return { x: cx + r * Math.cos(angleRadians), y: cy + r * Math.sin(angleRadians) };
};

const describeWedge = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', x, y, 'L', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' ');
};

const describeTextArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
  let midAngle = (startAngle + endAngle) / 2;
  midAngle = ((midAngle % 360) + 360) % 360;
  const isBottom = midAngle > 90 && midAngle < 270;
  if (isBottom) {
    const s = polarToCartesian(x, y, radius, endAngle);
    const e = polarToCartesian(x, y, radius, startAngle);
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 0 0 ${e.x} ${e.y}`;
  }
  const s = polarToCartesian(x, y, radius, startAngle);
  const e = polarToCartesian(x, y, radius, endAngle);
  return `M ${s.x} ${s.y} A ${radius} ${radius} 0 0 1 ${e.x} ${e.y}`;
};

interface ReadOnlyTrackerChartProps {
  title: string;
  items: TrackerItem[];
  uid: string;
  onUpdateValue?: (id: string, newValue: number) => void;
}

export const ReadOnlyTrackerChart: React.FC<ReadOnlyTrackerChartProps> = ({ title, items, uid, onUpdateValue }) => {
  const size = 320;
  const center = size / 2;
  const maxRadius = 95;
  const labelRadius = 120;
  const angleStep = 360 / items.length;
  const isInteractive = !!onUpdateValue;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center mt-1 shrink-0">
        {title}
      </h4>
      <div className="relative w-full flex-1 min-h-0">
        <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            {items.map((item, i) => {
              const d = describeTextArc(center, center, labelRadius, i * angleStep, (i + 1) * angleStep);
              return <path key={`def-${item.id}`} id={`ro-${uid}-${item.id}`} d={d} />;
            })}
          </defs>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lv => (
            <circle key={lv} cx={center} cy={center} r={(lv / 10) * maxRadius} fill="none" stroke="#f3f4f6" strokeWidth="1" />
          ))}

          {items.map((_, i) => {
            const { x, y } = polarToCartesian(center, center, maxRadius, i * angleStep);
            return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />;
          })}

          {items.map((item, i) => {
            if (item.currentValue === 0) return null;
            const d = describeWedge(center, center, (item.currentValue / 10) * maxRadius, i * angleStep, (i + 1) * angleStep);
            return <path key={`v-${item.id}`} d={d} fill={item.colorHex} fillOpacity={isInteractive ? "0.95" : "0.85"} stroke="#fff" strokeWidth="1.5" className="transition-all duration-300" />;
          })}

          {/* Hitboxes Interattive per la modifica */}
          {isInteractive && onUpdateValue && items.map((item, i) => {
            return [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((level) => {
              const d = describeWedge(center, center, (level / 10) * maxRadius, i * angleStep, (i + 1) * angleStep);
              return (
                <path
                  key={`hitbox-${item.id}-${level}`}
                  d={d}
                  fill="transparent"
                  className="cursor-pointer hover:fill-black/20 transition-colors outline-none"
                  onClick={() => onUpdateValue(item.id, level)}
                >
                  <title>{`${item.name}: ${level}/10`}</title>
                </path>
              );
            });
          })}

          {items.map(item => (
            <text key={`l-${item.id}`} fill={item.colorHex} className="text-[11px] font-black uppercase tracking-widest" style={{ textShadow: '1px 1px 2px white' }}>
              <textPath href={`#ro-${uid}-${item.id}`} startOffset="50%" textAnchor="middle">{item.name}</textPath>
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
