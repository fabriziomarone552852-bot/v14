// src/components/admin/shopping/useAdminShoppingDataGridLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ItemBatchRecord,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import {
  fetchAllInventoryBatches,
  updateInventoryBatch,
  deleteInventoryBatch,
} from '@/api/shopping/shoppingInventoryApi';
import {
  fetchShoppingProducts,
  saveProductBrandPreference,
} from '@/api/shopping/shoppingConfigApi';
import {
  fetchShoppingSuppliers,
  fetchShoppingBrands,
} from '@/api/shopping/shoppingSuppliersApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export type DataGridDatePreset = 'today' | '7days' | 'month' | 'year' | 'all' | 'custom';
export type DataGridSortField = 'purchaseDate' | 'productName' | 'purchasePrice' | 'unitPrice' | 'quantityPurchased';

export interface UseAdminShoppingDataGridLogicReturn {
  loading: boolean;
  saving: boolean;
  message: { text: string; type: 'success' | 'error' } | null;
  setMessage: (msg: { text: string; type: 'success' | 'error' } | null) => void;
  products: ShoppingProductOption[];
  suppliers: ShoppingSupplierOption[];
  brands: ShoppingSupplierOption[];
  // Filtri
  datePreset: DataGridDatePreset;
  setDatePreset: (preset: DataGridDatePreset) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  selectedSupplierId: number | 'all';
  setSelectedSupplierId: (id: number | 'all') => void;
  selectedBrandId: number | 'all';
  setSelectedBrandId: (id: number | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onlyAnomalies: boolean;
  setOnlyAnomalies: (val: boolean) => void;
  onlyOffers: boolean;
  setOnlyOffers: (val: boolean) => void;
  // Ordinamento
  sortField: DataGridSortField;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: DataGridSortField) => void;
  // Dati & Drafts
  filteredBatches: ItemBatchRecord[];
  totalBatchesCount: number;
  filteredSummary: { count: number; totalAmount: number; anomaliesCount: number };
  drafts: Record<number, Partial<ItemBatchRecord>>;
  pendingCount: number;
  hasRowChanges: (batchId: number) => boolean;
  getEffectiveBatch: (batch: ItemBatchRecord) => ItemBatchRecord;
  handleCellChange: (batchId: number, field: keyof ItemBatchRecord, value: unknown) => void;
  handleRevertRow: (batchId: number) => void;
  handleSaveRow: (batchId: number) => Promise<void>;
  handleSaveAllPending: () => Promise<void>;
  handleRevertAllPending: () => void;
  handleDeleteBatch: (batchId: number, productName?: string | null) => Promise<void>;
  loadAllData: () => Promise<void>;
}

export const useAdminShoppingDataGridLogic = (): UseAdminShoppingDataGridLogicReturn => {
  const [batches, setBatches] = useState<ItemBatchRecord[]>([]);
  const [products, setProducts] = useState<ShoppingProductOption[]>([]);
  const [suppliers, setSuppliers] = useState<ShoppingSupplierOption[]>([]);
  const [brands, setBrands] = useState<ShoppingSupplierOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filtri
  const [datePreset, setDatePreset] = useState<DataGridDatePreset>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | 'all'>('all');
  const [selectedBrandId, setSelectedBrandId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyAnomalies, setOnlyAnomalies] = useState<boolean>(false);
  const [onlyOffers, setOnlyOffers] = useState<boolean>(false);

  // Ordinamento
  const [sortField, setSortField] = useState<DataGridSortField>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Bozze / Modifiche pendenti
  const [drafts, setDrafts] = useState<Record<number, Partial<ItemBatchRecord>>>({});

  // Caricamento Dati
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [allBatches, allProducts, allSuppliers, allBrands] = await Promise.all([
        fetchAllInventoryBatches(),
        fetchShoppingProducts(),
        fetchShoppingSuppliers(),
        fetchShoppingBrands(),
      ]);
      setBatches(allBatches);
      setProducts(allProducts);
      setSuppliers(allSuppliers);
      setBrands(allBrands);
      setDrafts({});
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: extractErrorMessage(err, 'Errore durante il caricamento dei lotti e cataloghi spesa.'),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Gestione preset data
  const dateBounds = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (datePreset === 'all') return { start: '', end: '' };
    if (datePreset === 'today') return { start: todayStr, end: todayStr };

    if (datePreset === '7days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      return { start: d.toISOString().slice(0, 10), end: todayStr };
    }

    if (datePreset === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      return { start, end: todayStr };
    }

    if (datePreset === 'year') {
      const start = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10);
      return { start, end: todayStr };
    }

    if (datePreset === 'custom') {
      return { start: startDate, end: endDate };
    }

    return { start: '', end: '' };
  }, [datePreset, startDate, endDate]);

  // Controllo anomalie su un lotto
  const isAnomaly = useCallback((b: ItemBatchRecord): boolean => {
    const qty = b.quantityPurchased ?? 1;
    const price = b.purchasePrice ?? 0;
    const unitPrice = qty > 0 ? price / qty : price;

    if (qty <= 0) return true;
    if (price <= 0) return true;
    if (unitPrice > 45) return true; // Prezzo unitario anomalo molto alto
    if (unitPrice < 0.15) return true; // Prezzo unitario anomalo quasi nullo
    if (!b.supplierId && !b.supplierName) return true; // Negozio non registrato
    return false;
  }, []);

  // Calcolo lotti filtrati
  const filteredBatches = useMemo(() => {
    let result = [...batches];

    // 1. Filtro data
    if (dateBounds.start) {
      result = result.filter((b) => b.purchaseDate >= dateBounds.start);
    }
    if (dateBounds.end) {
      result = result.filter((b) => b.purchaseDate <= dateBounds.end);
    }

    // 2. Filtro Supermercato
    if (selectedSupplierId !== 'all') {
      result = result.filter((b) => b.supplierId === selectedSupplierId);
    }

    // 3. Filtro Brand
    if (selectedBrandId !== 'all') {
      result = result.filter((b) => b.brandId === selectedBrandId);
    }

    // 4. Solo offerte
    if (onlyOffers) {
      result = result.filter((b) => b.isOnSale);
    }

    // 5. Solo anomalie
    if (onlyAnomalies) {
      result = result.filter((b) => isAnomaly(b));
    }

    // 6. Ricerca testuale
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => {
        const prod = (b.productName || '').toLowerCase();
        const brand = (b.brandName || '').toLowerCase();
        const sup = (b.supplierName || '').toLowerCase();
        const notes = (b.notes || '').toLowerCase();
        return prod.includes(q) || brand.includes(q) || sup.includes(q) || notes.includes(q);
      });
    }

    // 7. Ordinamento
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'purchaseDate') {
        comparison = a.purchaseDate.localeCompare(b.purchaseDate);
      } else if (sortField === 'productName') {
        comparison = (a.productName || '').localeCompare(b.productName || '');
      } else if (sortField === 'purchasePrice') {
        comparison = a.purchasePrice - b.purchasePrice;
      } else if (sortField === 'unitPrice') {
        comparison = (a.unitPrice ?? 0) - (b.unitPrice ?? 0);
      } else if (sortField === 'quantityPurchased') {
        comparison = a.quantityPurchased - b.quantityPurchased;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    batches,
    dateBounds,
    selectedSupplierId,
    selectedBrandId,
    onlyOffers,
    onlyAnomalies,
    searchQuery,
    sortField,
    sortDirection,
    isAnomaly,
  ]);

  // Metriche di riepilogo
  const filteredSummary = useMemo(() => {
    let total = 0;
    let anomalies = 0;
    filteredBatches.forEach((b) => {
      total += b.purchasePrice || 0;
      if (isAnomaly(b)) anomalies++;
    });
    return {
      count: filteredBatches.length,
      totalAmount: Math.round(total * 100) / 100,
      anomaliesCount: anomalies,
    };
  }, [filteredBatches, isAnomaly]);

  // Ordinamento toggle
  const handleSort = useCallback(
    (field: DataGridSortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    },
    [sortField]
  );

  // Gestione bozza riga
  const hasRowChanges = useCallback(
    (batchId: number): boolean => {
      return Boolean(drafts[batchId] && Object.keys(drafts[batchId]).length > 0);
    },
    [drafts]
  );

  const pendingCount = useMemo(() => {
    return Object.keys(drafts).length;
  }, [drafts]);

  const getEffectiveBatch = useCallback(
    (batch: ItemBatchRecord): ItemBatchRecord => {
      const draft = drafts[batch.id];
      if (!draft) return batch;
      const merged = { ...batch, ...draft };
      // Ricalcolo unitPrice dinamico se prezzo o quantita sono cambiati
      const qty = merged.quantityPurchased ?? batch.quantityPurchased ?? 1;
      const price = merged.purchasePrice ?? batch.purchasePrice ?? 0;
      merged.unitPrice = qty > 0 ? Math.round((price / qty) * 100) / 100 : price;
      return merged;
    },
    [drafts]
  );

  const handleCellChange = useCallback(
    (batchId: number, field: keyof ItemBatchRecord, value: unknown) => {
      setDrafts((prev) => {
        const rowDraft = prev[batchId] ? { ...prev[batchId] } : {};
        (rowDraft as Record<string, unknown>)[field] = value;
        return { ...prev, [batchId]: rowDraft };
      });
    },
    []
  );

  const handleRevertRow = useCallback((batchId: number) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[batchId];
      return next;
    });
  }, []);

  const handleRevertAllPending = useCallback(() => {
    setDrafts({});
  }, []);

  // Salvataggio singola riga
  const handleSaveRow = useCallback(
    async (batchId: number) => {
      const draft = drafts[batchId];
      if (!draft || Object.keys(draft).length === 0) return;

      const original = batches.find((b) => b.id === batchId);
      if (!original) return;

      const effective = getEffectiveBatch(original);

      setSaving(true);
      setMessage(null);
      try {
        await updateInventoryBatch(batchId, {
          purchasePrice: effective.purchasePrice,
          purchaseDate: effective.purchaseDate,
          quantity: effective.quantityPurchased,
          supplierId: effective.supplierId,
          isOnSale: effective.isOnSale,
          productName: effective.productName ?? undefined,
          productId: effective.productId ?? undefined,
          brandId: effective.brandId ?? undefined,
          notes: effective.notes ?? undefined,
        });

        // Sincronizza preferenza brand nel catalogo permanente (se associato)
        if (effective.productId && effective.brandId) {
          try {
            await saveProductBrandPreference({
              productId: effective.productId,
              brandId: effective.brandId,
              notes: effective.notes ?? null,
            });
          } catch (prefErr) {
            console.warn('Nota preferenza brand non sincronizzata con catalogo:', prefErr);
          }
        }

        // Aggiorna lo stato dei lotti in memoria (Mazzo di Carte)
        setBatches((prev) =>
          prev.map((b) => (b.id === batchId ? effective : b))
        );

        // Rimuove la bozza
        handleRevertRow(batchId);
        setMessage({
          type: 'success',
          text: `Lotto #${batchId} (${effective.productName || 'articolo'}) aggiornato con successo!`,
        });
      } catch (err: unknown) {
        setMessage({
          type: 'error',
          text: extractErrorMessage(err, `Errore durante il salvataggio del lotto #${batchId}.`),
        });
      } finally {
        setSaving(false);
      }
    },
    [drafts, batches, getEffectiveBatch, handleRevertRow]
  );

  // Salvataggio globale di tutte le righe modificate
  const handleSaveAllPending = useCallback(async () => {
    const dirtyIds = Object.keys(drafts).map(Number);
    if (dirtyIds.length === 0) return;

    setSaving(true);
    setMessage(null);
    let successCount = 0;
    const errors: string[] = [];

    for (const batchId of dirtyIds) {
      const original = batches.find((b) => b.id === batchId);
      if (!original) continue;
      const effective = getEffectiveBatch(original);

      try {
        await updateInventoryBatch(batchId, {
          purchasePrice: effective.purchasePrice,
          purchaseDate: effective.purchaseDate,
          quantity: effective.quantityPurchased,
          supplierId: effective.supplierId,
          isOnSale: effective.isOnSale,
          productName: effective.productName ?? undefined,
          productId: effective.productId ?? undefined,
          brandId: effective.brandId ?? undefined,
          notes: effective.notes ?? undefined,
        });

        if (effective.productId && effective.brandId) {
          try {
            await saveProductBrandPreference({
              productId: effective.productId,
              brandId: effective.brandId,
              notes: effective.notes ?? null,
            });
          } catch {
            // Continua
          }
        }

        successCount++;
        setBatches((prev) => prev.map((b) => (b.id === batchId ? effective : b)));
        handleRevertRow(batchId);
      } catch (err: unknown) {
        errors.push(`#${batchId}: ${extractErrorMessage(err, 'errore')}`);
      }
    }

    setSaving(false);
    if (errors.length === 0) {
      setMessage({
        type: 'success',
        text: `Salvate con successo tutte le ${successCount} modifiche pendenti!`,
      });
    } else {
      setMessage({
        type: 'error',
        text: `Salvate ${successCount} righe su ${dirtyIds.length}. Errori: ${errors.join(', ')}`,
      });
    }
  }, [drafts, batches, getEffectiveBatch, handleRevertRow]);

  // Eliminazione singolo lotto
  const handleDeleteBatch = useCallback(
    async (batchId: number, productName?: string | null) => {
      const confirmText = productName
        ? `Sei sicuro di voler eliminare definitivamente la registrazione per "${productName}" (#${batchId})?`
        : `Sei sicuro di voler eliminare definitivamente il lotto #${batchId}?`;

      if (!window.confirm(confirmText)) return;

      setSaving(true);
      setMessage(null);
      try {
        await deleteInventoryBatch(batchId);
        setBatches((prev) => prev.filter((b) => b.id !== batchId));
        handleRevertRow(batchId);
        setMessage({
          type: 'success',
          text: `Registrazione #${batchId} rimossa con successo.`,
        });
      } catch (err: unknown) {
        setMessage({
          type: 'error',
          text: extractErrorMessage(err, `Errore durante l'eliminazione del lotto #${batchId}.`),
        });
      } finally {
        setSaving(false);
      }
    },
    [handleRevertRow]
  );

  return {
    loading,
    saving,
    message,
    setMessage,
    products,
    suppliers,
    brands,
    datePreset,
    setDatePreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedSupplierId,
    setSelectedSupplierId,
    selectedBrandId,
    setSelectedBrandId,
    searchQuery,
    setSearchQuery,
    onlyAnomalies,
    setOnlyAnomalies,
    onlyOffers,
    setOnlyOffers,
    sortField,
    sortDirection,
    handleSort,
    filteredBatches,
    totalBatchesCount: batches.length,
    filteredSummary,
    drafts,
    pendingCount,
    hasRowChanges,
    getEffectiveBatch,
    handleCellChange,
    handleRevertRow,
    handleSaveRow,
    handleSaveAllPending,
    handleRevertAllPending,
    handleDeleteBatch,
    loadAllData,
  };
};
