// src/components/admin/feedback/AdminFeedbackStats.tsx
import React from 'react';

export interface AdminFeedbackStatsProps {
  total: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
}

export const AdminFeedbackStats: React.FC<AdminFeedbackStatsProps> = ({
  total,
  newCount,
  inProgressCount,
  resolvedCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 select-none">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="text-xs font-bold text-slate-400">Totale Segnalazioni</div>
        <div className="text-2xl font-black text-slate-800 mt-1">{total}</div>
      </div>

      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-2xs">
        <div className="text-xs font-bold text-blue-600 flex items-center justify-between">
          <span>Nuove da Gestire</span>
          {newCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </div>
        <div className="text-2xl font-black text-blue-700 mt-1">{newCount}</div>
      </div>

      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs">
        <div className="text-xs font-bold text-amber-600">In Lavorazione</div>
        <div className="text-2xl font-black text-amber-700 mt-1">{inProgressCount}</div>
      </div>

      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
        <div className="text-xs font-bold text-emerald-600">Risolte</div>
        <div className="text-2xl font-black text-emerald-700 mt-1">{resolvedCount}</div>
      </div>
    </div>
  );
};

export default AdminFeedbackStats;
