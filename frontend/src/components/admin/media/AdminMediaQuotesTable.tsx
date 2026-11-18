// src/components/admin/media/AdminMediaQuotesTable.tsx
import React from 'react';
import type { EnrichedAdminMediaQuoteItem } from './types';
import { CheckIcon, CloseIcon, TrashIcon } from '@/components/shared/utils/Icons';

interface AdminMediaQuotesTableProps {
  items: EnrichedAdminMediaQuoteItem[];
  isDraftDirty: (mediaType: 'tv' | 'movie', id: number) => boolean;
  onDraftChange: (mediaType: 'tv' | 'movie', id: number, text: string) => void;
  onCancelDraft: (mediaType: 'tv' | 'movie', id: number) => void;
  onSave: (item: EnrichedAdminMediaQuoteItem) => void;
  onDelete: (mediaType: 'tv' | 'movie', id: number) => void;
  disabled?: boolean;
}

export const AdminMediaQuotesTable: React.FC<AdminMediaQuotesTableProps> = ({
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
        <div className="text-3xl">💬</div>
        <div className="text-xs font-bold text-slate-700">Nessuna citazione trovata</div>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Nessuna citazione corrisponde ai filtri impostati.
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
              <th className="py-2.5 px-3 w-24 text-center">Tipo</th>
              <th className="py-2.5 px-3 w-48">Opera / Episodio</th>
              <th className="py-2.5 px-3 w-36">Utente</th>
              <th className="py-2.5 px-3 min-w-[280px]">Testo Citazione</th>
              <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const dirty = isDraftDirty(item.media_type, item.id);
              const currentText = item.draftQuoteText ?? item.quote_text;

              return (
                <tr
                  key={`${item.media_type}_${item.id}`}
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

                  {/* Tipo (TV / Film) */}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.media_type === 'tv'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.media_type === 'tv' ? '📺 Serie TV' : '🎬 Film'}
                    </span>
                  </td>

                  {/* Opera / Episodio */}
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-800 line-clamp-2" title={item.media_title}>
                      {item.media_title}
                    </div>
                  </td>

                  {/* Utente */}
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                      👤 {item.username || `User #${item.user_id}`}
                    </span>
                  </td>

                  {/* Testo Citazione */}
                  <td className="py-2 px-3">
                    <textarea
                      rows={2}
                      value={currentText}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(item.media_type, item.id, e.target.value)}
                      placeholder="Testo della citazione..."
                      className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition resize-y italic"
                    />
                  </td>

                  {/* Azioni */}
                  <td className="py-2 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      {dirty ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onSave(item)}
                            disabled={disabled || !currentText.trim()}
                            title="Salva modifiche"
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition shadow-xs"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onCancelDraft(item.media_type, item.id)}
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
                          onClick={() => onDelete(item.media_type, item.id)}
                          disabled={disabled}
                          title="Elimina citazione"
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
