// src/components/admin/tasks/AdminTasksDataGridFilters.tsx
import React from 'react';
import type { TasksDatePreset } from './useAdminTasksDataGridLogic';
import type { TaskPriority } from '@/api/adminTasksApi';
import type { SystemUserItem } from '@/api/adminApi';
import type { AdminCategoryOption } from '@/api/adminEventsApi';

export interface AdminTasksDataGridFiltersProps {
  datePreset: TasksDatePreset;
  onDatePresetChange: (preset: TasksDatePreset) => void;
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
  selectedPriority: TaskPriority | 'all';
  onPriorityChange: (p: TaskPriority | 'all') => void;
  selectedStatus: 'all' | 'pending' | 'completed';
  onStatusChange: (s: 'all' | 'pending' | 'completed') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyAnomalies: boolean;
  onToggleOnlyAnomalies: (val: boolean) => void;
  filteredCount: number;
  totalCount: number;
  completedCount: number;
  anomaliesCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export const AdminTasksDataGridFilters: React.FC<AdminTasksDataGridFiltersProps> = ({
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
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onlyAnomalies,
  onToggleOnlyAnomalies,
  filteredCount,
  totalCount,
  completedCount,
  anomaliesCount,
  loading,
  onRefresh,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
      {/* 1. RIGA SUPERIORE: PRESET DATE & RICERCA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Preset Date a Pillola */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-2xl text-xs font-bold text-slate-600">
          {[
            { id: 'all' as TasksDatePreset, label: 'Tutti' },
            { id: 'today' as TasksDatePreset, label: 'Oggi' },
            { id: '7days' as TasksDatePreset, label: '7 Giorni' },
            { id: 'month' as TasksDatePreset, label: 'Mese' },
            { id: 'year' as TasksDatePreset, label: 'Anno' },
            { id: 'custom' as TasksDatePreset, label: 'Personalizzato' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onDatePresetChange(preset.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                datePreset === preset.id
                  ? 'bg-white text-amber-700 shadow-2xs font-extrabold'
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
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-amber-500 focus:bg-white transition"
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

      {/* 2. RIGA INTERMEDIA: DATE CUSTOM & SELECT UTENTE & PRIORITÀ & STATO */}
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
            className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
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
            className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Tutte le categorie ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name} ({c.username || 'Sistema'})
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Filtro Priorità */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400">⚡ Priorità:</span>
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Tutte le priorità</option>
            <option value="Alta">🔴 Alta</option>
            <option value="Media">🟡 Media</option>
            <option value="Bassa">🔵 Bassa</option>
          </select>
        </div>

        {/* Dropdown Filtro Stato */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'pending' | 'completed')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">⏳ Da completare</option>
            <option value="completed">✅ Completati</option>
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
            <span className="ml-1 text-emerald-600 font-semibold">({completedCount} fatti)</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Ricarica attività dal database"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};
