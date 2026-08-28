// src/components/archive/suppliers/SupplierDetailModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import {
  EditIcon,
  TrashIcon,
  ShoppingIcon,
  ClockIcon,
  TagIcon,
  StoreIcon,
} from '@/components/shared/utils/Icons';
import type { EnrichedSupplier } from '@/hooks/useSupplierArchiveData';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import { formatToItalianShortDate } from '@/utils/dateUtils';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: EnrichedSupplier | null;
  onEditClick: (supplier: EnrichedSupplier) => void;
  onDeleteClick: (supplier: EnrichedSupplier) => void;
  isSuperuser?: boolean;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onEditClick,
  onDeleteClick,
  isSuperuser = false,
}) => {
  if (!isOpen || !supplier) return null;

  const batches = supplier.batches || [];

  const HeaderTags = isSuperuser ? (
    <span
      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
        supplier.isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 text-slate-600 border border-slate-200'
      }`}
    >
      {supplier.isActive ? 'Attivo' : 'Inattivo'}
    </span>
  ) : undefined;

  const HeaderActions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEditClick(supplier)}
        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        title="Modifica Fornitore"
      >
        <EditIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => onDeleteClick(supplier)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Elimina Fornitore"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={HeaderTags}
      headerActions={HeaderActions}
      maxWidthClass="max-w-lg"
    >

      <div className="space-y-4 text-xs">
        {/* Titolo Negozio (Stile TaskDetailModal ed EventDetailModal, senza icone né ID) */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 capitalize">
            {supplier.nameNormalized || supplier.name}
          </h2>
        </div>

        {/* Riquadri Statistiche */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShoppingIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acquisti Totali</p>
              <p className="text-base font-extrabold text-slate-800">{supplier.purchaseCount}</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ultimo Acquisto</p>
              <p className="text-sm font-extrabold text-slate-800 truncate">
                {supplier.lastPurchaseDate ? formatToItalianShortDate(supplier.lastPurchaseDate) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Elenco Prodotti e Acquisti Registrati in questo Negozio */}
        <div className="pt-1">
          <div className="pb-2 border-b border-slate-100 mb-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Acquisti Registrati</span>
            </h4>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {batches.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <StoreIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-xs">Nessun acquisto registrato in questo negozio.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Quando registrerai una spesa per questo fornitore, comparirà qui lo storico.
                </p>
              </div>
            ) : (
              batches.map((batch) => {
                const quantityNum = batch.quantityPurchased != null ? batch.quantityPurchased : 1;
                const unitFormatted = batch.unitName
                  ? formatUnitForQuantity(batch.unitName, quantityNum) || batch.unitName
                  : '';
                const quantityDisplay = `${quantityNum}${unitFormatted ? ` ${unitFormatted}` : ''}`;

                const totalPrice =
                  batch.purchasePrice != null
                    ? batch.purchasePrice
                    : batch.unitPrice != null
                    ? batch.unitPrice * quantityNum
                    : null;

                return (
                  <div
                    key={batch.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate text-xs">
                        {batch.productName || 'Prodotto'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{formatToItalianShortDate(batch.purchaseDate)}</span>
                        {batch.listName && (
                          <>
                            <span>•</span>
                            <span className="truncate">Lista: {batch.listName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2.5">
                      {batch.isOnSale && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                          Offerta
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {quantityDisplay}
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs">
                          {totalPrice != null ? `€ ${totalPrice.toFixed(2)}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default SupplierDetailModal;
