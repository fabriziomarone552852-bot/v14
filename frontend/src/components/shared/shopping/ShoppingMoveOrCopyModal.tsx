// src/components/shared/shopping/ShoppingMoveOrCopyModal.tsx
import React, { useState, useMemo } from 'react';
import {
  CloseIcon,
  CheckIcon,
  SearchIcon,
  TaskListIcon,
  UsersIcon,
  ForwardIcon,
} from '@/components/shared/utils/Icons';
import type { ShoppingListSummary, ShoppingGroupSummary } from '@/types/shopping';

export interface ShoppingMoveOrCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'move' | 'copy';
  selectedItemCount: number;
  currentListId: number | null;
  lists: ShoppingListSummary[];
  groups?: ShoppingGroupSummary[];
  onConfirm: (targetListId: number) => Promise<void>;
}

export const ShoppingMoveOrCopyModal: React.FC<ShoppingMoveOrCopyModalProps> = ({
  isOpen,
  onClose,
  actionType,
  selectedItemCount,
  currentListId,
  lists,
  groups = [],
  onConfirm,
}) => {
  const [selectedTargetListId, setSelectedTargetListId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mappa dei nomi dei gruppi
  const groupNameMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const g of groups) {
      map.set(g.id, g.name);
    }
    return map;
  }, [groups]);

  // Filtro liste disponibili:
  // - Se 'move': escludi la lista corrente e preferisci liste aperte
  // - Se 'copy': escludi solo le liste chiuse (la copia deve andare in una lista aperta)
  const availableLists = useMemo(() => {
    let result = lists.filter((l) => {
      if (actionType === 'move' && l.id === currentListId) {
        return false;
      }
      // Per la destinazione di sposta/copia, escludiamo liste già completate/chiuse
      if (l.isCompleted) {
        return false;
      }
      return true;
    });

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((l) => {
        const name = (l.name || '').toLowerCase();
        const gName = (l.groupName || (l.groupId ? groupNameMap.get(l.groupId) : '') || '').toLowerCase();
        return name.includes(q) || gName.includes(q);
      });
    }

    return result;
  }, [lists, actionType, currentListId, searchQuery, groupNameMap]);

  // Suddivisione per Liste Personali e Liste di Gruppo
  const personalLists = useMemo(
    () => availableLists.filter((l) => !l.groupId),
    [availableLists]
  );

  const groupLists = useMemo(
    () => availableLists.filter((l) => Boolean(l.groupId)),
    [availableLists]
  );

  if (!isOpen) return null;

  const isMove = actionType === 'move';
  const itemLabel = selectedItemCount === 1 ? 'articolo' : 'articoli';
  const title = isMove
    ? `Sposta ${selectedItemCount} ${itemLabel} in un'altra lista`
    : `Copia ${selectedItemCount} ${itemLabel} in un'altra lista`;

  const handleConfirmSubmit = async () => {
    if (!selectedTargetListId) return;
    try {
      setIsSubmitting(true);
      await onConfirm(selectedTargetListId);
      onClose();
    } finally {
      setIsSubmitting(false);
      setSelectedTargetListId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">
        {/* HEADER MODALE */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isMove
                  ? 'bg-blue-50 border border-blue-200 text-blue-600'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
              }`}
            >
              {isMove ? (
                <ForwardIcon className="w-5 h-5 text-blue-600" />
              ) : (
                <TaskListIcon className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">{title}</h3>
              <p className="text-[11px] text-gray-500 truncate">
                {isMove
                  ? 'Gli articoli verranno trasferiti nella nuova lista'
                  : 'Verrà creata una copia degli articoli nella lista scelta'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* CAMPO DI RICERCA LISTE */}
        <div className="p-3 border-b border-slate-100 shrink-0 bg-slate-50/60">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca lista di destinazione..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* ELENCO LISTE SELEZIONABILI */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar space-y-3">
          {availableLists.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs">
              Nessuna lista aperta disponibile come destinazione.
            </div>
          ) : (
            <>
              {/* 1. Liste Personali */}
              {personalLists.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <TaskListIcon className="w-3 h-3" />
                    <span>Liste Personali</span>
                  </div>
                  <div className="space-y-1">
                    {personalLists.map((l) => {
                      const isSelected = selectedTargetListId === l.id;
                      return (
                        <div
                          key={l.id}
                          onClick={() => setSelectedTargetListId(l.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-500 shadow-xs'
                              : 'border-gray-200 bg-white hover:bg-slate-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <CheckIcon className="w-2.5 h-2.5" />}
                            </div>
                            <span className="truncate">{l.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {l.openItemsCount} da comprare
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Liste dei Gruppi */}
              {groupLists.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <UsersIcon className="w-3 h-3" />
                    <span>Liste Condivise / Gruppi</span>
                  </div>
                  <div className="space-y-1">
                    {groupLists.map((l) => {
                      const isSelected = selectedTargetListId === l.id;
                      const gName = l.groupName || (l.groupId ? groupNameMap.get(l.groupId) : '');
                      return (
                        <div
                          key={l.id}
                          onClick={() => setSelectedTargetListId(l.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-500 shadow-xs'
                              : 'border-gray-200 bg-white hover:bg-slate-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <CheckIcon className="w-2.5 h-2.5" />}
                            </div>
                            <div className="min-w-0 flex items-center gap-1.5">
                              <span className="truncate">{l.name}</span>
                              {gName && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium truncate">
                                  {gName}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {l.openItemsCount} da comprare
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER AZIONI */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/70 rounded-xl transition cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirmSubmit}
            disabled={!selectedTargetListId || isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer ${
              !selectedTargetListId || isSubmitting
                ? 'bg-gray-400 opacity-60 cursor-not-allowed'
                : isMove
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? (
              <span>Elaborazione...</span>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>{isMove ? 'Conferma Spostamento' : 'Conferma Copia'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingMoveOrCopyModal;
