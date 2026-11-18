// src/components/admin/habits_goals/AdminCountdownsTable.tsx
import React from 'react';
import type { EnrichedAdminCountdownItem } from './types';
import { CheckIcon, CloseIcon, TrashIcon } from '@/components/shared/utils/Icons';

interface AdminCountdownsTableProps {
  items: EnrichedAdminCountdownItem[];
  isDraftDirty: (id: number) => boolean;
  onDraftChange: (id: number, field: 'title' | 'targetDate' | 'status', val: unknown) => void;
  onCancelDraft: (id: number) => void;
  onSave: (item: EnrichedAdminCountdownItem) => void;
  onDelete: (id: number, title: string) => void;
  disabled?: boolean;
}

const toInputDateTime = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
};

export const AdminCountdownsTable: React.FC<AdminCountdownsTableProps> = ({
  items,
  isDraftDirty,
  onDraftChange,
  onCancelDraft,
  onSave,
  onDelete,
  disabled = false,
}) => {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 space-y-2">
        <div className="text-3xl">🔍</div>
        <div className="text-xs font-bold text-slate-700">Nessun traguardo / countdown trovato</div>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Nessun conto alla rovescia corrisponde ai filtri impostati.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto max-h-[65vh]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10 select-none">
            <tr>
              <th className="py-2.5 px-3 w-16"># ID</th>
              <th className="py-2.5 px-3 w-36">Utente</th>
              <th className="py-2.5 px-3 min-w-[260px]">Titolo / Obiettivo</th>
              <th className="py-2.5 px-3 w-48">Data & Ora Obiettivo</th>
              <th className="py-2.5 px-3 w-28 text-center">Stato</th>
              <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const dirty = isDraftDirty(item.id);
              const currentTitle = item.draftTitle ?? item.title;
              const currentTargetDate = item.draftTargetDate ?? item.target_date;
              const currentStatus = item.draftStatus ?? item.status;
              const isPast = new Date(currentTargetDate).getTime() < Date.now();

              return (
                <tr
                  key={item.id}
                  className={`transition-colors text-xs border-b border-slate-100 ${
                    dirty
                      ? 'bg-amber-50/80 hover:bg-amber-100/60'
                      : 'hover:bg-sky-50/40 bg-white'
                  }`}
                >
                  {/* 1. ID */}
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                    #{item.id}
                  </td>

                  {/* 2. Utente */}
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                      👤 {item.username || `User #${item.user_id}`}
                    </span>
                  </td>

                  {/* 3. Titolo */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={currentTitle}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(item.id, 'title', e.target.value)}
                      placeholder="Titolo evento o traguardo..."
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                    />
                  </td>

                  {/* 4. Data Obiettivo */}
                  <td className="py-2 px-3">
                    <input
                      type="datetime-local"
                      value={toInputDateTime(currentTargetDate)}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(item.id, 'targetDate', new Date(e.target.value).toISOString())}
                      className="px-2 py-1 text-xs font-mono font-semibold border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500"
                    />
                  </td>

                  {/* 5. Stato */}
                  <td className="py-2 px-3 text-center">
                    <select
                      value={currentStatus}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(item.id, 'status', e.target.value as 'active' | 'closed')}
                      className={`px-2 py-1 text-[11px] font-bold rounded-xl border outline-none cursor-pointer ${
                        currentStatus === 'active'
                          ? isPast
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <option value="active">Attivo {isPast ? '(Scaduto)' : ''}</option>
                      <option value="closed">Concluso</option>
                    </select>
                  </td>

                  {/* 6. Azioni */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {dirty ? (
                        <>
                          <button
                            type="button"
                            disabled={disabled || !currentTitle.trim()}
                            onClick={() => onSave(item)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                            title="Salva modifiche"
                          >
                            <CheckIcon className="w-3 h-3" />
                            <span>Salva</span>
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onCancelDraft(item.id)}
                            className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
                            title="Annulla"
                          >
                            <CloseIcon className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onDelete(item.id, currentTitle)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Elimina definitivamente"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
