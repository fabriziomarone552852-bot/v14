// src/components/shared/shopping/ShoppingListDetailModal.tsx
import React, { useState } from 'react';
import type { ShoppingListSummary } from '@/types/shopping';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  ShoppingIcon,
  LockIcon,
  UsersIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';

interface ShoppingListDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingListSummary | null;
  onEditClick: (list: ShoppingListSummary) => void;
  onDeleteClick: (list: ShoppingListSummary) => void;
  onToggleComplete?: (list: ShoppingListSummary, isCompleted: boolean) => Promise<void> | void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ShoppingListDetailModal: React.FC<ShoppingListDetailModalProps> = ({
  isOpen,
  onClose,
  list,
  onEditClick,
  onDeleteClick,
  onToggleComplete,
  canEdit = true,
  canDelete = true,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!isOpen || !list) return null;

  const isGroup = Boolean(list.groupId || list.groupName);

  const handleDeleteConfirm = () => {
    onDeleteClick(list);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const headerActions = (
    <div className="flex items-center gap-1">
      {canEdit && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onEditClick(list);
          }}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="Modifica lista"
        >
          <EditIcon className="w-5 h-5" />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Elimina lista"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Elimina Lista Spesa"
        message={`Sei sicuro di voler eliminare la lista "${list.name}" e tutti i suoi articoli?`}
        confirmText="Elimina"
        isDestructive={true}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2 text-base font-bold text-gray-800">
            <ShoppingIcon className="w-5 h-5 text-blue-600" />
            <span className="truncate">{list.name}</span>
          </span>
        }
        headerActions={headerActions}
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          {/* Badge di Stato e Condivisione */}
          <div className="flex flex-wrap items-center gap-2">
            {list.isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Completata
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <ShoppingIcon className="w-3.5 h-3.5" />
                In corso
              </span>
            )}

            {isGroup ? (
              <span className="inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                <UsersIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>{list.groupName || 'Gruppo condiviso'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                <LockIcon className="w-3.5 h-3.5 text-gray-400" />
                <span>Privata</span>
              </span>
            )}
          </div>

          {/* Descrizione / Note della Lista */}
          {list.description ? (
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Descrizione / Note
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {list.description}
              </p>
            </div>
          ) : null}

          {/* Statistiche Articoli */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{list.totalItemsCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
                Totali
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-center">
              <p className="text-xl font-bold text-amber-800">{list.openItemsCount}</p>
              <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mt-0.5">
                Da Comprare
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
              <p className="text-xl font-bold text-emerald-800">{list.purchasedItemsCount}</p>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">
                Acquistati
              </p>
            </div>
          </div>

          {/* Tasto Rapido per Completare / Riaprire la Lista */}
          {onToggleComplete && canEdit && (
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              {list.isCompleted ? (
                <button
                  type="button"
                  onClick={() => onToggleComplete(list, false)}
                  className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Riapri Lista (Segna come Non Completata)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleComplete(list, true)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Segna Lista come Completata</span>
                </button>
              )}
            </div>
          )}
        </div>
      </BaseModal>
    </>
  );
};

export default ShoppingListDetailModal;
