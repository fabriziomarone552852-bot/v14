// src/components/shared/shopping/ShoppingPurchasedItemDetailModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingListItem } from '@/types/shopping';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import { ShoppingItemPriceHistoryPanel } from './ShoppingItemPriceHistoryPanel';
import {
  usePurchasedItemDetailLogic,
  ShoppingPurchasedItemInfoSection,
} from './purchased';

export interface ShoppingPurchasedItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingListItem | null;
  onEditPurchase: (item: ShoppingListItem) => void;
  onDeleteClick: (item: ShoppingListItem) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ShoppingPurchasedItemDetailModal: React.FC<ShoppingPurchasedItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEditPurchase,
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
    latestBatch,
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
  } = usePurchasedItemDetailLogic({
    isOpen,
    item,
    onDeleteClick,
    onClose,
  });

  if (!isOpen || !item) return null;

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

        {/* Pannello Destro: Scheda Articolo Acquistato */}
        <ShoppingPurchasedItemInfoSection
          item={item}
          latestBatch={latestBatch}
          isLoadingHistory={isLoadingHistory}
          canEdit={canEdit}
          canDelete={canDelete}
          isEditingNote={isEditingNote}
          setIsEditingNote={setIsEditingNote}
          noteText={noteText}
          setNoteText={setNoteText}
          isSavingNote={isSavingNote}
          onSaveNote={handleSaveNote}
          onCancelNote={handleCancelNote}
          onEditPurchase={onEditPurchase}
          onOpenDelete={() => setIsDeleteDialogOpen(true)}
          onClose={onClose}
        />
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Elimina Prodotto"
        message={`Sei sicuro di voler rimuovere "${item.productName}" dalla lista della spesa?`}
        confirmText="Elimina"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShoppingPurchasedItemDetailModal;
