// src/mobile/components/modals/review/events/MonthReviewEventsExpandedModal.tsx
import React from 'react';
import { CloseIcon } from '@/components/shared/utils/Icons';
import type { ReviewEventItem } from './MonthReviewEventsBox';

export interface MonthReviewEventsExpandedModalProps {
  type: 'positive' | 'negative';
  items: ReviewEventItem[];
  onClose: () => void;
}

export const MonthReviewEventsExpandedModal: React.FC<MonthReviewEventsExpandedModalProps> = ({
  type,
  items,
  onClose,
}) => {
  const isPositive = type === 'positive';
  const theme = isPositive
    ? {
        border: 'border-green-200',
        headerBg: 'bg-green-50/60',
        textColor: 'text-green-700',
        closeHover: 'hover:text-green-800 hover:bg-green-100',
        itemBg: 'bg-green-50 border-green-200 text-green-900',
        dateColor: 'text-green-600',
        icon: '❤',
        title: 'Tutte le Cose Positive',
      }
    : {
        border: 'border-red-200',
        headerBg: 'bg-red-50/60',
        textColor: 'text-red-700',
        closeHover: 'hover:text-red-800 hover:bg-red-100',
        itemBg: 'bg-red-50 border-red-200 text-red-900',
        dateColor: 'text-red-500',
        icon: '💔',
        title: 'Tutte le Cose Negative',
      };

  return (
    <div className={`absolute inset-0 z-50 bg-white flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border ${theme.border}`}>
      <div className={`flex items-center justify-between pb-2.5 border-b ${theme.border} shrink-0 ${theme.headerBg} -m-3 p-3 rounded-t-2xl mb-2`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{theme.icon}</span>
          <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textColor}`}>
            {theme.title} ({items.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`p-1 rounded-full text-gray-400 ${theme.closeHover} transition-colors cursor-pointer`}
          title="Chiudi visualizzazione estesa"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 p-1 pt-2">
        {items.map((ev, i) => (
          <div
            key={i}
            className={`relative text-xs sm:text-sm px-3 py-2.5 rounded-xl border ${theme.itemBg} break-words shadow-2xs`}
          >
            <span>{ev.text}</span>
            {ev.date && (
              <span className={`text-[10.5px] font-bold ${theme.dateColor} float-right ml-2 mt-0.5`}>
                {ev.date}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
