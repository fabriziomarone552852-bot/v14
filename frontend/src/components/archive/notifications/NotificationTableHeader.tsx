// src/components/archive/notifications/NotificationTableHeader.tsx
import React from 'react';
import type {
  NotificationSortDirection,
  NotificationSortField,
} from '@/hooks/useNotificationArchiveData';

interface NotificationTableHeaderProps {
  sortField: NotificationSortField;
  sortDirection: NotificationSortDirection;
  onSort: (field: NotificationSortField) => void;
}

interface ColumnDef {
  field: NotificationSortField;
  labelDesktop: string;
  labelMobile: string;
  className: string;
}

const columns: ColumnDef[] = [
  {
    field: 'status',
    labelDesktop: 'Notifica',
    labelMobile: 'Notifica',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1',
  },
  {
    field: 'type',
    labelDesktop: 'Tipologia',
    labelMobile: 'Tipo',
    className: 'hidden sm:flex w-[170px] items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'created',
    labelDesktop: 'Ricevuta',
    labelMobile: 'Data',
    className: 'w-[108px] sm:w-[145px] flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors',
  },
];

export const NotificationTableHeader: React.FC<NotificationTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_108px] sm:grid-cols-[1fr_170px_145px] items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
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
                strokeWidth={2.5}
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

export default NotificationTableHeader;
