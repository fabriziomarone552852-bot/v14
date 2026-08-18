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
  label: string;
  className: string;
}

const columns: ColumnDef[] = [
  {
    field: 'title',
    label: 'Evento & Descrizione',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-2',
  },
  {
    field: 'category',
    label: 'Categoria',
    className: 'w-[120px] flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'startDate',
    label: 'Inizio',
    className: 'w-[130px] flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'endDate',
    label: 'Fine',
    className: 'w-[130px] flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'allDay',
    label: 'Tutto il Giorno',
    className: 'w-[110px] flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
  {
    field: 'recurrence',
    label: 'Ricorrenza',
    className: 'w-[170px] flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
];

export const EventTableHeader: React.FC<EventTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_120px_130px_130px_110px_170px] items-center gap-3 px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {columns.map((col) => {
        const isActive = sortField === col.field;
        return (
          <div
            key={col.field}
            onClick={() => onSort(col.field)}
            className={col.className}
          >
            <span>{col.label}</span>
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
