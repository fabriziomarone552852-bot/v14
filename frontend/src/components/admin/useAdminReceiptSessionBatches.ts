// src/components/admin/useAdminReceiptSessionBatches.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ItemBatchRecord, ShoppingSupplierOption } from '@/types/shopping';
import {
  fetchAllInventoryBatches,
  updateInventoryBatch,
  deleteInventoryBatch,
} from '@/api/shopping/shoppingInventoryApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export interface UseAdminReceiptSessionBatchesProps {
  suppliers: ShoppingSupplierOption[];
  onCatalogReloadRequested?: () => void;
}

export const useAdminReceiptSessionBatches = ({
  suppliers,
  onCatalogReloadRequested,
}: UseAdminReceiptSessionBatchesProps) => {
  const [sessionBatches, setSessionBatches] = useState<ItemBatchRecord[]>([]);
  const [loadingSessionBatches, setLoadingSessionBatches] = useState<boolean>(false);
  const [editingBatch, setEditingBatch] = useState<ItemBatchRecord | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Caricamento iniziale dei lotti registrati oggi per la continuità della sessione
  const loadTodayBatches = useCallback(async () => {
    setLoadingSessionBatches(true);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const allBatches = await fetchAllInventoryBatches();
      // Filtra i lotti di oggi ordinati dal più recente (ID decrescente)
      const todays = allBatches
        .filter((b) => b.purchaseDate === todayStr)
        .sort((a, b) => b.id - a.id);

      setSessionBatches(todays);
    } catch {
      // Non bloccare in caso di errore di rete iniziale
    } finally {
      setLoadingSessionBatches(false);
    }
  }, []);

  useEffect(() => {
    loadTodayBatches();
  }, [loadTodayBatches]);

  // Aggiunge i lotti appena creati da uno scontrino
  const addSessionBatches = useCallback((newBatches: ItemBatchRecord[]) => {
    if (!newBatches || newBatches.length === 0) return;
    setSessionBatches((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const toAdd = newBatches.filter((b) => !existingIds.has(b.id));
      return [...toAdd, ...prev];
    });
  }, []);

  // Apertura modale di modifica
  const handleStartEditBatch = useCallback((batch: ItemBatchRecord) => {
    setEditingBatch(batch);
  }, []);

  const handleCloseEditBatch = useCallback(() => {
    setEditingBatch(null);
  }, []);

  // Salvataggio modifiche su un lotto esistente
  const handleSaveBatchEdit = useCallback(
    async (
      batchId: number,
      data: {
        purchasePrice: number;
        purchaseDate: string;
        quantityPurchased?: number;
        supplierId?: number | null;
        isOnSale: boolean;
        productName?: string;
        brandName?: string;
        brandId?: number | null;
        notes?: string;
        unitId?: number | null;
        shoppingListId?: number | null;
      }
    ) => {
      try {
        await updateInventoryBatch(batchId, {
          purchasePrice: data.purchasePrice,
          purchaseDate: data.purchaseDate,
          quantity: data.quantityPurchased,
          supplierId: data.supplierId,
          isOnSale: data.isOnSale,
          productName: data.productName,
          brandName: data.brandName,
          brandId: data.brandId,
          notes: data.notes,
          unitId: data.unitId,
          shoppingListId: data.shoppingListId,
        });

        // Aggiorna lo stato in memoria (Mazzo di Carte)
        setSessionBatches((prev) =>
          prev.map((b) => {
            if (b.id !== batchId) return b;
            const qty = data.quantityPurchased ?? b.quantityPurchased;
            const uPrice =
              qty > 0
                ? Math.round((data.purchasePrice / qty) * 100) / 100
                : data.purchasePrice;
            const sup = data.supplierId
              ? suppliers.find((s) => s.id === data.supplierId)
              : undefined;

            return {
              ...b,
              productName: data.productName ?? b.productName,
              brandName: data.brandName ?? b.brandName,
              brandId: data.brandId !== undefined ? data.brandId : b.brandId,
              supplierId: data.supplierId !== undefined ? data.supplierId : b.supplierId,
              supplierName: sup ? sup.name : b.supplierName,
              purchaseDate: data.purchaseDate,
              quantityPurchased: qty,
              purchasePrice: data.purchasePrice,
              unitPrice: uPrice,
              isOnSale: data.isOnSale,
              notes: data.notes ?? b.notes,
              unitId: data.unitId !== undefined ? data.unitId : b.unitId,
              shoppingListId:
                data.shoppingListId !== undefined
                  ? data.shoppingListId
                  : b.shoppingListId,
            };
          })
        );

        setFeedbackMessage({
          type: 'success',
          text: `Articolo aggiornato con successo!`,
        });

        onCatalogReloadRequested?.();
      } catch (err: unknown) {
        setFeedbackMessage({
          type: 'error',
          text: extractErrorMessage(err, 'Errore durante la modifica della registrazione.'),
        });
        throw err;
      }
    },
    [suppliers, onCatalogReloadRequested]
  );

  // Eliminazione di un lotto della sessione
  const handleDeleteSessionBatch = useCallback(
    async (batchId: number, productName?: string | null) => {
      const confirmMsg = productName
        ? `Sei sicuro di voler eliminare la registrazione per "${productName}"?`
        : 'Sei sicuro di voler eliminare questa registrazione?';

      if (!window.confirm(confirmMsg)) return;

      try {
        await deleteInventoryBatch(batchId);
        setSessionBatches((prev) => prev.filter((b) => b.id !== batchId));
        setFeedbackMessage({
          type: 'success',
          text: `Registrazione per "${productName || 'articolo'}" rimossa con successo.`,
        });
        if (editingBatch?.id === batchId) {
          setEditingBatch(null);
        }
        onCatalogReloadRequested?.();
      } catch (err: unknown) {
        setFeedbackMessage({
          type: 'error',
          text: extractErrorMessage(err, 'Errore durante l\'eliminazione della registrazione.'),
        });
      }
    },
    [editingBatch, onCatalogReloadRequested]
  );

  // Totali cumulativi della sessione
  const sessionSummary = useMemo(() => {
    let total = 0;
    sessionBatches.forEach((b) => {
      total += b.purchasePrice || 0;
    });
    return {
      count: sessionBatches.length,
      totalAmount: Math.round(total * 100) / 100,
    };
  }, [sessionBatches]);

  return {
    sessionBatches,
    loadingSessionBatches,
    editingBatch,
    feedbackMessage,
    setFeedbackMessage,
    sessionSummary,
    loadTodayBatches,
    addSessionBatches,
    handleStartEditBatch,
    handleCloseEditBatch,
    handleSaveBatchEdit,
    handleDeleteSessionBatch,
  };
};
