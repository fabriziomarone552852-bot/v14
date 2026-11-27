// src/components/archive/notifications/NotificationStatsOverview.tsx
import React from 'react';
import { BellIcon } from '@/components/shared/utils/Icons';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import type { NotificationArchiveStats } from '@/hooks/useNotificationArchiveData';

interface NotificationStatsOverviewProps {
  stats: NotificationArchiveStats;
  panelClass?: string;
}

export const NotificationStatsOverview: React.FC<NotificationStatsOverviewProps> = ({
  stats,
  panelClass,
}) => {
  const extraStats = (
    <>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs">
        <span className="font-semibold text-slate-500">Totali:</span>
        <span className="font-extrabold text-slate-900">{stats.total}</span>
      </div>

      {stats.unread > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/80 text-xs">
          <span className="font-semibold text-blue-600">Non lette:</span>
          <span className="font-extrabold text-blue-700">{stats.unread}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/70 border border-emerald-200/80 text-xs">
        <span className="font-semibold text-emerald-600">Spesa:</span>
        <span className="font-extrabold text-emerald-700">{stats.shopping}</span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50/70 border border-indigo-200/80 text-xs">
        <span className="font-semibold text-indigo-600">Media:</span>
        <span className="font-extrabold text-indigo-700">{stats.media}</span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/70 border border-amber-200/80 text-xs">
        <span className="font-semibold text-amber-600">Sistema:</span>
        <span className="font-extrabold text-amber-700">{stats.system}</span>
      </div>
    </>
  );

  return (
    <ArchiveHeader
      icon={<BellIcon className="w-5 h-5" />}
      title="Notifiche & Avvisi"
      subtitle="Storico permanente di notifiche, inviti spesa, commenti e avvisi di sistema."
      extra={extraStats}
      className={panelClass}
    />
  );
};

export default NotificationStatsOverview;
