// src/mobile/components/modals/shopping/MobileShoppingItemDetailModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { ShoppingListItem, ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  ShoppingIcon,
} from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import { fetchItemBatches, fetchCommunityPrices } from '@/api/shoppingApi';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { computePriceStatistics } from '@/components/shared/shopping/shoppingPriceUtils';
import { ShoppingItemPriceHistoryPanel } from '@/components/shared/shopping/ShoppingItemPriceHistoryPanel';
import { ShoppingItemNoteEditor } from '@/components/shared/shopping/ShoppingItemNoteEditor';
import type { PriceStatsData } from '@/components/shared/shopping/ShoppingItemPriceAnalysisCard';

interface MobileShoppingItemDetailModalProps {
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

export const MobileShoppingItemDetailModal: React.FC<MobileShoppingItemDetailModalProps> = ({
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

  const formattedProductName = capitalizeFirstLetter(item.productName);
  const unitLabel = formatUnitForQuantity(item.unitCodeName, item.quantity);

  const statusBadge = item.isPurchased ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircleIcon className="w-3.5 h-3.5" />
      <span>Acquistato</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <ShoppingIcon className="w-3.5 h-3.5 text-amber-600" />
      <span>Da Comprare</span>
    </span>
  );

  const headerActions = (
    <div className="flex items-center gap-1">
      {canEdit && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onEditClick(item);
          }}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="Modifica"
        >
          <EditIcon className="w-5 h-5" />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Elimina"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={statusBadge}
        headerActions={headerActions}
      >
        <div className="space-y-4 max-w-lg mx-auto pb-4">
          
          {/* Scheda Principale Articolo (Nome, Brand, Quantità, Ultimo Prezzo e Note) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                  {formattedProductName}
                </h2>
                {item.brandName && (
                  <span className="text-xs font-semibold text-gray-500 block mt-0.5">
                    {item.brandName}
                  </span>
                )}
              </div>

              {item.quantity != null && (
                <div className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-100 text-right shrink-0">
                  <span className="text-xs font-bold text-blue-700">
                    {item.quantity} {unitLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Ultimo Prezzo Noto */}
            {item.lastPrice != null && (
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Ultimo prezzo registrato:</span>
                <span className="font-extrabold text-emerald-600">
                  {item.lastPrice.toFixed(2)} {item.lastCurrencyCodeName || 'EUR'}
                </span>
              </div>
            )}

            {/* Note Editor Touch integrato */}
            <div className="pt-2 border-t border-gray-100">
              <ShoppingItemNoteEditor
                notes={item.notes}
                isEditing={isEditingNote}
                setIsEditing={setIsEditingNote}
                noteText={noteText}
                setNoteText={setNoteText}
                isSaving={isSavingNote}
                canEdit={canEdit}
                onSave={handleSaveNote}
                onCancel={handleCancelNote}
              />
            </div>
          </div>

          {/* Storico & Analisi Prezzi in un unico riquadro */}
          <ShoppingItemPriceHistoryPanel
            view={view}
            onViewChange={setView}
            personalBatches={personalBatches}
            communityPrices={communityPrices}
            isLoading={isLoadingHistory}
            currentStats={currentStats}
          />

        </div>
      </MobileBaseModal>

      {/* Dialog Conferma Eliminazione */}
      {isDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Elimina Articolo"
          message={`Vuoi davvero rimuovere "${item.productName}" dalla lista?`}
          confirmText="Elimina"
          cancelText="Annulla"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  );
};

export default MobileShoppingItemDetailModal;
