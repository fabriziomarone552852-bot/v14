// src/components/categories/CategoryStatsOverview.tsx
import React from 'react';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { CategoryIcon } from '@/components/shared/utils/Icons';
import type { CategoryStats } from '@/hooks/useCategoryArchiveData';

interface CategoryStatsOverviewProps {
  stats: CategoryStats;
  panelClass?: string;
}

export const CategoryStatsOverview: React.FC<CategoryStatsOverviewProps> = ({
  stats,
  panelClass,
}) => {
  return (
    <ArchiveHeader
      title="GESTIONE CATEGORIE"
      subtitle="Organizza e gestisci le categorie per attività, eventi e stati d'animo."
      icon={<CategoryIcon className="w-5 h-5 text-white" />}
      className={panelClass}
      extra={
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
            <span>Totali:</span>
            <span className="font-extrabold text-slate-900">{stats.total}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700">
            <span>Tasks:</span>
            <span className="font-extrabold text-blue-900">{stats.tasks}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700">
            <span>Eventi:</span>
            <span className="font-extrabold text-indigo-900">{stats.events}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-700">
            <span>Comuni:</span>
            <span className="font-extrabold text-emerald-900">{stats.common}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-semibold text-amber-700">
            <span>Stati d'animo:</span>
            <span className="font-extrabold text-amber-900">{stats.mood}</span>
          </div>
        </div>
      }
    />
  );
};

export default CategoryStatsOverview;
