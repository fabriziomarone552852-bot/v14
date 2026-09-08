// src/mobile/components/shopping/MobileShoppingListSelector.tsx
import React, { useState } from 'react';
import type {
  ShoppingGroupSummary,
  ShoppingListSummary,
} from '@/types/shopping';
import {
  ShoppingIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  SettingsIcon,
} from '@/components/shared/utils/Icons';
import { MoreVertical } from 'lucide-react';
import { getRoleBadgeClass } from '@/components/shared/shopping/shoppingUi';

interface MobileShoppingListSelectorProps {
  activeList: ShoppingListSummary | null;
  activeGroup: ShoppingGroupSummary | null;
  onOpenPicker: () => void;
  onEditList: (list: ShoppingListSummary) => void;
  onDeleteList: (list: ShoppingListSummary) => void;
  onToggleCompleteList: (list: ShoppingListSummary, isCompleted: boolean) => void;
  onOpenGroupDetail: (group: ShoppingGroupSummary) => void;
}

export const MobileShoppingListSelector: React.FC<MobileShoppingListSelectorProps> = ({
  activeList,
  activeGroup,
  onOpenPicker,
  onEditList,
  onDeleteList,
  onToggleCompleteList,
  onOpenGroupDetail,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full shrink-0 relative z-20 bg-white border border-gray-200/90 rounded-2xl shadow-2xs">
      {/* SCOMPARTO 1: Barra compatta (al tocco apre la vista espansa) */}
      <div className="p-2.5 flex items-center justify-between gap-2">
        
        {/* Tasto principale per aprire la vista espansa gruppi e liste */}
        <button
          type="button"
          onClick={onOpenPicker}
          className="flex-1 min-w-0 flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
          aria-label="Apri selettore gruppo e lista"
        >
          {/* Badge Icona / Tipo Lista */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-active:scale-95 bg-blue-50 text-blue-600 border border-blue-100">
            {activeGroup ? (
              <span className="text-base">{activeGroup.icon || '👥'}</span>
            ) : (
              <ShoppingIcon className="w-5 h-5 text-blue-600" />
            )}
          </div>

          {/* Nome Lista e Dettagli Gruppo/Ruolo su due righe */}
          <div className="min-w-0 flex-1">
            {/* Riga 1: Nome Lista & Completata */}
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-sm font-extrabold text-gray-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                {activeList ? activeList.name : 'Nessuna Lista Selezionata'}
              </h2>
              {activeList?.isCompleted && (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Completata
                </span>
              )}
            </div>

            {/* Riga 2: Badge Gruppo e Badge Ruolo */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {activeList ? (
                activeGroup ? (
                  <>
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-blue-100/70 text-blue-700 border border-blue-200/60 truncate max-w-[160px]">
                      {activeGroup.icon ? `${activeGroup.icon} ` : ''}{activeGroup.name}
                    </span>
                    {activeGroup?.userRole && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${getRoleBadgeClass(
                          activeGroup.userRole
                        )}`}
                      >
                        {activeGroup.userRole}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                    Private
                  </span>
                )
              ) : (
                <span className="text-xs text-gray-400 font-normal">Tocca per scegliere o creare una lista</span>
              )}
            </div>
          </div>
        </button>

        {/* Menu Rapido Opzioni Lista Corrente (3 puntini) */}
        {activeList && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg active:scale-95 transition-all cursor-pointer"
              title="Opzioni lista"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Menu a comparsa opzioni lista */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 z-50 w-52 bg-white rounded-2xl shadow-2xl border border-gray-200 py-1.5 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEditList(activeList);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
                  >
                    <EditIcon className="w-4 h-4 text-gray-500" />
                    <span>Modifica Nome Lista</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleCompleteList(activeList, !activeList.isCompleted);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>
                      {activeList.isCompleted ? 'Riapri Lista' : 'Segna come Completata'}
                    </span>
                  </button>

                  {activeGroup && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenGroupDetail(activeGroup);
                      }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-blue-600" />
                      <span>Gestisci Gruppo "{activeGroup.name}"</span>
                    </button>
                  )}

                  {activeList.canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDeleteList(activeList);
                      }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 text-left border-t border-gray-100 cursor-pointer transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                      <span>Elimina Lista</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileShoppingListSelector;
