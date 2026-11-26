// src/components/archive/notifications/NotificationTableRow.tsx
import React from 'react';
import { format } from 'date-fns';
import { ArrowRightIcon } from '@/components/shared/utils/Icons';
import type { NotificationResponse } from '@/types/notifications';
import {
  formatNotificationMessage,
  getNotificationNavigationTarget,
  getNotificationTypeBadge,
} from '@/utils/notificationUtils';

interface NotificationTableRowProps {
  notification: NotificationResponse;
  onSelectNotification: (notification: NotificationResponse) => void;
}

export const NotificationTableRow: React.FC<NotificationTableRowProps> = ({
  notification,
  onSelectNotification,
}) => {
  const isUnread = !notification.read_at;
  const badge = getNotificationTypeBadge(notification.interaction_type);
  const message = formatNotificationMessage(notification);
  const hasNavigation = Boolean(getNotificationNavigationTarget(notification));

  const createdDate = new Date(notification.created_at);
  const validDate = !Number.isNaN(createdDate.getTime());
  const formattedDateTime = validDate
    ? format(createdDate, 'dd/MM/yyyy HH:mm')
    : '—';

  return (
    <div
      onClick={() => onSelectNotification(notification)}
      className={`group border-b border-gray-100 last:border-b-0 grid grid-cols-[1fr_108px] sm:grid-cols-[1fr_170px_145px] items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${
        isUnread ? 'bg-blue-50/40' : 'bg-white'
      }`}
    >
      {/* COLONNA 1: Pallino stato, Messaggio & Badge mobile */}
      <div className="min-w-0 flex items-start gap-2.5 pl-1">
        <div className="mt-1.5 shrink-0">
          <span
            className={`block w-2 h-2 rounded-full ${
              isUnread ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            title={isUnread ? 'Non letta' : 'Letta'}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <p
              className={`text-xs sm:text-sm leading-snug line-clamp-2 ${
                isUnread
                  ? 'font-bold text-slate-900 group-hover:text-blue-600'
                  : 'font-medium text-slate-700 group-hover:text-blue-600'
              } transition-colors`}
            >
              {message}
            </p>
            {hasNavigation && (
              <ArrowRightIcon className="hidden sm:block w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1 sm:hidden">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.badgeClass}`}
            >
              {badge.label}
            </span>
            {isUnread && (
              <span className="text-[10px] font-bold text-blue-600">• Nuova</span>
            )}
          </div>
        </div>
      </div>

      {/* COLONNA 2: Tipologia (Desktop) */}
      <div className="hidden sm:flex w-[170px] items-center min-w-0">
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border truncate max-w-full ${badge.badgeClass}`}
          title={badge.label}
        >
          {badge.label}
        </span>
      </div>

      {/* COLONNA 3: Data & Ora */}
      <div className="w-[108px] sm:w-[145px] flex items-center text-left">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap">
          {formattedDateTime}
        </span>
      </div>
    </div>
  );
};

export default NotificationTableRow;
