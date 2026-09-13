// src/mobile/components/modals/review/MonthReviewEventsRecap.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MonthReviewEventsBox,
  MonthReviewEventsExpandedModal,
  type ReviewEventItem,
} from './events';

export type { ReviewEventItem };

export interface MonthReviewEventsRecapProps {
  allPositive: ReviewEventItem[];
  allNegative: ReviewEventItem[];
}

export const MonthReviewEventsRecap: React.FC<MonthReviewEventsRecapProps> = ({
  allPositive,
  allNegative,
}) => {
  const [expandedEventCategory, setExpandedEventCategory] = useState<'none' | 'positive' | 'negative'>('none');
  const positiveContainerRef = useRef<HTMLDivElement>(null);
  const negativeContainerRef = useRef<HTMLDivElement>(null);
  const [positiveContainerHeight, setPositiveContainerHeight] = useState(0);
  const [negativeContainerHeight, setNegativeContainerHeight] = useState(0);

  useEffect(() => {
    const updateHeights = () => {
      if (positiveContainerRef.current) {
        setPositiveContainerHeight(positiveContainerRef.current.clientHeight);
      }
      if (negativeContainerRef.current) {
        setNegativeContainerHeight(negativeContainerRef.current.clientHeight);
      }
    };

    updateHeights();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === positiveContainerRef.current) {
          setPositiveContainerHeight(entry.contentRect.height);
        } else if (entry.target === negativeContainerRef.current) {
          setNegativeContainerHeight(entry.contentRect.height);
        }
      }
    });

    if (positiveContainerRef.current) observer.observe(positiveContainerRef.current);
    if (negativeContainerRef.current) observer.observe(negativeContainerRef.current);

    return () => observer.disconnect();
  }, []);

  const ITEM_HEIGHT = 44;
  const INDICATOR_HEIGHT = 28;

  const maxPositiveFit = useMemo(() => {
    if (positiveContainerHeight <= 0) return 2;
    if (allPositive.length * ITEM_HEIGHT <= positiveContainerHeight) {
      return allPositive.length;
    }
    const available = positiveContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(available / ITEM_HEIGHT));
  }, [positiveContainerHeight, allPositive.length]);

  const visiblePositive = useMemo(() => {
    return allPositive.slice(0, maxPositiveFit);
  }, [allPositive, maxPositiveFit]);

  const hasMorePositive = allPositive.length > maxPositiveFit;

  const maxNegativeFit = useMemo(() => {
    if (negativeContainerHeight <= 0) return 2;
    if (allNegative.length * ITEM_HEIGHT <= negativeContainerHeight) {
      return allNegative.length;
    }
    const available = negativeContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(available / ITEM_HEIGHT));
  }, [negativeContainerHeight, allNegative.length]);

  const visibleNegative = useMemo(() => {
    return allNegative.slice(0, maxNegativeFit);
  }, [allNegative, maxNegativeFit]);

  const hasMoreNegative = allNegative.length > maxNegativeFit;

  return (
    <div className="relative flex-1 min-h-0 flex flex-col gap-3 p-3 pb-[max(env(safe-area-inset-bottom,0px),20px)] overflow-hidden select-none">
      <MonthReviewEventsBox
        type="positive"
        items={allPositive}
        visibleItems={visiblePositive}
        hasMore={hasMorePositive}
        containerRef={positiveContainerRef}
        onExpand={() => setExpandedEventCategory('positive')}
      />

      <MonthReviewEventsBox
        type="negative"
        items={allNegative}
        visibleItems={visibleNegative}
        hasMore={hasMoreNegative}
        containerRef={negativeContainerRef}
        onExpand={() => setExpandedEventCategory('negative')}
      />

      {expandedEventCategory === 'positive' && (
        <MonthReviewEventsExpandedModal
          type="positive"
          items={allPositive}
          onClose={() => setExpandedEventCategory('none')}
        />
      )}

      {expandedEventCategory === 'negative' && (
        <MonthReviewEventsExpandedModal
          type="negative"
          items={allNegative}
          onClose={() => setExpandedEventCategory('none')}
        />
      )}
    </div>
  );
};
