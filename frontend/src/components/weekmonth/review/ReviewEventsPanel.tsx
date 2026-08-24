// frontend/src/components/weekmonth/review/ReviewEventsPanel.tsx
import React from 'react';
import type { DbMonthlyEntry } from '@/types/monthlyentries';
import type { DailyEntry } from '@/types/dailyentries';

interface ReviewEventsPanelProps {
  monthlyPositive: DbMonthlyEntry[];
  monthlyNegative: DbMonthlyEntry[];
  weeklyPositive: DailyEntry[];
  weeklyNegative: DailyEntry[];
}

/** Evento normalizzato con testo e data opzionale. */
interface NormalizedEvent {
  text: string;
  date?: string; // formato "dd/mm"
}

/** Formatta data_riferimento "YYYY-MM-DD" → "dd/mm" */
const formatShortDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return '';
};

const EventGrid: React.FC<{ items: NormalizedEvent[]; emptyText: string; colorClass: 'green' | 'red' }> = ({ items, emptyText, colorClass }) => {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 italic py-4 text-center">{emptyText}</p>;
  }

  const border = colorClass === 'green' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
  const dateCls = colorClass === 'green' ? 'text-green-500' : 'text-red-400';

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((ev, i) => (
        <div key={i} className={`relative text-sm px-3 py-2 rounded-lg border ${border} break-words min-h-[36px]`}>
          <span>{ev.text}</span>
          {ev.date && (
            <span className={`text-[10px] font-bold ${dateCls} float-right ml-2 mt-0.5`}>
              {ev.date}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export const ReviewEventsPanel: React.FC<ReviewEventsPanelProps> = ({
  monthlyPositive, monthlyNegative, weeklyPositive, weeklyNegative,
}) => {
  // Normalizza eventi: monthly non hanno data, weekly sì
  const allPositive: NormalizedEvent[] = [
    ...monthlyPositive
      .filter(e => e.monthly_field?.trim())
      .map(e => ({ text: e.monthly_field!.trim() })),
    ...weeklyPositive
      .filter(e => e.testo?.trim())
      .map(e => ({ text: e.testo!.trim(), date: formatShortDate(e.data_riferimento) })),
  ];
  const allNegative: NormalizedEvent[] = [
    ...monthlyNegative
      .filter(e => e.monthly_field?.trim())
      .map(e => ({ text: e.monthly_field!.trim() })),
    ...weeklyNegative
      .filter(e => e.testo?.trim())
      .map(e => ({ text: e.testo!.trim(), date: formatShortDate(e.data_riferimento) })),
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Sezione positivi — fissa al 50% con scrollbar interna */}
      <div className="flex-1 min-h-0 flex flex-col bg-green-50/30 rounded-xl border border-green-100 overflow-hidden">
        <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 px-4 py-2.5 border-b border-green-100 bg-green-50/50 shrink-0">
          ❤ Cose Positive
        </h4>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3">
          <EventGrid items={allPositive} emptyText="Nessun evento positivo registrato" colorClass="green" />
        </div>
      </div>

      {/* Sezione negativi — fissa al 50% con scrollbar interna */}
      <div className="flex-1 min-h-0 flex flex-col bg-red-50/30 rounded-xl border border-red-100 overflow-hidden">
        <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 px-4 py-2.5 border-b border-red-100 bg-red-50/50 shrink-0">
          💔 Cose Negative
        </h4>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3">
          <EventGrid items={allNegative} emptyText="Nessun evento negativo registrato" colorClass="red" />
        </div>
      </div>
    </div>
  );
};
