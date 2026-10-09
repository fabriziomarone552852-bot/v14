// src/components/admin/AdminReceiptQuickEntrySection.tsx
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { PlusIcon, TrashIcon } from '@/components/shared/utils/Icons';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import { ShoppingSupplierSelect } from '@/components/shared/shopping/ShoppingSupplierSelect';
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

const createEmptyReceiptRow = (): ReceiptItemRow => ({
  id: `receipt-row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  productName: '',
  productId: null,
  brandName: '',
  brandId: null,
  quantity: 1,
  price: '',
  unitPrice: null,
});

export const AdminReceiptQuickEntrySection: React.FC = () => {
  // Catalogo per autocompletamento
  const [products, setProducts] = useState<ShoppingProductOption[]>([]);
  const [brands, setBrands] = useState<ShoppingSupplierOption[]>([]);
  const [suppliers, setSuppliers] = useState<ShoppingSupplierOption[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

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
  const [saving, setSaving] = useState(false);
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
      // Ignore initial load error
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
      // Sposta il focus sul nome prodotto della riga successiva
      setTimeout(() => {
        const nextInput = document.getElementById(`prod-input-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }, 50);
    }
  };

  // Calcolo totali scontrino
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

  // Invio Scontrino
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

    // Filtra righe valide
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

      // Reset righe per il prossimo scontrino
      setRows([
        createEmptyReceiptRow(),
        createEmptyReceiptRow(),
        createEmptyReceiptRow(),
      ]);

      // Ricarica cataloghi per includere eventuali nuovi prodotti/brand creati
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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🧾</span>
          <h3 className="text-base font-extrabold text-slate-900">
            Inserimento Rapido Scontrini Acquisti (Alimentazione Statistiche)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Inserisci rapidamente le righe di spesa di uno scontrino per popolare lo storico prezzi, i prezzi medi e il miglior prezzo per tutti gli utenti.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold animate-fadeIn ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* HEADER SCONTRINO: DATA & FORNITORE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <span>🏷️</span>
          <span>Dati Generali Scontrino (Assegnati a tutte le righe)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Data Scontrino */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              📅 Data Scontrino / Acquisto
            </label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Supermercato / Punto Vendita (Selettore) */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              🏪 Supermercato / Punto Vendita
            </label>
            <ShoppingSupplierSelect
              value={selectedSupplierId}
              onChange={(val) => {
                setSelectedSupplierId(val);
                if (val) setCustomSupplierName('');
              }}
              suppliers={suppliers}
              disabled={saving}
              hideLabel={true}
              className="w-full"
            />
          </div>

          {/* Nuovo Fornitore Testuale (se non in lista) */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              ✍️ Oppure Nome Nuovo Negozio (Se non presente)
            </label>
            <input
              type="text"
              placeholder="Es. Conad City, Eurospin..."
              value={customSupplierName}
              disabled={Boolean(selectedSupplierId) || saving}
              onChange={(e) => setCustomSupplierName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* TABELLA ARTICOLI SCONTRINO */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              🛒 Articoli Acquistati ({rows.length} righe)
            </span>
            {loadingCatalogs && (
              <span className="text-[11px] text-sky-600 font-semibold animate-pulse">
                Caricamento cataloghi...
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Aggiungi Riga</span>
          </button>
        </div>

        <div ref={tableContainerRef} className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-20">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[200px]">Nome Prodotto (Obbligatorio)</th>
                <th className="py-2.5 px-3 min-w-[150px]">Brand / Marchio (Opzionale)</th>
                <th className="py-2.5 px-2 w-20 text-center">Quantità</th>
                <th className="py-2.5 px-3 w-28 text-right">Prezzo Tot. (€)</th>
                <th className="py-2.5 px-3 w-28 text-right">Prezzo Unit. (€)</th>
                <th className="py-2.5 px-2 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => {
                const isComplete = row.productName.trim() !== '' && Boolean(row.price);

                return (
                  <tr
                    key={row.id}
                    className={`transition ${
                      isComplete ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/30 hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-400 text-xs">
                      {index + 1}
                    </td>

                    {/* Prodotto con Autocomplete */}
                    <td className="py-2 px-3">
                      <ShoppingProductAutocomplete
                        id={`prod-input-${index}`}
                        value={row.productName}
                        onChange={(name, prod) => handleProductSelect(row.id, name, prod)}
                        products={products}
                        hideBrand={true}
                        placeholder="Es. Pasta Penne, Latte..."
                        className="w-full text-xs"
                        usePortal={true}
                      />
                    </td>

                    {/* Brand con Autocomplete */}
                    <td className="py-2 px-3">
                      <ShoppingBrandAutocomplete
                        id={`brand-input-${index}`}
                        value={row.brandName}
                        onChange={(name, brand) => handleBrandSelect(row.id, name, brand)}
                        brands={brands}
                        productName={row.productName}
                        products={products}
                        placeholder="Es. Barilla, Granarolo..."
                        className="w-full text-xs"
                        usePortal={true}
                      />
                    </td>

                    {/* Quantità */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={row.quantity}
                        onChange={(e) => {
                          const v = e.target.value;
                          handleUpdateRow(row.id, 'quantity', v === '' ? '' : Math.max(0.01, Number(v)));
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-center text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                      />
                    </td>

                    {/* Prezzo Totale */}
                    <td className="py-2 px-3">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={row.price}
                          onChange={(e) =>
                            handleUpdateRow(
                              row.id,
                              'price',
                              e.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.')
                            )
                          }
                          onKeyDown={(e) => handleKeyDownOnPrice(e, index)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-right font-mono text-xs font-extrabold text-blue-700 outline-none focus:border-blue-500 pr-6"
                        />
                        <span className="absolute right-2 text-xs font-bold text-slate-400 pointer-events-none">
                          €
                        </span>
                      </div>
                    </td>

                    {/* Prezzo Unitario (Calcolato e Readonly) */}
                    <td className="py-2 px-3 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                        {row.unitPrice != null ? `${row.unitPrice.toFixed(2)} €` : '-'}
                      </span>
                    </td>

                    {/* Elimina Riga */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Rimuovi riga"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER BAR: AGGIUNGI RIGA, TOTALE & SALVA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-2xs transition cursor-pointer"
            >
              <PlusIcon className="w-4 h-4 text-sky-600" />
              <span>Aggiungi Riga (o premi Invio)</span>
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition cursor-pointer"
            >
              Svuota Tabella
            </button>
          </div>

          <div className="flex items-center gap-4 justify-end">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Totale Scontrino ({receiptSummary.validCount} validi)
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {receiptSummary.total.toFixed(2)} €
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveReceipt}
              disabled={saving || receiptSummary.validCount === 0}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <span>{saving ? 'Registrazione...' : '💾 Registra Scontrino'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReceiptQuickEntrySection;
