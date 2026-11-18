// src/components/admin/shopping/entities/AdminShoppingListsGroupsTable.tsx
import React, { useState } from 'react';
import type { EnrichedListItem, EnrichedGroupItem } from './types';
import { CheckIcon, CloseIcon, TaskListIcon, UsersIcon } from '@/components/shared/utils/Icons';

interface AdminShoppingListsGroupsTableProps {
  lists: EnrichedListItem[];
  groups: EnrichedGroupItem[];
  isDraftDirty: (entityType: 'lists' | 'groups', id: number) => boolean;
  onDraftChange: (entityType: 'lists' | 'groups', id: number, field: 'name' | 'description', value: string) => void;
  onCancelDraft: (entityType: 'lists' | 'groups', id: number) => void;
  onSaveList: (id: number, name: string, description?: string) => void;
  onSaveGroup: (id: number, name: string, description?: string) => void;
  disabled?: boolean;
}

export const AdminShoppingListsGroupsTable: React.FC<AdminShoppingListsGroupsTableProps> = ({
  lists,
  groups,
  isDraftDirty,
  onDraftChange,
  onCancelDraft,
  onSaveList,
  onSaveGroup,
  disabled = false,
}) => {
  const [subView, setSubView] = useState<'lists' | 'groups'>('lists');

  return (
    <div className="space-y-4">
      {/* Switch secondario Liste / Gruppi */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200/80">
        <button
          type="button"
          onClick={() => setSubView('lists')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            subView === 'lists'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TaskListIcon className="w-3.5 h-3.5" />
          <span>Liste della Spesa ({lists.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubView('groups')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            subView === 'groups'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UsersIcon className="w-3.5 h-3.5" />
          <span>Gruppi Familiari ({groups.length})</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10 select-none">
              <tr>
                <th className="py-2.5 px-3 w-16"># ID</th>
                <th className="py-2.5 px-3 min-w-[200px]">Nome Denominazione</th>
                <th className="py-2.5 px-3 min-w-[260px]">Descrizione / Note</th>
                {subView === 'lists' && <th className="py-2.5 px-3 w-28 text-center">Articoli</th>}
                <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subView === 'lists' ? (
                lists.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Nessuna lista trovata.
                    </td>
                  </tr>
                ) : (
                  lists.map((l) => {
                    const dirty = isDraftDirty('lists', l.id);
                    const currentName = l.draftName ?? l.name;
                    const currentDesc = l.draftDescription ?? l.description ?? '';

                    return (
                      <tr
                        key={l.id}
                        className={`transition-colors text-xs border-b border-slate-100 ${
                          dirty
                            ? 'bg-amber-50/80 hover:bg-amber-100/60'
                            : 'hover:bg-sky-50/40 bg-white'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                          #{l.id}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={currentName}
                            disabled={disabled}
                            onChange={(e) => onDraftChange('lists', l.id, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={currentDesc}
                            disabled={disabled}
                            onChange={(e) => onDraftChange('lists', l.id, 'description', e.target.value)}
                            placeholder="Descrizione opzionale..."
                            className="w-full px-2.5 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {l.itemCount}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {dirty ? (
                            <div className="flex items-center justify-center gap-1.5 animate-fadeIn">
                              <button
                                type="button"
                                disabled={disabled || !currentName.trim()}
                                onClick={() => onSaveList(l.id, currentName.trim(), currentDesc.trim() || undefined)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                              >
                                <CheckIcon className="w-3 h-3" />
                                <span>Salva</span>
                              </button>
                              <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onCancelDraft('lists', l.id)}
                                className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition cursor-pointer"
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
                  })
                )
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Nessun gruppo trovato.
                  </td>
                </tr>
              ) : (
                groups.map((g) => {
                  const dirty = isDraftDirty('groups', g.id);
                  const currentName = g.draftName ?? g.name;
                  const currentDesc = g.draftDescription ?? g.description ?? '';

                  return (
                    <tr
                      key={g.id}
                      className={`transition-colors text-xs border-b border-slate-100 ${
                        dirty
                          ? 'bg-amber-50/80 hover:bg-amber-100/60'
                          : 'hover:bg-sky-50/40 bg-white'
                      }`}
                    >
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                        #{g.id}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={currentName}
                          disabled={disabled}
                          onChange={(e) => onDraftChange('groups', g.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={currentDesc}
                          disabled={disabled}
                          onChange={(e) => onDraftChange('groups', g.id, 'description', e.target.value)}
                          placeholder="Descrizione opzionale..."
                          className="w-full px-2.5 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-xl bg-white/95 outline-none focus:border-sky-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        {dirty ? (
                          <div className="flex items-center justify-center gap-1.5 animate-fadeIn">
                            <button
                              type="button"
                              disabled={disabled || !currentName.trim()}
                              onClick={() => onSaveGroup(g.id, currentName.trim(), currentDesc.trim() || undefined)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                            >
                              <CheckIcon className="w-3 h-3" />
                              <span>Salva</span>
                            </button>
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => onCancelDraft('groups', g.id)}
                              className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition cursor-pointer"
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
