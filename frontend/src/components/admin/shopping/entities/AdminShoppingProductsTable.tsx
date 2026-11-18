// src/components/admin/shopping/entities/AdminShoppingProductsTable.tsx
import React from 'react';
import type { EnrichedProductItem } from './types';
import { TagIcon, CheckIcon, CloseIcon } from '@/components/shared/utils/Icons';

interface AdminShoppingProductsTableProps {
  products: EnrichedProductItem[];
  isDraftDirty: (id: number) => boolean;
  onDraftChange: (id: number, value: string) => void;
  onCancelDraft: (id: number) => void;
  onSave: (id: number, newName: string) => void;
  disabled?: boolean;
}

export const AdminShoppingProductsTable: React.FC<AdminShoppingProductsTableProps> = ({
  products,
  isDraftDirty,
  onDraftChange,
  onCancelDraft,
  onSave,
  disabled = false,
}) => {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 space-y-2">
        <div className="text-3xl">🔍</div>
        <div className="text-xs font-bold text-slate-700">Nessun articolo trovato</div>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Nessun articolo del catalogo corrisponde ai criteri di ricerca impostati.
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
              <th className="py-2.5 px-3 min-w-[260px]">Descrizione / Nome Articolo</th>
              <th className="py-2.5 px-3 min-w-[180px]">Brand / Marchi Associati</th>
              <th className="py-2.5 px-3 w-28 text-center">Acquisti</th>
              <th className="py-2.5 px-3 w-28 text-right">Ultimo Prezzo</th>
              <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((prod) => {
              const dirty = isDraftDirty(prod.id);
              const currentName = prod.draftName ?? prod.displayName ?? prod.nameNormalized;
              const hasBatches = prod.batchCount > 0;

              return (
                <tr
                  key={prod.id}
                  className={`transition-colors text-xs border-b border-slate-100 ${
                    dirty
                      ? 'bg-amber-50/80 hover:bg-amber-100/60'
                      : 'hover:bg-sky-50/40 bg-white'
                  }`}
                >
                  {/* 1. ID */}
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                    #{prod.id}
                  </td>

                  {/* 2. Descrizione Articolo Editabile */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentName}
                        disabled={disabled}
                        onChange={(e) => onDraftChange(prod.id, e.target.value)}
                        placeholder="Nome articolo nel catalogo..."
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                      />
                    </div>
                  </td>

                  {/* 3. Brand / Marchi Associati */}
                  <td className="py-2 px-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {prod.productBrands && prod.productBrands.length > 0 ? (
                        prod.productBrands.map((pb) => (
                          <span
                            key={pb.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[10px] font-bold"
                          >
                            <TagIcon className="w-2.5 h-2.5" />
                            {pb.brand?.nameNormalized || `Brand #${pb.brandId}`}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Nessun brand associato</span>
                      )}
                    </div>
                  </td>

                  {/* 4. Conteggio Acquisti / Lotti */}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold ${
                        hasBatches
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50'
                      }`}
                      title={hasBatches ? `${prod.batchCount} lotti registrati nello storico` : 'Nessun acquisto'}
                    >
                      {prod.batchCount} {prod.batchCount === 1 ? 'lotto' : 'lotti'}
                    </span>
                  </td>

                  {/* 5. Ultimo Prezzo */}
                  <td className="py-2 px-3 text-right font-mono text-[11px]">
                    {prod.lastPurchasePrice != null && prod.lastPurchasePrice > 0 ? (
                      <span className="font-extrabold text-slate-800">
                        € {Number(prod.lastPurchasePrice).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* 6. Azioni Rinomina */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    {dirty ? (
                      <div className="flex items-center justify-center gap-1.5 animate-fadeIn">
                        <button
                          type="button"
                          disabled={disabled || !currentName.trim()}
                          onClick={() => onSave(prod.id, currentName.trim())}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                          title="Salva nuova denominazione"
                        >
                          <CheckIcon className="w-3 h-3" />
                          <span>Salva</span>
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onCancelDraft(prod.id)}
                          className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                          title="Annulla modifiche"
                        >
                          <CloseIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Invariato</span>
                    )}
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
