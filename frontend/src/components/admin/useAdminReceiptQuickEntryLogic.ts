// src/components/admin/useAdminReceiptQuickEntryLogic.ts
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { fetchShoppingProducts } from '@/api/shopping/shoppingConfigApi';
import { fetchShoppingSuppliers, fetchShoppingBrands } from '@/api/shopping/shoppingSuppliersApi';
import { createQuickPriceBatch } from '@/api/shopping/shoppingInventoryApi';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import { extractErrorMessage } from '@/utils/errorUtils';

export interface ReceiptItemRow {
  id: string;
  productName: string;
  productId?: number | null;
  brandName: string;
  brandId?: number | null;
  quantity: number | '';
  price: string;
  unitPrice: number | null;
}

export const createEmptyReceiptRow = (): ReceiptItemRow => ({
  id: `receipt-row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  productName: '',
  productId: null,
  brandName: '',
  brandId: null,
  quantity: 1,
  price: '',
  unitPrice: null,
});

export const useAdminReceiptQuickEntryLogic = () => {
  // Catalogo per autocompletamento in memoria
  const [products, setProducts] = useState<ShoppingProductOption[]>([]);
  const [brands, setBrands] = useState<ShoppingSupplierOption[]>([]);
  const [suppliers, setSuppliers] = useState<ShoppingSupplierOption[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(false);

  // Header Scontrino
  const [purchaseDate, setPurchaseDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [customSupplierName, setCustomSupplierName] = useState<string>('');

  // Righe Scontrino
  const [rows, setRows] = useState<ReceiptItemRow[]>([
    createEmptyReceiptRow(),
    createEmptyReceiptRow(),
    createEmptyReceiptRow(),
  ]);

  // Stato Operativo
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Caricamento cataloghi
  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    try {
      const [prodsData, brandsData, supsData] = await Promise.all([
        fetchShoppingProducts(),
        fetchShoppingBrands(),
        fetchShoppingSuppliers(),
      ]);
      setProducts(prodsData || []);
      setBrands(brandsData || []);
      setSuppliers(supsData || []);
    } catch {
      // Ignora errore iniziale
    } finally {
      setLoadingCatalogs(false);
    }
  }, []);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  // Calcolo prezzo unitario
  const calculateUnitPrice = (priceStr: string, qty: number | ''): number | null => {
    const cleanPrice = parseFloat(priceStr.replace(',', '.'));
    const cleanQty = typeof qty === 'number' && qty > 0 ? qty : 1;
    if (isNaN(cleanPrice) || cleanPrice <= 0) return null;
    return Math.round((cleanPrice / cleanQty) * 100) / 100;
  };

  // Aggiornamento cella
  const handleUpdateRow = (
    id: string,
    field: keyof ReceiptItemRow,
    value: string | number | null
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        // Ricalcola prezzo unitario se cambiano prezzo o quantità
        if (field === 'price' || field === 'quantity') {
          const newPrice = field === 'price' ? String(value) : row.price;
          const newQty = field === 'quantity' ? (value as number | '') : row.quantity;
          updated.unitPrice = calculateUnitPrice(newPrice, newQty);
        }

        return updated;
      })
    );
  };

  const handleProductSelect = (rowId: string, name: string, prod?: ShoppingProductOption) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          productName: name,
          productId: prod?.id ?? null,
          brandName: prod?.brandName || row.brandName,
          brandId: prod?.brandId ?? row.brandId,
        };
      })
    );
  };

  const handleBrandSelect = (rowId: string, name: string, brand?: ShoppingSupplierOption) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          brandName: name,
          brandId: brand?.id ?? null,
        };
      })
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyReceiptRow()]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.length === 0 ? [createEmptyReceiptRow()] : filtered;
    });
  };

  // Gestione tasto Invio su ultimo campo
  const handleKeyDownOnPrice = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === rows.length - 1) {
        handleAddRow();
      }
      setTimeout(() => {
        const nextInput = document.getElementById(`prod-input-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }, 50);
    }
  };

  // Calcolo totali scontrino in RAM
  const receiptSummary = useMemo(() => {
    let total = 0;
    let validCount = 0;

    rows.forEach((r) => {
      const p = parseFloat(r.price.replace(',', '.'));
      if (!isNaN(p) && p > 0 && r.productName.trim()) {
        total += p;
        validCount += 1;
      }
    });

    return {
      total: Math.round(total * 100) / 100,
      validCount,
    };
  }, [rows]);

  // Invio Scontrino al server
  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Convalida header
    if (!purchaseDate) {
      setMessage({ text: 'Seleziona la data dello scontrino.', type: 'error' });
      return;
    }

    // Risolvi fornitore
    const activeSupplier = suppliers.find((s) => String(s.id) === selectedSupplierId);
    const resolvedSupId = activeSupplier ? activeSupplier.id : undefined;
    const resolvedSupName = activeSupplier ? activeSupplier.name : customSupplierName.trim() || undefined;

    // Filtra righe valide nel frontend
    const validRows = rows.filter((r) => {
      const p = parseFloat(r.price.replace(',', '.'));
      return r.productName.trim() !== '' && !isNaN(p) && p > 0;
    });

    if (validRows.length === 0) {
      setMessage({
        text: 'Inserisci almeno un articolo valido con nome e prezzo maggiore di zero.',
        type: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      await createQuickPriceBatch({
        records: validRows.map((r) => ({
          productName: r.productName.trim(),
          brandName: r.brandName.trim() || undefined,
          brandId: r.brandId ?? undefined,
          supplierId: resolvedSupId,
          supplierName: resolvedSupName,
          purchaseDate: purchaseDate,
          quantityPurchased: typeof r.quantity === 'number' && r.quantity > 0 ? r.quantity : 1,
          purchasePrice: parseFloat(r.price.replace(',', '.')),
          isOnSale: false,
        })),
      });

      setMessage({
        text: `✅ Scontrino registrato con successo! ${validRows.length} articoli inseriti per un totale di ${receiptSummary.total.toFixed(2)} €.`,
        type: 'success',
      });

      // Reset righe
      setRows([
        createEmptyReceiptRow(),
        createEmptyReceiptRow(),
        createEmptyReceiptRow(),
      ]);

      loadCatalogs();
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante la registrazione dello scontrino.'),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (!confirm('Vuoi davvero cancellare tutti i dati inseriti per questo scontrino?')) return;
    setRows([
      createEmptyReceiptRow(),
      createEmptyReceiptRow(),
      createEmptyReceiptRow(),
    ]);
    setSelectedSupplierId('');
    setCustomSupplierName('');
    setMessage(null);
  };

  return {
    products,
    brands,
    suppliers,
    loadingCatalogs,
    purchaseDate,
    setPurchaseDate,
    selectedSupplierId,
    setSelectedSupplierId,
    customSupplierName,
    setCustomSupplierName,
    rows,
    saving,
    message,
    tableContainerRef,
    receiptSummary,
    handleUpdateRow,
    handleProductSelect,
    handleBrandSelect,
    handleAddRow,
    handleRemoveRow,
    handleKeyDownOnPrice,
    handleSaveReceipt,
    handleResetForm,
  };
};
