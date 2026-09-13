// src/components/admin/codes/AdminCodesTable.tsx
import React from 'react';
import type { SystemConfigCodeItem } from '@/api/adminApi';

interface AdminCodesTableProps {
  filteredCodes: SystemConfigCodeItem[];
  onToggleActive: (code: SystemConfigCodeItem) => void;
}

export const AdminCodesTable: React.FC<AdminCodesTableProps> = ({
  filteredCodes,
  onToggleActive,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Code Type</th>
              <th className="px-4 py-3 font-semibold">Code Value (Key)</th>
              <th className="px-4 py-3 font-semibold">Code Name / Label</th>
              <th className="px-4 py-3 font-semibold">Ordine</th>
              <th className="px-4 py-3 font-semibold">Stato</th>
              <th className="px-4 py-3 text-right font-semibold">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCodes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Nessun codice trovato per i filtri selezionati.
                </td>
              </tr>
            ) : (
              filteredCodes.map((c) => {
                const isActive = c.active ?? c.is_active ?? true;

                return (
                  <tr key={c.id} className={`transition ${isActive ? 'hover:bg-slate-50/60' : 'bg-slate-50/40 opacity-60'}`}>
                    <td className="px-4 py-3 font-mono text-slate-400">#{c.id}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-sky-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-700 border border-sky-100">
                        {c.code_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.code_value}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{c.code_name}</span>
                      {c.description && <p className="text-[11px] text-slate-400">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{c.sort_order ?? 0}</td>
                    <td className="px-4 py-3">
                      {isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          Attivo
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                          Disattivato
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleActive(c)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          isActive
                            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isActive ? 'Disattiva' : 'Riattiva'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
