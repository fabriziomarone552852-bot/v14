// src/components/admin/media/AdminMediaPlatformsTable.tsx
import React from 'react';
import type { EnrichedAdminViewingPlatformItem } from './types';
import { CheckIcon, CloseIcon, TrashIcon } from '@/components/shared/utils/Icons';

interface AdminMediaPlatformsTableProps {
  items: EnrichedAdminViewingPlatformItem[];
  isDraftDirty: (id: number) => boolean;
  onDraftChange: (id: number, name: string) => void;
  onCancelDraft: (id: number) => void;
  onSave: (item: EnrichedAdminViewingPlatformItem) => void;
  onDelete: (id: number, name: string) => void;
  disabled?: boolean;
}

export const AdminMediaPlatformsTable: React.FC<AdminMediaPlatformsTableProps> = ({
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
        <div className="text-3xl">📺</div>
        <div className="text-xs font-bold text-slate-700">Nessuna piattaforma trovata</div>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Nessuna piattaforma di visione personalizzata corrisponde ai filtri impostati.
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
              <th className="py-2.5 px-3 min-w-[220px]">Nome Piattaforma</th>
              <th className="py-2.5 px-3 w-36 text-center">Visioni Collegate</th>
              <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const dirty = isDraftDirty(item.id);
              const currentName = item.draftName ?? item.name;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors text-xs border-b border-slate-100 ${
                    dirty
                      ? 'bg-amber-50/80 hover:bg-amber-100/60'
                      : 'hover:bg-sky-50/40 bg-white'
                  }`}
                >
                  {/* ID */}
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                    #{item.id}
                  </td>

                  {/* Utente */}
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                      👤 {item.username || `User #${item.user_id}`}
                    </span>
                  </td>

                  {/* Nome Piattaforma */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={currentName}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(item.id, e.target.value)}
                      placeholder="Nome piattaforma..."
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                    />
                  </td>

                  {/* Conteggio Visioni */}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.usage_count > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {item.usage_count > 0 ? `🎬 ${item.usage_count} visioni` : '0 visioni'}
                    </span>
                  </td>

                  {/* Azioni */}
                  <td className="py-2 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      {dirty ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onSave(item)}
                            disabled={disabled || !currentName.trim()}
                            title="Salva modifiche"
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition shadow-xs"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onCancelDraft(item.id)}
                            disabled={disabled}
                            title="Annulla modifiche"
                            className="p-1 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-40 transition"
                          >
                            <CloseIcon className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onDelete(item.id, item.name)}
                          disabled={disabled}
                          title="Elimina piattaforma (disaccoppia log)"
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 transition"
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
