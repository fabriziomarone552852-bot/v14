// src/components/admin/AdminCodesSection.tsx
import React from 'react';
import type { SystemConfigCodeItem } from '@/api/adminApi';
import { useAdminCodesLogic } from './codes/useAdminCodesLogic';
import { AdminCodesTable } from './codes/AdminCodesTable';
import { AdminCodeCreateModal } from './codes/AdminCodeCreateModal';

interface AdminCodesSectionProps {
  codes: SystemConfigCodeItem[];
  onRefresh: () => Promise<void>;
}

export const AdminCodesSection: React.FC<AdminCodesSectionProps> = ({ codes, onRefresh }) => {
  const logic = useAdminCodesLogic({ codes, onRefresh });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">🏷️ Codici di Configurazione (`ConfigCode`)</h3>
          <p className="text-xs text-slate-500">
            Vocabolari di sistema (stati task, ruoli gruppi, visibilità liste, tipi priorità).
          </p>
        </div>
        <button
          type="button"
          onClick={() => logic.setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition cursor-pointer"
        >
          + Nuovo ConfigCode
        </button>
      </div>

      {logic.message && (
        <div
          className={`rounded-xl p-3 text-xs font-medium ${
            logic.message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {logic.message.text}
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Tipo Codice (`Code Type`):</label>
          <select
            value={logic.selectedType}
            onChange={(e) => logic.setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-sky-400 cursor-pointer"
          >
            <option value="all">Tutti i tipi ({logic.codeTypes.length})</option>
            {logic.codeTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <input
            type="text"
            placeholder="Cerca per codice o nome..."
            value={logic.search}
            onChange={(e) => logic.setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* Table */}
      <AdminCodesTable
        filteredCodes={logic.filteredCodes}
        onToggleActive={logic.handleToggleActive}
      />

      {/* Modal Creazione Nuovo ConfigCode */}
      <AdminCodeCreateModal
        isOpen={logic.isModalOpen}
        onClose={() => logic.setIsModalOpen(false)}
        form={logic.form}
        setForm={logic.setForm}
        submitting={logic.submitting}
        onSubmit={logic.handleCreate}
      />
    </div>
  );
};

export default AdminCodesSection;
