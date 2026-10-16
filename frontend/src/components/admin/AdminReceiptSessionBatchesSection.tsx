// src/components/admin/AdminReceiptSessionBatchesSection.tsx
import React from 'react';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import ShoppingEditBatchModal from '@/components/archive/shopping/price/ShoppingEditBatchModal';
import type {
  ItemBatchRecord,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';

export interface AdminReceiptSessionBatchesSectionProps {
  sessionBatches: ItemBatchRecord[];
  loadingSessionBatches: boolean;
  editingBatch: ItemBatchRecord | null;
  suppliers: ShoppingSupplierOption[];
  brands: ShoppingSupplierOption[];
  products: ShoppingProductOption[];
  sessionSummary: { count: number; totalAmount: number };
  onStartEdit: (batch: ItemBatchRecord) => void;
  onCloseEdit: () => void;
  onSaveEdit: (
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
  ) => Promise<void>;
  onDelete: (batchId: number, productName?: string | null) => Promise<void>;
  onRefresh: () => void;
}

export const AdminReceiptSessionBatchesSection: React.FC<
  AdminReceiptSessionBatchesSectionProps
> = ({
  sessionBatches,
  loadingSessionBatches,
  editingBatch,
  suppliers,
  brands,
  products,
  sessionSummary,
  onStartEdit,
  onCloseEdit,
  onSaveEdit,
  onDelete,
  onRefresh,
}) => {
  // Formattazione quantità: preserva fino a 3 decimali rimuovendo zeri finali inutili
  const formatQuantity = (qty: number): string => {
    return Number(qty.toFixed(3)).toString().replace('.', ',');
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      {/* Header Sezione */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h4 className="text-sm font-extrabold text-slate-900">
              Registrazioni della Sessione in Corso ({sessionSummary.count} articoli)
            </h4>
            {loadingSessionBatches && (
              <span className="text-[11px] text-sky-600 font-semibold animate-pulse">
                Sincronizzazione...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rivedi, modifica o elimina all'istante le righe appena registrate per correggere errori di battitura, quantità o prezzi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {sessionSummary.count > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                Totale Registrato Sessione
              </span>
              <span className="text-sm font-black text-emerald-800 font-mono">
                {sessionSummary.totalAmount.toFixed(2)} €
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loadingSessionBatches}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            title="Ricarica registrazioni odierne"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Aggiorna</span>
          </button>
        </div>
      </div>

      {/* Contenuto Tabella o Stato Vuoto */}
      {sessionBatches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <div className="text-3xl mb-2">🧾</div>
          <h5 className="text-xs font-bold text-slate-700">
            Nessuna registrazione nella sessione corrente
          </h5>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1">
            Quando registri uno scontrino dal modulo in alto, gli articoli salvati appariranno qui consentendoti modifiche immediate o eliminazioni rapide di eventuali lotti inseriti per errore.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[50vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-24">Data</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Prodotto</th>
                  <th className="py-2.5 px-3 min-w-[160px] w-44">Brand</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Supermercato / Negozio</th>
                  <th className="py-2.5 px-2 w-24 text-center">Quantità</th>
                  <th className="py-2.5 px-3 w-28 text-right">Prezzo Tot.</th>
                  <th className="py-2.5 px-3 w-28 text-right">Prezzo Unit.</th>
                  <th className="py-2.5 px-3 w-24 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessionBatches.map((batch) => (
                  <tr
                    key={batch.id}
                    className="hover:bg-sky-50/30 transition group"
                  >
                    {/* Data */}
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {batch.purchaseDate}
                    </td>

                    {/* Prodotto */}
                    <td className="py-2.5 px-3">
                      <div className="font-extrabold text-slate-900">
                        {batch.productName || 'Prodotto sconosciuto'}
                      </div>
                      {batch.notes && (
                        <div className="text-[10px] text-slate-500 italic truncate max-w-xs">
                          {batch.notes}
                        </div>
                      )}
                    </td>

                    {/* Brand */}
                    <td className="py-2.5 px-3">
                      {batch.brandName ? (
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-[11px] border border-indigo-100">
                          {batch.brandName}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>

                    {/* Fornitore */}
                    <td className="py-2.5 px-3">
                      {batch.supplierName ? (
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          🏪 {batch.supplierName}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>

                    {/* Quantità */}
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                      {formatQuantity(batch.quantityPurchased)}
                      {batch.unitName && (
                        <span className="text-[10px] font-normal text-slate-500 ml-0.5">
                          {batch.unitName}
                        </span>
                      )}
                    </td>

                    {/* Prezzo Totale */}
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 font-mono">
                      {batch.purchasePrice.toFixed(2)} €
                    </td>

                    {/* Prezzo Unitario */}
                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono text-[11px]">
                      {batch.unitPrice != null ? `${batch.unitPrice.toFixed(2)} €` : '-'}
                    </td>

                    {/* Azioni Rapide */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onStartEdit(batch)}
                          className="p-1.5 rounded-lg hover:bg-sky-100 text-sky-700 transition cursor-pointer"
                          title="Modifica questo lotto"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(batch.id, batch.productName)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          title="Elimina questo lotto"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modale Completo di Modifica Rilevazione Prezzo */}
      {editingBatch && (
        <ShoppingEditBatchModal
          isOpen={Boolean(editingBatch)}
          batch={editingBatch}
          onClose={onCloseEdit}
          suppliers={suppliers}
          brands={brands}
          products={products}
          onSave={onSaveEdit}
          onDelete={async (batchId) => {
            await onDelete(batchId, editingBatch.productName);
            onCloseEdit();
          }}
        />
      )}
    </div>
  );
};

export default AdminReceiptSessionBatchesSection;
