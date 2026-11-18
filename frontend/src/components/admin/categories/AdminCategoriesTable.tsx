// src/components/admin/categories/AdminCategoriesTable.tsx
import React from 'react';
import type { EnrichedAdminCategoryItem } from './types';
import type { CategoryGenreCode } from '@/api/adminCategoriesApi';
import { CheckIcon, CloseIcon, TrashIcon } from '@/components/shared/utils/Icons';

interface AdminCategoriesTableProps {
  categories: EnrichedAdminCategoryItem[];
  isDraftDirty: (id: number) => boolean;
  onDraftChange: (id: number, field: 'name' | 'color' | 'genre', val: unknown) => void;
  onCancelDraft: (id: number) => void;
  onSave: (item: EnrichedAdminCategoryItem) => void;
  onDelete: (id: number, name: string) => void;
  disabled?: boolean;
}

export const AdminCategoriesTable: React.FC<AdminCategoriesTableProps> = ({
  categories,
  isDraftDirty,
  onDraftChange,
  onCancelDraft,
  onSave,
  onDelete,
  disabled = false,
}) => {
  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 space-y-2">
        <div className="text-3xl">🔍</div>
        <div className="text-xs font-bold text-slate-700">Nessuna categoria o tag trovata</div>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Nessun elemento corrisponde ai filtri impostati o alla ricerca corrente.
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
              <th className="py-2.5 px-3 min-w-[220px]">Denominazione / Nome</th>
              <th className="py-2.5 px-3 w-28 text-center">Colore</th>
              <th className="py-2.5 px-3 w-36">Ambito / Genere</th>
              <th className="py-2.5 px-3 w-36 text-center">Utilizzi</th>
              <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const dirty = isDraftDirty(cat.id);
              const currentName = cat.draftName ?? cat.category_name;
              const currentColor = cat.draftColor ?? cat.colore ?? '#3b82f6';
              const currentGenre = cat.draftGenre ?? cat.genre;
              const totalUses = (cat.tasks_count || 0) + (cat.events_count || 0);

              return (
                <tr
                  key={cat.id}
                  className={`transition-colors text-xs border-b border-slate-100 ${
                    dirty
                      ? 'bg-amber-50/80 hover:bg-amber-100/60'
                      : 'hover:bg-sky-50/40 bg-white'
                  }`}
                >
                  {/* 1. ID */}
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                    #{cat.id}
                  </td>

                  {/* 2. Utente */}
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                      👤 {cat.username || `User #${cat.user_id}`}
                    </span>
                  </td>

                  {/* 3. Denominazione Nome */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={currentName}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(cat.id, 'name', e.target.value)}
                      placeholder="Nome categoria o tag..."
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                    />
                  </td>

                  {/* 4. Colore */}
                  <td className="py-2 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200">
                      <input
                        type="color"
                        value={currentColor}
                        disabled={disabled}
                        onChange={(e) => onDraftChange(cat.id, 'color', e.target.value)}
                        className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        title="Scegli colore"
                      />
                      <span className="font-mono text-[10px] text-slate-600 font-bold uppercase">
                        {currentColor}
                      </span>
                    </div>
                  </td>

                  {/* 5. Ambito / Genere */}
                  <td className="py-2 px-3">
                    <select
                      value={currentGenre}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(cat.id, 'genre', Number(e.target.value) as CategoryGenreCode)}
                      className="px-2 py-1 text-xs font-bold border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500 transition cursor-pointer"
                    >
                      <option value={3}>Comune (Eventi & Tasks)</option>
                      <option value={1}>Solo Attività (Tasks)</option>
                      <option value={2}>Solo Eventi</option>
                      <option value={5}>Tag & Etichette</option>
                      <option value={4}>Umore (Mood)</option>
                    </select>
                  </td>

                  {/* 6. Utilizzi */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded-lg border font-bold ${
                          cat.tasks_count > 0
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200/60'
                        }`}
                        title="Attività collegate"
                      >
                        ✓ {cat.tasks_count}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-lg border font-bold ${
                          cat.events_count > 0
                            ? 'bg-violet-50 text-violet-800 border-violet-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200/60'
                        }`}
                        title="Eventi collegati"
                      >
                        📅 {cat.events_count}
                      </span>
                    </div>
                  </td>

                  {/* 7. Azioni */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {dirty ? (
                        <>
                          <button
                            type="button"
                            disabled={disabled || !currentName.trim()}
                            onClick={() => onSave(cat)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                            title="Salva modifiche"
                          >
                            <CheckIcon className="w-3 h-3" />
                            <span>Salva</span>
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onCancelDraft(cat.id)}
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
                          onClick={() => onDelete(cat.id, currentName)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title={`Elimina voce (${totalUses} elementi verranno scollegati)`}
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
