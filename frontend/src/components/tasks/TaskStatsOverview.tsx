// src/components/tasks/TaskStatsOverview.tsx
import React from 'react';
import { TaskListIcon } from '@/components/shared/utils/Icons';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

interface TaskStatsOverviewProps {
  stats: TaskStats;
  panelClass?: string;
}

export const TaskStatsOverview: React.FC<TaskStatsOverviewProps> = ({
  stats,
  panelClass,
}) => {
  const extraStats = (
    <>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
        <span className="font-semibold text-slate-500">Totali:</span>
        <span className="font-extrabold text-slate-900">{stats.total}</span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
        <span className="font-semibold text-blue-600">Da fare:</span>
        <span className="font-extrabold text-blue-700">{stats.active}</span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
        <span className="font-semibold text-emerald-600">Completati:</span>
        <span className="font-extrabold text-emerald-700">{stats.completed}</span>
      </div>

      {stats.overdue > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs">
          <span className="font-semibold text-rose-600">Scaduti:</span>
          <span className="font-extrabold text-rose-700">{stats.overdue}</span>
        </div>
      )}
    </>
  );

  return (
    <ArchiveHeader
      icon={<TaskListIcon className="w-5 h-5" />}
      title="Gestione Task"
      subtitle="Organizza e consulta le tue attività e gerarchie di sotto-task."
      extra={extraStats}
      className={panelClass}
    />
  );
};

export default TaskStatsOverview;
