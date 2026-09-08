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

  const isSameDay = !event.endDateStr || event.endDateStr === eventDate;

  return (
    <div
      onClick={() => onSelectEvent(event)}
      className={`group border-b border-gray-100 last:border-b-0 grid grid-cols-[1fr_28px_110px] sm:grid-cols-[1fr_120px_130px_130px_110px_170px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${
        isPast ? 'bg-gray-50/40 text-gray-400' : 'bg-white'
      }`}
    >
      {/* COLONNA 1: Titolo & Descrizione Evento */}
      <div className="min-w-0 flex flex-col justify-center pl-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-xs sm:text-sm font-semibold truncate ${
              isPast ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-600 transition-colors'
            }`}
            title={event.title}
          >
            {event.title}
          </span>

          {isToday && (
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 select-none">
              Oggi
            </span>
          )}

          {recurrenceLabel !== '—' && (
            <span
              className="sm:hidden text-blue-600 shrink-0 text-xs"
              title={`Ricorrenza: ${recurrenceLabel}`}
            >
              🔄
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-[10px] sm:text-xs text-gray-400 truncate mt-0.5 max-w-lg">
            {event.description}
          </p>
        )}
      </div>

      {/* COLONNA 2: Categoria (Pallino colorato su mobile, Badge su desktop) */}
      <div className="w-7 sm:w-[120px] flex items-center justify-center sm:justify-start min-w-0">
        {/* Desktop: Badge completo */}
        <div className="hidden sm:block max-w-full truncate">
          <Badge variant="category" colorHex={categoryColor} className="max-w-full truncate">
            {categoryName}
          </Badge>
        </div>
        {/* Mobile: Pallino colorato con tooltip */}
        <div
          className="sm:hidden w-3.5 h-3.5 rounded-full shadow-2xs border border-black/10 shrink-0"
          style={{ backgroundColor: categoryColor }}
          title={`Categoria: ${categoryName}`}
          aria-label={`Categoria: ${categoryName}`}
        />
      </div>

      {/* COLONNA 3: Date (su mobile mostra sia Inizio che Fine; su desktop solo Inizio) */}
      <div className="w-[110px] sm:w-[130px] flex flex-col justify-center gap-0.5">
        {/* Mobile: sia Inizio che Fine */}
        <div className="sm:hidden flex flex-col justify-center gap-0.5 text-[11px] leading-tight">
          {isSameDay ? (
            <>
              <div className="flex items-center gap-1 font-semibold text-gray-800 truncate">
                <CalendarIcon className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{formattedStartDate}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                <ClockIcon className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                <span className="truncate">
                  {event.tutto_il_giorno
                    ? 'All day'
                    : event.time && event.endTime
                    ? `${event.time} - ${event.endTime}`
                    : event.time || event.endTime || '—'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 font-medium text-gray-800 truncate">
                <span className="text-[9px] font-bold text-slate-400 shrink-0 uppercase">In:</span>
                <span className="font-semibold truncate">{formattedStartDate}</span>
                {event.time && !event.tutto_il_giorno && (
                  <span className="text-[10px] text-gray-500 shrink-0">{event.time}</span>
                )}
              </div>
              <div className="flex items-center gap-1 font-medium text-gray-800 truncate">
                <span className="text-[9px] font-bold text-slate-400 shrink-0 uppercase">Fi:</span>
                <span className="font-semibold truncate">{formattedEndDate}</span>
                {event.endTime && !event.tutto_il_giorno && (
                  <span className="text-[10px] text-gray-500 shrink-0">{event.endTime}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Desktop: Data & Ora di Inizio */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formattedStartDate}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <ClockIcon className="w-3 h-3 text-gray-400 shrink-0" />
          <span>{event.time || '—'}</span>
        </div>
      </div>

      {/* COLONNA 4: Fine (visibile su desktop) */}
      <div className="hidden sm:flex w-[130px] flex-col justify-center gap-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formattedEndDate}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <ClockIcon className="w-3 h-3 text-gray-400 shrink-0" />
          <span>{event.endTime || '—'}</span>
        </div>
      </div>

      {/* COLONNA 5: Tutto il Giorno (visibile su desktop) */}
      <div className="hidden sm:flex w-[110px] items-center justify-center">
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

      {/* COLONNA 6: Ricorrenza (visibile su desktop) */}
      <div className="hidden sm:flex w-[170px] items-center min-w-0">
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
