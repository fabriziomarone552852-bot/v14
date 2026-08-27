// src/components/events/EventTableRow.tsx
import React from 'react';
import { CalendarIcon, ClockIcon, CheckIcon } from '@/components/shared/utils/Icons';
import { Badge } from '@/components/shared/utils/Badges';
import type { CalendarEvent } from '@/types';
import { formatToItalianShortDate, getLocalTodayStr } from '@/utils/dateUtils';
import { formatName } from '@/utils/uiUtils';
import { formatEventRecurrence } from './eventRecurrenceUtils';

interface EventTableRowProps {
  event: CalendarEvent;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const EventTableRow: React.FC<EventTableRowProps> = ({
  event,
  onSelectEvent,
}) => {
  const todayStr = getLocalTodayStr();
  const eventDate = event.dateStr || '';
  const isPast = eventDate !== '' && eventDate < todayStr;
  const isToday = eventDate === todayStr;

  const formattedStartDate = eventDate ? formatToItalianShortDate(eventDate) : '—';
  const formattedEndDate = event.endDateStr
    ? formatToItalianShortDate(event.endDateStr)
    : eventDate
    ? formatToItalianShortDate(eventDate)
    : '—';

  const categoryName = formatName(event.category || 'Generico');
  const categoryColor = event.categoryColor || '#9CA3AF';
  const recurrenceLabel = formatEventRecurrence(event.rrule);

  return (
    <div
      onClick={() => onSelectEvent(event)}
      className={`group border-b border-gray-100 last:border-b-0 grid grid-cols-[1fr_120px_130px_130px_110px_170px] items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${
        isPast ? 'bg-gray-50/40 text-gray-400' : 'bg-white'
      }`}
    >
      {/* COLONNA 1: Titolo & Descrizione */}
      <div className="min-w-0 flex flex-col justify-center pl-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-sm font-semibold truncate ${
              isPast ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-600 transition-colors'
            }`}
          >
            {event.title}
          </span>

          {isToday && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 select-none">
              Oggi
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5 max-w-lg">
            {event.description}
          </p>
        )}
      </div>

      {/* COLONNA 2: Categoria (Badge colorato) */}
      <div className="w-[120px] flex items-center min-w-0">
        <Badge variant="category" colorHex={categoryColor} className="max-w-full truncate">
          {categoryName}
        </Badge>
      </div>

      {/* COLONNA 3: Inizio (Data & Ora con icona orologio) */}
      <div className="w-[130px] flex flex-col justify-center gap-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formattedStartDate}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <ClockIcon className="w-3 h-3 text-gray-400 shrink-0" />
          <span>{event.time || '—'}</span>
        </div>
      </div>

      {/* COLONNA 4: Fine (Data & Ora con icona orologio) */}
      <div className="w-[130px] flex flex-col justify-center gap-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formattedEndDate}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <ClockIcon className="w-3 h-3 text-gray-400 shrink-0" />
          <span>{event.endTime || '—'}</span>
        </div>
      </div>

      {/* COLONNA 5: Tutto il Giorno (Spunta verde se attivo) */}
      <div className="w-[110px] flex items-center justify-center">
        {event.tutto_il_giorno ? (
          <span
            className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-2xs"
            title="Evento tutto il giorno"
          >
            <CheckIcon className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="text-xs text-gray-300 font-medium select-none">—</span>
        )}
      </div>

      {/* COLONNA 6: Ricorrenza */}
      <div className="w-[170px] flex items-center min-w-0">
        {recurrenceLabel !== '—' ? (
          <span
            className="text-xs font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-lg border border-blue-200/60 truncate"
            title={recurrenceLabel}
          >
            {recurrenceLabel}
          </span>
        ) : (
          <span className="text-xs text-gray-300 font-medium px-2 select-none">—</span>
        )}
      </div>
    </div>
  );
};

export default EventTableRow;
