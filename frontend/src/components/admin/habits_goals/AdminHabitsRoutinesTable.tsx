// src/components/admin/habits_goals/AdminHabitsRoutinesTable.tsx
import React from 'react';
import type { EnrichedAdminHabitItem } from './types';
import { CheckIcon, CloseIcon, TrashIcon } from '@/components/shared/utils/Icons';

interface AdminHabitsRoutinesTableProps {
  items: EnrichedAdminHabitItem[];
  isDraftDirty: (id: number) => boolean;
  onDraftChange: (id: number, field: 'title' | 'tipo' | 'target' | 'rrule', val: unknown) => void;
  onCancelDraft: (id: number) => void;
  onSave: (item: EnrichedAdminHabitItem) => void;
  onDelete: (id: number, title: string) => void;
  disabled?: boolean;
}

export const AdminHabitsRoutinesTable: React.FC<AdminHabitsRoutinesTableProps> = ({
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
        <div className="text-xs font-bold text-slate-700">Nessun elemento trovato</div>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Nessuna abitudine o routine corrisponde ai filtri impostati.
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
              <th className="py-2.5 px-3 min-w-[240px]">Titolo / Denominazione</th>
              <th className="py-2.5 px-3 w-28 text-center">Tipo</th>
              <th className="py-2.5 px-3 w-28 text-center">Target</th>
              <th className="py-2.5 px-3 w-36 text-center">Log Eseguiti</th>
              <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const dirty = isDraftDirty(item.id);
              const currentTitle = item.draftTitle ?? item.titolo;
              const currentTipo = item.draftTipo ?? item.tipo;
              const currentTarget = item.draftTarget ?? item.target;

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
                      placeholder="Titolo abitudine o routine..."
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                    />
                  </td>

                  {/* 4. Tipo */}
                  <td className="py-2 px-3 text-center">
                    <select
                      value={currentTipo}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(item.id, 'tipo', e.target.value as 'A' | 'R')}
                      className={`px-2 py-1 text-xs font-bold rounded-xl border outline-none cursor-pointer ${
                        currentTipo === 'A'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}
                    >
                      <option value="A">⚡ Abitudine</option>
                      <option value="R">🔁 Routine</option>
                    </select>
                  </td>

                  {/* 5. Target */}
                  <td className="py-2 px-3 text-center">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={currentTarget}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(item.id, 'target', Math.max(1, Number(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-xs font-mono font-bold text-center border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500"
                    />
                  </td>

                  {/* 6. Log Eseguiti */}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold ${
                        item.logs_count > 0
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50'
                      }`}
                    >
                      {item.logs_count} {item.logs_count === 1 ? 'log' : 'logs'}
                    </span>
                  </td>

                  {/* 7. Azioni */}
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
