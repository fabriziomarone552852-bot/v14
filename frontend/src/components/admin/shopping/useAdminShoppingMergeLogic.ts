// src/components/admin/shopping/useAdminShoppingMergeLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ShoppingProductOption, ItemBatchRecord } from '@/types/shopping';
import {
  fetchShoppingProducts,
  mergeShoppingProducts,
} from '@/api/shopping/shoppingConfigApi';
import { fetchAllInventoryBatches } from '@/api/shopping/shoppingInventoryApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export interface UseAdminShoppingMergeLogicReturn {
  products: ShoppingProductOption[];
  sourceProductId: number | '';
  setSourceProductId: (id: number | '') => void;
  targetProductId: number | '';
  setTargetProductId: (id: number | '') => void;
  merging: boolean;
  loading: boolean;
  message: { text: string; type: 'success' | 'error' } | null;
  setMessage: (msg: { text: string; type: 'success' | 'error' } | null) => void;
  productBatchCounts: Record<number, number>;
  sourceProduct: ShoppingProductOption | undefined;
  targetProduct: ShoppingProductOption | undefined;
  sourceBatchesCount: number;
  handleMerge: () => Promise<void>;
  loadData: () => Promise<void>;
}

export const useAdminShoppingMergeLogic = (): UseAdminShoppingMergeLogicReturn => {
  const [products, setProducts] = useState<ShoppingProductOption[]>([]);
  const [batches, setBatches] = useState<ItemBatchRecord[]>([]);
  const [sourceProductId, setSourceProductId] = useState<number | ''>('');
  const [targetProductId, setTargetProductId] = useState<number | ''>('');
  const [merging, setMerging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [prods, bts] = await Promise.all([
        fetchShoppingProducts(),
        fetchAllInventoryBatches(),
      ]);
      const sortedProds = [...prods].sort((a, b) =>
        (a.displayName || a.nameNormalized).localeCompare(b.displayName || b.nameNormalized)
      );
      setProducts(sortedProds);
      setBatches(bts);
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: extractErrorMessage(err, 'Errore nel caricamento del catalogo prodotti.'),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Conteggio lotti associati a ciascun prodotto
  const productBatchCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    batches.forEach((b) => {
      if (b.productId) {
        counts[b.productId] = (counts[b.productId] || 0) + 1;
      }
    });
    return counts;
  }, [batches]);

  const sourceProduct = useMemo(() => {
    return products.find((p) => p.id === sourceProductId);
  }, [products, sourceProductId]);

  const targetProduct = useMemo(() => {
    return products.find((p) => p.id === targetProductId);
  }, [products, targetProductId]);

  const sourceBatchesCount = useMemo(() => {
    if (!sourceProductId) return 0;
    return productBatchCounts[sourceProductId] || 0;
  }, [productBatchCounts, sourceProductId]);

  const handleMerge = useCallback(async () => {
    if (!sourceProductId || !targetProductId) {
      setMessage({ type: 'error', text: 'Seleziona sia il prodotto duplicato che il prodotto principale.' });
      return;
    }

    if (sourceProductId === targetProductId) {
      setMessage({ type: 'error', text: 'Il prodotto duplicato e quello principale non possono coincidere.' });
      return;
    }

    const sName = (sourceProduct?.displayName || sourceProduct?.nameNormalized) || `#${sourceProductId}`;
    const tName = (targetProduct?.displayName || targetProduct?.nameNormalized) || `#${targetProductId}`;

    const confirmMsg = `ATTENZIONE: Stai per unire il prodotto duplicato "${sName}" (con ${sourceBatchesCount} registrazioni) nel prodotto master "${tName}".\n\nTutti gli acquisti storici e le liste della spesa verranno riassegnati a "${tName}", e "${sName}" verrà eliminato definitivamente dal catalogo.\n\nConfermi l'operazione?`;

    if (!window.confirm(confirmMsg)) return;

    setMerging(true);
    setMessage(null);
    try {
      const res = await mergeShoppingProducts({
        sourceProductId: Number(sourceProductId),
        targetProductId: Number(targetProductId),
      });

      setMessage({
        type: 'success',
        text: res.message || `Fusione completata con successo in "${tName}"!`,
      });

      setSourceProductId('');
      await loadData();
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: extractErrorMessage(err, 'Errore durante la fusione dei prodotti.'),
      });
    } finally {
      setMerging(false);
    }
  }, [sourceProductId, targetProductId, sourceProduct, targetProduct, sourceBatchesCount, loadData]);

  return {
    products,
    sourceProductId,
    setSourceProductId,
    targetProductId,
    setTargetProductId,
    merging,
    loading,
    message,
    setMessage,
    productBatchCounts,
    sourceProduct,
    targetProduct,
    sourceBatchesCount,
    handleMerge,
    loadData,
  };
};
