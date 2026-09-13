// src/mobile/components/modals/review/events/MonthReviewEventsBox.tsx
import React from 'react';

export interface ReviewEventItem {
  id: string;
  text: string;
  date?: string;
}

export interface MonthReviewEventsBoxProps {
  type: 'positive' | 'negative';
  items: ReviewEventItem[];
  visibleItems: ReviewEventItem[];
  hasMore: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onExpand: () => void;
}

export const MonthReviewEventsBox: React.FC<MonthReviewEventsBoxProps> = ({
  type,
  items,
  visibleItems,
  hasMore,
  containerRef,
  onExpand,
}) => {
  const isPositive = type === 'positive';
  const theme = isPositive
    ? {
        border: 'border-green-200',
        bg: 'bg-green-50/30',
        headerBg: 'bg-green-50/60',
        textColor: 'text-green-700',
        badgeBg: 'bg-green-100 text-green-800',
        itemBg: 'bg-green-50 border-green-200 text-green-900',
        dateColor: 'text-green-600',
        dotsColor: 'text-green-600',
        icon: '❤',
        title: 'Cose Positive',
        emptyMsg: 'Nessun evento positivo registrato',
      }
    : {
        border: 'border-red-200',
        bg: 'bg-red-50/30',
        headerBg: 'bg-red-50/60',
        textColor: 'text-red-700',
        badgeBg: 'bg-red-100 text-red-800',
        itemBg: 'bg-red-50 border-red-200 text-red-900',
        dateColor: 'text-red-500',
        dotsColor: 'text-red-600',
        icon: '💔',
        title: 'Cose Negative',
        emptyMsg: 'Nessun evento negativo registrato',
      };

  return (
    <div
      onClick={onExpand}
      className={`flex-1 min-h-0 flex flex-col ${theme.bg} rounded-2xl border ${theme.border} overflow-hidden shadow-2xs cursor-pointer active:scale-[0.99] transition-transform`}
      title={`Tocca per espandere tutte le ${theme.title.toLowerCase()}`}
    >
      <div
        className={`flex items-center justify-between px-3.5 py-2 border-b ${theme.border} ${theme.headerBg} shrink-0`}
      >
        <h4 className={`text-xs font-bold uppercase tracking-wider ${theme.textColor} flex items-center gap-1.5`}>
          <span>{theme.icon}</span> {theme.title}
        </h4>
        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg}`}>
          {items.length}
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden p-2.5"
      >
        <div className="flex flex-col gap-1.5 overflow-hidden">
          {visibleItems.map((ev, i) => (
            <div
              key={i}
              className={`relative text-xs px-3 py-2 rounded-xl border ${theme.itemBg} break-words shadow-2xs min-h-[36px]`}
            >
              <span>{ev.text}</span>
              {ev.date && (
                <span className={`text-[10px] font-bold ${theme.dateColor} float-right ml-2 mt-0.5`}>
                  {ev.date}
                </span>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-xs text-gray-400 italic py-4 text-center">
              {theme.emptyMsg}
            </p>
          )}
        </div>

        {hasMore && (
          <div className="shrink-0 h-6 flex items-center justify-center select-none pt-0.5">
            <span className={`text-lg font-black tracking-widest ${theme.dotsColor} leading-none`}>
              •••
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
