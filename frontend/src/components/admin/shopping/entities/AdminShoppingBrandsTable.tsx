// src/components/admin/shopping/entities/AdminShoppingBrandsTable.tsx
import React from 'react';
import type { EnrichedBrandItem } from './types';
import { CheckIcon, CloseIcon } from '@/components/shared/utils/Icons';

interface AdminShoppingBrandsTableProps {
  brands: EnrichedBrandItem[];
  isDraftDirty: (id: number) => boolean;
  onDraftChange: (id: number, value: string) => void;
  onCancelDraft: (id: number) => void;
  onSave: (id: number, newName: string) => void;
  disabled?: boolean;
}

export const AdminShoppingBrandsTable: React.FC<AdminShoppingBrandsTableProps> = ({
  brands,
  isDraftDirty,
  onDraftChange,
  onCancelDraft,
  onSave,
  disabled = false,
}) => {
  if (brands.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 space-y-2">
        <div className="text-3xl">🔍</div>
        <div className="text-xs font-bold text-slate-700">Nessuna marca trovata</div>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Nessun brand corrisponde ai criteri di ricerca impostati.
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
              <th className="py-2.5 px-3 min-w-[240px]">Nome Marca / Produttore</th>
              <th className="py-2.5 px-3 w-36 text-center">Prodotti Collegati</th>
              <th className="py-2.5 px-3 w-36 text-center">Acquisti Registrati</th>
              <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brands.map((brand) => {
              const dirty = isDraftDirty(brand.id);
              const currentName = brand.draftName ?? brand.name ?? brand.nameNormalized ?? '';

              return (
                <tr
                  key={brand.id}
                  className={`transition-colors text-xs border-b border-slate-100 ${
                    dirty
                      ? 'bg-amber-50/80 hover:bg-amber-100/60'
                      : 'hover:bg-sky-50/40 bg-white'
                  }`}
                >
                  {/* 1. ID */}
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                    #{brand.id}
                  </td>

                  {/* 2. Nome Marca Editabile */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={currentName}
                      disabled={disabled}
                      onChange={(e) => onDraftChange(brand.id, e.target.value)}
                      placeholder="Nome marca..."
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                    />
                  </td>

                  {/* 3. Prodotti Collegati */}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold ${
                        brand.productCount > 0
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50'
                      }`}
                    >
                      {brand.productCount} {brand.productCount === 1 ? 'prodotto' : 'prodotti'}
                    </span>
                  </td>

                  {/* 4. Acquisti / Lotti Registrati */}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold ${
                        brand.batchCount > 0
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50'
                      }`}
                    >
                      {brand.batchCount} {brand.batchCount === 1 ? 'lotto' : 'lotti'}
                    </span>
                  </td>

                  {/* 5. Azioni */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    {dirty ? (
                      <div className="flex items-center justify-center gap-1.5 animate-fadeIn">
                        <button
                          type="button"
                          disabled={disabled || !currentName.trim()}
                          onClick={() => onSave(brand.id, currentName.trim())}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                          title="Salva nuova denominazione marca"
                        >
                          <CheckIcon className="w-3 h-3" />
                          <span>Salva</span>
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onCancelDraft(brand.id)}
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
