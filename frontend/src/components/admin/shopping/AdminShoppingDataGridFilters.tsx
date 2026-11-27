// src/components/admin/shopping/AdminShoppingDataGridFilters.tsx
import React, { useMemo } from 'react';
import type {
  ShoppingSupplierOption,
} from '@/types/shopping';
import { SearchableSelect } from '@/components/shared/form/SearchableSelect';
import type { DataGridDatePreset } from './useAdminShoppingDataGridLogic';

interface AdminShoppingDataGridFiltersProps {
  datePreset: DataGridDatePreset;
  onDatePresetChange: (p: DataGridDatePreset) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  suppliers: ShoppingSupplierOption[];
  selectedSupplierId: number | 'all';
  onSupplierChange: (id: number | 'all') => void;
  brands: ShoppingSupplierOption[];
  selectedBrandId: number | 'all';
  onBrandChange: (id: number | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyAnomalies: boolean;
  onToggleOnlyAnomalies: (val: boolean) => void;
  onlyOffers: boolean;
  onToggleOnlyOffers: (val: boolean) => void;
  filteredCount: number;
  totalCount: number;
  totalAmount: number;
  anomaliesCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export const AdminShoppingDataGridFilters: React.FC<AdminShoppingDataGridFiltersProps> = ({
  datePreset,
  onDatePresetChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  suppliers,
  selectedSupplierId,
  onSupplierChange,
  brands,
  selectedBrandId,
  onBrandChange,
  searchQuery,
  onSearchChange,
  onlyAnomalies,
  onToggleOnlyAnomalies,
  onlyOffers,
  onToggleOnlyOffers,
  filteredCount,
  totalCount,
  totalAmount,
  anomaliesCount,
  loading,
  onRefresh,
}) => {
  const presets: { id: DataGridDatePreset; label: string }[] = [
    { id: 'today', label: 'Oggi' },
    { id: '7days', label: 'Ultimi 7 gg' },
    { id: 'month', label: 'Mese Corrente' },
    { id: 'year', label: 'Anno Corrente' },
    { id: 'all', label: 'Tutto' },
    { id: 'custom', label: 'Periodo...' },
  ];

  // Opzioni per SearchableSelect
  const supplierOptions = useMemo(() => [
    { value: 'all', label: `Tutti i Negozi (${suppliers.length})` },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ], [suppliers]);

  const brandOptions = useMemo(() => [
    { value: 'all', label: `Tutti i Brand (${brands.length})` },
    ...brands.map((b) => ({ value: b.id, label: b.name })),
  ], [brands]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
      {/* 1. RIGA PRESET DATA & METRICHE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        {/* Pulsanti Preset Date */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <span>📅</span>
            <span>Periodo:</span>
          </span>
          {presets.map((p) => {
            const isActive = datePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onDatePresetChange(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            );
          })}

          {datePreset === 'custom' && (
            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono outline-none focus:border-sky-500"
                title="Data inizio"
              />
              <span className="text-slate-400 text-xs">➔</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono outline-none focus:border-sky-500"
                title="Data fine"
              />
            </div>
          )}
        </div>

        {/* Metriche Rapide e Bottone Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Righe Mostrate</span>
              <span className="text-xs font-black text-slate-900">
                {filteredCount} <span className="text-slate-400 font-normal">/ {totalCount}</span>
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Totale Filtrato</span>
              <span className="text-xs font-black text-emerald-700 font-mono">
                {totalAmount.toFixed(2)} €
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-bold transition shadow-2xs cursor-pointer flex items-center justify-center"
            title="Ricarica lotti e cataloghi dal database"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
          </button>
        </div>
      </div>

      {/* 2. RIGA FILTRI AVANZATI (Negozio, Brand, Ricerca, Toggle Anomalie) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Ricerca Testuale */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            🔍 Cerca Articolo o Brand
          </label>
          <input
            type="text"
            placeholder="Es. pasta, granarolo, conad..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-sky-500 focus:bg-white transition"
          />
        </div>

        {/* Selettore Negozio */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            🏪 Filtra per Punto Vendita / Negozio
          </label>
          <SearchableSelect
            value={selectedSupplierId}
            onChange={(v) => onSupplierChange(v === 'all' ? 'all' : Number(v))}
            options={supplierOptions}
            placeholder="Tutti i Negozi"
            mobileTitle="Filtra per Negozio"
            searchPlaceholder="Cerca negozio..."
            maxListHeight={280}
          />
        </div>

        {/* Selettore Brand */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            🏷️ Filtra per Brand / Produttore
          </label>
          <SearchableSelect
            value={selectedBrandId}
            onChange={(v) => onBrandChange(v === 'all' ? 'all' : Number(v))}
            options={brandOptions}
            placeholder="Tutti i Brand"
            mobileTitle="Filtra per Brand"
            searchPlaceholder="Cerca brand..."
            maxListHeight={280}
          />
        </div>

        {/* Toggles Rapidi: Anomalie e Offerte */}
        <div className="flex items-center gap-2 pt-4">
          {/* Toggle Solo Anomalie */}
          <button
            type="button"
            onClick={() => onToggleOnlyAnomalies(!onlyAnomalies)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              onlyAnomalies
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50/70 border-rose-200 text-rose-800 hover:bg-rose-100'
            }`}
            title="Mostra solo registrazioni con prezzi unitari sproporzionati, quantità anomale o negozi mancanti"
          >
            <span>🚨 Anomalie</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                onlyAnomalies ? 'bg-white text-rose-700' : 'bg-rose-200/80 text-rose-900'
              }`}
            >
              {anomaliesCount}
            </span>
          </button>

          {/* Toggle Solo Offerte */}
          <button
            type="button"
            onClick={() => onToggleOnlyOffers(!onlyOffers)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              onlyOffers
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
            title="Mostra solo gli articoli contrassegnati come in offerta/volantino"
          >
            <span>🏷️ Offerte</span>
          </button>
        </div>
      </div>
    </div>
  );
};
