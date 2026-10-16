// src/components/admin/AdminReceiptQuickEntrySection.tsx
import React from 'react';
import { PlusIcon } from '@/components/shared/utils/Icons';
import { ShoppingSupplierSelect } from '@/components/shared/shopping/ShoppingSupplierSelect';
import { AdminReceiptQuickEntryRow } from './AdminReceiptQuickEntryRow';
import {
  useAdminReceiptQuickEntryLogic,
  type ReceiptItemRow,
} from './useAdminReceiptQuickEntryLogic';

// Re-export per retrocompatibilità dei componenti figli
export type { ReceiptItemRow };

export const AdminReceiptQuickEntrySection: React.FC = () => {
  const {
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
  } = useAdminReceiptQuickEntryLogic();

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
                <th className="py-2.5 px-3 min-w-[170px] w-48">Nome Prodotto</th>
                <th className="py-2.5 px-3 min-w-[150px] w-44">Brand / Marchio</th>
                <th className="py-2.5 px-1.5 w-20 text-center" title="Valutazione Brand/Prodotto">Val.</th>
                <th className="py-2.5 px-2 w-20 text-center">Quantità</th>
                <th className="py-2.5 px-3 w-28 text-right">Prezzo Tot. (€)</th>
                <th className="py-2.5 px-3 w-28 text-right">Prezzo Unit. (€)</th>
                <th className="py-2.5 px-2 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => (
                <AdminReceiptQuickEntryRow
                  key={row.id}
                  row={row}
                  index={index}
                  products={products}
                  brands={brands}
                  onUpdateRow={handleUpdateRow}
                  onProductSelect={handleProductSelect}
                  onBrandSelect={handleBrandSelect}
                  onRemoveRow={handleRemoveRow}
                  onKeyDownOnPrice={handleKeyDownOnPrice}
                />
              ))}
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
