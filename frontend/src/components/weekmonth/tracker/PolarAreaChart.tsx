// frontend/src/components/weekmonth/tracker/PolarAreaChart.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { TrackerItem } from '../TrackerPanel';
import {
  polarToCartesian,
  describeAnnularWedge,
  describeTextArc,
} from './trackerSvgUtils';

export interface FeedbackState {
  id: string;
  name: string;
  colorHex: string;
  value: number;
}

export interface PolarAreaChartProps {
  items: TrackerItem[];
  valueKey: 'currentValue' | 'previousValue';
  onUpdateValue?: (id: string, newValue: number) => void;
}

export const PolarAreaChart: React.FC<PolarAreaChartProps> = ({
  items,
  valueKey,
  onUpdateValue,
}) => {
  const size = 320;
  const center = size / 2;
  const minRadius = 13; // Piccolo stacco dal centro per non coprire il livello 1
  const maxRadius = 95;
  const labelRadius = 120;
  const angleStep = items.length > 0 ? 360 / items.length : 360;
  const isInteractive = !!onUpdateValue;

  const isDraggingRef = useRef(false);
  const lockedItemIdRef = useRef<string | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<FeedbackState | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const triggerFeedback = (item: TrackerItem, value: number) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    const state: FeedbackState = {
      id: item.id,
      name: item.name,
      colorHex: item.colorHex,
      value,
    };
    setActiveFeedback(state);

    hideTimerRef.current = setTimeout(() => {
      setActiveFeedback(null);
    }, 3000);
  };

  // Calcola il livello (0..10): se si trascina verso il centro / sotto 1 -> imposta a 0
  const calculateLevel = (distance: number): number => {
    if (distance < minRadius + 4) {
      return 0; // Sotto 1 / vicino al centro -> reset a 0
    }
    const rawFraction = (distance - minRadius) / (maxRadius - minRadius);
    const rawLevel = Math.ceil(rawFraction * 10);
    return Math.max(1, Math.min(10, rawLevel));
  };

  const getSvgCoordinates = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * size;
    const y = ((e.clientY - rect.top) / rect.height) * size;
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { dx, dy, distance };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isInteractive || !onUpdateValue || items.length === 0) return;
    const { dx, dy, distance } = getSvgCoordinates(e);

    // Se il tocco iniziale è troppo lontano dal grafico, ignora
    if (distance > labelRadius + 30) return;

    // Calcolo angolo in senso orario per identificare lo spicchio iniziale selezionato
    let angle = (Math.atan2(dy, dx) * 180 / Math.PI + 90) % 360;
    if (angle < 0) angle += 360;

    const sliceIndex = Math.min(items.length - 1, Math.max(0, Math.floor(angle / angleStep)));
    const item = items[sliceIndex];
    if (!item) return;

    // Blocca l'elemento toccato per l'intera durata del drag
    lockedItemIdRef.current = item.id;
    isDraggingRef.current = true;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignora se non supportato
    }

    const level = calculateLevel(distance);
    onUpdateValue(item.id, level);
    triggerFeedback(item, level);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isInteractive || !onUpdateValue || !isDraggingRef.current || !lockedItemIdRef.current) return;
    
    // Recupera lo spicchio bloccato all'inizio: anche se il dito scorre altrove, modifica SOLO questo
    const item = items.find((it) => it.id === lockedItemIdRef.current);
    if (!item) return;

    const { distance } = getSvgCoordinates(e);
    const level = calculateLevel(distance);

    onUpdateValue(item.id, level);
    triggerFeedback(item, level);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isInteractive) return;
    isDraggingRef.current = false;
    lockedItemIdRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignora
    }
  };

  return (
    <div className="relative w-full h-full select-none">
      {/* SVG del Grafico Polare con spicchi ad anello & supporto Gesture Drag */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full overflow-visible ${
          isInteractive ? 'cursor-pointer touch-none' : ''
        }`}
      >
        <defs>
          {items.map((item: TrackerItem, i: number) => {
            const pathData = describeTextArc(center, center, labelRadius, i * angleStep, (i + 1) * angleStep);
            return <path key={`def-${item.id}`} id={`text-path-${valueKey}-${item.id}`} d={pathData} />;
          })}
        </defs>

        {/* 1. Ragnatela concentrica: livelli da 1 a 10 (senza livello 0) */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level: number) => {
          const r = minRadius + (level / 10) * (maxRadius - minRadius);
          return (
            <circle
              key={`circle-${level}`}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          );
        })}

        {/* 2. Linee divisorie spicchi */}
        {items.map((_: TrackerItem, i: number) => {
          const startPt = polarToCartesian(center, center, minRadius, i * angleStep);
          const endPt = polarToCartesian(center, center, maxRadius, i * angleStep);
          return (
            <line
              key={`line-${i}`}
              x1={startPt.x}
              y1={startPt.y}
              x2={endPt.x}
              y2={endPt.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* 3. Riempimento dei Valori Reali con spicchi ad anello */}
        {items.map((item: TrackerItem, i: number) => {
          const val = item[valueKey];
          if (val === 0) return null;

          const outerR = minRadius + (val / 10) * (maxRadius - minRadius);
          const pathData = describeAnnularWedge(center, center, minRadius, outerR, i * angleStep, (i + 1) * angleStep);
          const isSelected = activeFeedback?.id === item.id;
          return (
            <path
              key={`value-${item.id}`}
              d={pathData}
              fill={item.colorHex}
              fillOpacity={isInteractive ? (isSelected ? '1' : '0.9') : '0.35'}
              stroke="#ffffff"
              strokeWidth={isSelected ? '2' : '1.5'}
              className="transition-all duration-300 ease-out"
            />
          );
        })}

        {/* 4. Centro del Grafico (Compare SOLO quando attivo) */}
        {activeFeedback && isInteractive && (
          <g key="tracker-center-feedback" className="animate-popIn">
            <circle
              cx={center}
              cy={center}
              r={11}
              fill={activeFeedback.colorHex}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="shadow-sm transition-colors duration-150"
            />
            <text
              x={center}
              y={center + 3.5}
              textAnchor="middle"
              fill="#ffffff"
              className="text-[10px] font-black pointer-events-none select-none"
            >
              {activeFeedback.value}
            </text>
          </g>
        )}

        {/* 5. Etichette Nomi */}
        {items.map((item: TrackerItem) => {
          const isSelected = activeFeedback?.id === item.id;
          return (
            <text
              key={`label-${item.id}`}
              fill={item.colorHex}
              className={`text-[12px] font-black uppercase tracking-widest transition-all ${
                isSelected ? 'scale-105 font-extrabold' : ''
              }`}
              style={{ textShadow: '1px 1px 2px white' }}
            >
              <textPath href={`#text-path-${valueKey}-${item.id}`} startOffset="50%" textAnchor="middle">
                {item.name}
              </textPath>
            </text>
          );
        })}
      </svg>
    </div>
  );
};
