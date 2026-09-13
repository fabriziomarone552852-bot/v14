// src/mobile/components/modals/shopping/item/useMobileShoppingItemDetailLogic.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ShoppingListItem, ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import { fetchItemBatches, fetchCommunityPrices } from '@/api/shoppingApi';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { computePriceStatistics } from '@/components/shared/shopping/shoppingPriceUtils';
import type { PriceStatsData } from '@/components/shared/shopping/ShoppingItemPriceAnalysisCard';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';

export interface UseMobileShoppingItemDetailLogicProps {
  isOpen: boolean;
  item: ShoppingListItem | null;
  onDeleteClick: (item: ShoppingListItem) => void;
  onClose: () => void;
}

export function useMobileShoppingItemDetailLogic({
  isOpen,
  item,
  onDeleteClick,
  onClose,
}: UseMobileShoppingItemDetailLogicProps) {
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

  const handleDeleteConfirm = useCallback(() => {
    if (!item) return;
    onDeleteClick(item);
    setIsDeleteDialogOpen(false);
    onClose();
  }, [item, onDeleteClick, onClose]);

  const handleSaveNote = useCallback(async () => {
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
  }, [item, noteText, mutations]);

  const handleCancelNote = useCallback(() => {
    setNoteText(item?.notes || '');
    setIsEditingNote(false);
  }, [item?.notes]);

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    view,
    setView,
    personalBatches,
    communityPrices,
    isLoadingHistory,
    isEditingNote,
    setIsEditingNote,
    noteText,
    setNoteText,
    isSavingNote,
    currentStats,
    handleDeleteConfirm,
    handleSaveNote,
    handleCancelNote,
  };
}
