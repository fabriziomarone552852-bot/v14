// src/components/events/EventTableHeader.tsx
import React from 'react';

export type EventSortField = 'created' | 'title' | 'category' | 'startDate' | 'endDate' | 'allDay' | 'recurrence';
export type EventSortDirection = 'asc' | 'desc';

interface EventTableHeaderProps {
  sortField: EventSortField;
  sortDirection: EventSortDirection;
  onSort: (field: EventSortField) => void;
}

interface ColumnDef {
  field: EventSortField;
  labelDesktop: string;
  labelMobile: string;
  className: string;
}

const columns: ColumnDef[] = [
  {
    field: 'title',
    labelDesktop: 'Evento',
    labelMobile: 'Evento',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1',
  },
  {
    field: 'category',
    labelDesktop: 'Categoria',
    labelMobile: 'Cat.',
    className: 'w-7 sm:w-[120px] flex items-center justify-center sm:justify-start gap-1 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'startDate',
    labelDesktop: 'Inizio',
    labelMobile: 'Date',
    className: 'w-[110px] sm:w-[130px] flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'endDate',
    labelDesktop: 'Fine',
    labelMobile: 'Fine',
    className: 'hidden sm:flex w-[130px] items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'allDay',
    labelDesktop: 'Tutto il Giorno',
    labelMobile: 'All Day',
    className: 'hidden sm:flex w-[110px] items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
  {
    field: 'recurrence',
    labelDesktop: 'Ricorrenza',
    labelMobile: 'Ricorrenza',
    className: 'hidden sm:flex w-[170px] items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
];

export const EventTableHeader: React.FC<EventTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_28px_110px] sm:grid-cols-[1fr_120px_130px_130px_110px_170px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {columns.map((col) => {
        const isActive = sortField === col.field;
        return (
          <div
            key={col.field}
            onClick={() => onSort(col.field)}
            className={col.className}
          >
            <span className="hidden sm:inline">{col.labelDesktop}</span>
            <span className="sm:hidden">{col.labelMobile}</span>
            {isActive && (
              <svg
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 shrink-0 ${
                  sortDirection === 'desc' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EventTableHeader;
