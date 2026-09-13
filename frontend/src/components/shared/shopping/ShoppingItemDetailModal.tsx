// src/components/shared/shopping/ShoppingItemDetailModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingListItem } from '@/types/shopping';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  EditIcon,
  TrashIcon,
  ShoppingIcon,
  CloseIcon,
} from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from './ShoppingUnitSelect';
import { ShoppingItemPriceHistoryPanel } from './ShoppingItemPriceHistoryPanel';
import { ShoppingItemNoteEditor } from './ShoppingItemNoteEditor';
import { ShoppingItemPriceAnalysisCard } from './ShoppingItemPriceAnalysisCard';
import { useShoppingItemDetailStats } from './item';

export interface ShoppingItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingListItem | null;
  onEditClick: (item: ShoppingListItem) => void;
  onDeleteClick: (item: ShoppingListItem) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const ShoppingItemDetailModal: React.FC<ShoppingItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEditClick,
  onDeleteClick,
  canEdit = true,
  canDelete = true,
}) => {
  const {
    view,
    setView,
    personalBatches,
    communityPrices,
    isLoadingHistory,
    currentStats,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditingNote,
    setIsEditingNote,
    noteText,
    setNoteText,
    isSavingNote,
    handleSaveNote,
    handleCancelNote,
    handleDeleteConfirm,
  } = useShoppingItemDetailStats({
    isOpen,
    item,
    onDeleteClick,
    onClose,
  });

  if (!isOpen || !item) return null;

  const formattedProductName = capitalizeFirstLetter(item.productName);
  const unitLabel = formatUnitForQuantity(item.unitCodeName, item.quantity);

  const modalContent = (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 pointer-events-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="flex flex-col md:flex-row gap-4 items-stretch w-full max-w-5xl justify-center pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pannello Sinistro: Storico Prezzi & Analisi Integrata */}
        <ShoppingItemPriceHistoryPanel
          view={view}
          onViewChange={setView}
          personalBatches={personalBatches}
          communityPrices={communityPrices}
          isLoading={isLoadingHistory}
          currentStats={currentStats}
        />

        {/* Pannello Destro: Scheda Articolo & Dettagli */}
        <div className="pointer-events-auto flex-shrink-0 w-full md:w-96 flex flex-col justify-between gap-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col justify-between flex-1">
            <div className="space-y-4">
              
              {/* Header con Badge da Comprare ed Azioni */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <ShoppingIcon className="w-3.5 h-3.5" />
                  <span>Da Comprare</span>
                </span>

                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditClick(item);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Modifica articolo"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Elimina articolo"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Chiudi"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informazioni Prodotto */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h2 className="text-xl font-black text-gray-900 leading-tight truncate min-w-0 flex-1" title={formattedProductName}>
                      {formattedProductName}
                    </h2>
                    {item.brandName && (
                      <span className="text-sm px-2.5 py-0.5 rounded-lg font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        {item.brandName}
                      </span>
                    )}
                  </div>
                  {item.groupName && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      Lista: <span className="font-semibold text-gray-600">{item.listName}</span> • Gruppo: <span className="font-semibold text-gray-600">{item.groupName}</span>
                    </p>
                  )}
                </div>

                {item.quantity != null && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Quantità:
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                      {item.quantity} {unitLabel}
                    </span>
                  </div>
                )}

                {/* Note del Prodotto */}
                <div className="pt-2 border-t border-gray-100">
                  <ShoppingItemNoteEditor
                    notes={item.notes}
                    isEditing={isEditingNote}
                    setIsEditing={setIsEditingNote}
                    noteText={noteText}
                    setNoteText={setNoteText}
                    isSaving={isSavingNote}
                    onSave={handleSaveNote}
                    onCancel={handleCancelNote}
                    canEdit={canEdit}
                  />
                </div>
              </div>

              {/* Scheda Analisi Prezzo Compatta */}
              <ShoppingItemPriceAnalysisCard currentStats={currentStats} view={view} />

            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Elimina Prodotto"
        message={`Sei sicuro di voler rimuovere "${formattedProductName}" dalla lista della spesa?`}
        confirmText="Elimina"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShoppingItemDetailModal;
