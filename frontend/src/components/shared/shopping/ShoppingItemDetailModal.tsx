// src/components/shared/shopping/ShoppingItemDetailModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingListItem, ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  ShoppingIcon,
  CloseIcon,
} from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from './ShoppingUnitSelect';
import { fetchItemBatches, fetchCommunityPrices } from '@/api/shoppingApi';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { computePriceStatistics } from './shoppingPriceUtils';
import { ShoppingItemPriceHistoryPanel } from './ShoppingItemPriceHistoryPanel';
import { ShoppingItemNoteEditor } from './ShoppingItemNoteEditor';
import { ShoppingItemPriceAnalysisCard, type PriceStatsData } from './ShoppingItemPriceAnalysisCard';

interface ShoppingItemDetailModalProps {
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

const ShoppingItemDetailModal: React.FC<ShoppingItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEditClick,
  onDeleteClick,
  canEdit = true,
  canDelete = true,
}) => {
  const mutations = useShoppingMutations();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [view, setView] = useState<'personal' | 'community'>('personal');
  const [personalBatches, setPersonalBatches] = useState<ItemBatchRecord[]>([]);
  const [communityPrices, setCommunityPrices] = useState<CommunityPriceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (item) {
      setNoteText(item.notes || '');
      setIsEditingNote(false);
    }
  }, [item?.id, item?.notes]);

  useEffect(() => {
    if (!isOpen || !item) {
      setPersonalBatches([]);
      setCommunityPrices([]);
      return;
    }
    const load = async () => {
      setIsLoadingHistory(true);
      try {
        const [batches, community] = await Promise.all([
          fetchItemBatches(item.id),
          item.productId ? fetchCommunityPrices(item.productId) : Promise.resolve([]),
        ]);
        setPersonalBatches(batches);
        setCommunityPrices(community);
      } catch {
        // silently fail
      } finally {
        setIsLoadingHistory(false);
      }
    };
    load();
  }, [isOpen, item?.id, item?.productId, item?.brandId, item?.isPurchased]);

  const currentStats = useMemo<PriceStatsData | null>(() => {
    const rawList = view === 'personal' ? personalBatches : communityPrices;
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - 365);

    const stats = computePriceStatistics(rawList, cutoffDate);
    if (stats.count === 0) return null;

    const defaultUnit = item ? formatUnitForQuantity(item.unitCodeName, 1) || 'unità' : 'unità';
    const unit = stats.bestUnit || defaultUnit;

    return {
      avg: stats.avg ?? 0,
      bestPrice: stats.bestPrice ?? 0,
      bestSupplier: stats.bestSupplier,
      bestDate: stats.bestDate,
      unit,
      count: stats.count,
    };
  }, [view, personalBatches, communityPrices, item]);

  if (!isOpen || !item) return null;

  const handleDeleteConfirm = () => {
    onDeleteClick(item);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const handleSaveNote = async () => {
    if (!item) return;
    const cleanNote = noteText.trim();
    setIsEditingNote(false);
    if (cleanNote === (item.notes || '').trim()) return;

    setIsSavingNote(true);
    try {
      await mutations.updateItem({
        id: item.id,
        listId: item.shoppingListId,
        data: { notes: cleanNote || undefined },
      });
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCancelNote = () => {
    setNoteText(item?.notes || '');
    setIsEditingNote(false);
  };

  const statusBadge = item.isPurchased ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircleIcon className="w-3.5 h-3.5" />
      <span>Acquistato</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <ShoppingIcon className="w-3.5 h-3.5 text-amber-600" />
      <span>Da Comprare</span>
    </span>
  );

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
        {/* Pannello Sinistro: Storico Prezzi */}
        <ShoppingItemPriceHistoryPanel
          view={view}
          onViewChange={setView}
          personalBatches={personalBatches}
          communityPrices={communityPrices}
          isLoading={isLoadingHistory}
        />

        {/* Pannello Destro: Scheda Articolo */}
        <div className="pointer-events-auto flex-shrink-0 w-full md:w-96 flex flex-col justify-between gap-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col justify-between flex-1">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                {statusBadge}
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditClick(item);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Modifica prodotto"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Elimina prodotto"
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

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-gray-900 leading-tight">
                    {formattedProductName}
                  </h2>
                  {item.brandName && (
                    <span className="text-sm px-2.5 py-0.5 rounded-lg font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.brandName}
                    </span>
                  )}
                </div>
                {item.groupName && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Lista: <span className="font-semibold text-gray-600">{item.listName}</span> • Gruppo: <span className="font-semibold text-gray-600">{item.groupName}</span>
                  </p>
                )}
              </div>

              {item.quantity != null && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Quantità Richiesta:
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                    {item.quantity} {unitLabel}
                  </span>
                </div>
              )}

              {/* Note del Prodotto */}
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

            {/* Statistiche Prezzo */}
            <ShoppingItemPriceAnalysisCard
              currentStats={currentStats}
              view={view}
            />
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
