// src/components/admin/feedback/AdminFeedbackFilters.tsx
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

export interface AdminFeedbackFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (severity: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const AdminFeedbackFilters: React.FC<AdminFeedbackFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  severityFilter,
  onSeverityFilterChange,
  typeFilter,
  onTypeFilterChange,
  loading,
  onRefresh,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 select-none">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        {/* Ricerca */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca titolo, utente, testo..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Filtro Stato */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="all">Tutti gli stati</option>
          <option value="new">Nuovi</option>
          <option value="in_progress">In Lavorazione</option>
          <option value="resolved">Risolti</option>
          <option value="dismissed">Archiviati</option>
        </select>

        {/* Filtro Gravità */}
        <select
          value={severityFilter}
          onChange={(e) => onSeverityFilterChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="all">Tutte le gravità</option>
          <option value="critical">Critica</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Bassa</option>
        </select>

        {/* Filtro Tipologia */}
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="all">Tutte le tipologie</option>
          <option value="bug">Bug / Errore</option>
          <option value="visual">Grafica / Layout</option>
          <option value="feature_request">Suggerimento</option>
          <option value="other">Altro</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span>Aggiorna</span>
      </button>
    </div>
  );
};

export default AdminFeedbackFilters;
