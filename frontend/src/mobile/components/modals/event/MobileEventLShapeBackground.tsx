// src/mobile/components/modals/event/MobileEventLShapeBackground.tsx
import React, { useState, useLayoutEffect } from 'react';

export interface MobileEventLShapeBackgroundProps {
  isRecurrent: boolean;
  isModalOpen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const MobileEventLShapeBackground: React.FC<MobileEventLShapeBackgroundProps> = ({
  isRecurrent,
  isModalOpen,
  containerRef,
}) => {
  const [lShapeMetrics, setLShapeMetrics] = useState({ width: 340, height: 104, midX: 176 });

  useLayoutEffect(() => {
    if (!isRecurrent || !containerRef.current) return;

    const updateMetrics = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        // In un grid a 2 colonne con gap-3 (12px): la colonna 2 inizia a (width + 12) / 2
        const midX = (width + 12) / 2;
        setLShapeMetrics({ width, height, midX });
      }
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [isRecurrent, isModalOpen, containerRef]);

  if (!isRecurrent || lShapeMetrics.width <= 0) return null;

  const { width: W, height: H, midX } = lShapeMetrics;
  const R = 12; // raggio di curvatura angoli
  const Y = 54; // h1 (46px) + gap (8px)

  const lPathD =
    W > 0 && H > 0
      ? `
    M ${midX + R} 0.5
    H ${W - R}
    A ${R} ${R} 0 0 1 ${W - 0.5} ${R}
    V ${H - R}
    A ${R} ${R} 0 0 1 ${W - R} ${H - 0.5}
    H ${R}
    A ${R} ${R} 0 0 1 0.5 ${H - R}
    V ${Y + R}
    A ${R} ${R} 0 0 1 ${R} ${Y + 0.5}
    H ${midX}
    V ${R}
    A ${R} ${R} 0 0 1 ${midX + R} 0.5
    Z
  `
      : '';

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
      viewBox={`0 0 ${W} ${H}`}
    >
      <path
        d={lPathD}
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
};
