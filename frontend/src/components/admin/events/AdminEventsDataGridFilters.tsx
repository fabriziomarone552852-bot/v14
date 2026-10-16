// src/components/admin/events/AdminEventsDataGridFilters.tsx
import React from 'react';
import type { EventsDatePreset } from './useAdminEventsDataGridLogic';
import type { SystemUserItem } from '@/api/adminApi';
import type { AdminCategoryOption } from '@/api/adminEventsApi';

export interface AdminEventsDataGridFiltersProps {
  datePreset: EventsDatePreset;
  onDatePresetChange: (preset: EventsDatePreset) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  users: SystemUserItem[];
  selectedUserId: number | 'all';
  onUserChange: (id: number | 'all') => void;
  categories: AdminCategoryOption[];
  selectedCategoryId: number | 'all';
  onCategoryChange: (id: number | 'all') => void;
  timeFilter: 'all' | 'all-day' | 'timed';
  onTimeFilterChange: (val: 'all' | 'all-day' | 'timed') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyAnomalies: boolean;
  onToggleOnlyAnomalies: (val: boolean) => void;
  filteredCount: number;
  totalCount: number;
  anomaliesCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export const AdminEventsDataGridFilters: React.FC<AdminEventsDataGridFiltersProps> = ({
  datePreset,
  onDatePresetChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  users,
  selectedUserId,
  onUserChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
  timeFilter,
  onTimeFilterChange,
  searchQuery,
  onSearchChange,
  onlyAnomalies,
  onToggleOnlyAnomalies,
  filteredCount,
  totalCount,
  anomaliesCount,
  loading,
  onRefresh,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
      {/* 1. RIGA SUPERIORE: PRESET DATE & UTENTE & RICERCA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Preset Date a Pillola */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-2xl text-xs font-bold text-slate-600">
          {[
            { id: 'all' as EventsDatePreset, label: 'Tutti' },
            { id: 'today' as EventsDatePreset, label: 'Oggi' },
            { id: '7days' as EventsDatePreset, label: '7 Giorni' },
            { id: 'month' as EventsDatePreset, label: 'Mese' },
            { id: 'year' as EventsDatePreset, label: 'Anno' },
            { id: 'custom' as EventsDatePreset, label: 'Personalizzato' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onDatePresetChange(preset.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                datePreset === preset.id
                  ? 'bg-white text-violet-700 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Ricerca Testuale in RAM */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca per titolo, luogo, note, utente..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-violet-500 focus:bg-white transition"
          />
          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. RIGA INTERMEDIA: DATE CUSTOM (Se 'custom') & SELECT UTENTE & CATEGORIA */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
        {datePreset === 'custom' && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500">Da:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="text-xs bg-transparent outline-none font-medium"
            />
            <span className="text-[11px] font-bold text-slate-500 ml-1">A:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="text-xs bg-transparent outline-none font-medium"
            />
          </div>
        )}

        {/* Dropdown Filtro Utente */}
        <div className="flex items-center gap-1.5 min-w-[170px]">
          <span className="text-[11px] font-bold text-slate-400">👤 Utente:</span>
          <select
            value={selectedUserId}
            onChange={(e) => onUserChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">Tutti gli utenti ({users.length})</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Filtro Categoria */}
        <div className="flex items-center gap-1.5 min-w-[170px]">
          <span className="text-[11px] font-bold text-slate-400">🏷️ Categoria:</span>
          <select
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">Tutte le categorie ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name} ({c.username || 'Sistema'})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Orario / Tutto il giorno */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400">🕒 Tipo:</span>
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value as 'all' | 'all-day' | 'timed')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">Tutti</option>
            <option value="all-day">Solo tutto il giorno</option>
            <option value="timed">Solo con orario</option>
          </select>
        </div>

        {/* Toggle Solo Anomalie */}
        <button
          type="button"
          onClick={() => onToggleOnlyAnomalies(!onlyAnomalies)}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
            onlyAnomalies
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>⚠️ Solo anomalie</span>
          {anomaliesCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                onlyAnomalies ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {anomaliesCount}
            </span>
          )}
        </button>

        {/* Refresh & Totali a Destra */}
        <div className="ml-auto flex items-center gap-2">
          <div className="text-[11px] text-slate-500 font-medium">
            Mostrati: <strong className="text-slate-800 font-mono">{filteredCount}</strong> / {totalCount}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Ricarica impegni dal database"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};
