// src/mobile/components/modals/shopping/MobileSupplierDetailModal.tsx
import React from 'react';
import MobileBaseModal from '../MobileBaseModal';
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

interface MobileSupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: EnrichedSupplier | null;
  onEditClick: (supplier: EnrichedSupplier) => void;
  onDeleteClick: (supplier: EnrichedSupplier) => void;
  isSuperuser?: boolean;
}

export const MobileSupplierDetailModal: React.FC<MobileSupplierDetailModalProps> = ({
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
  ) : (
    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
      Negozio
    </span>
  );

  const HeaderActions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEditClick(supplier)}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
        title="Modifica Negozio"
      >
        <EditIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => onDeleteClick(supplier)}
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        title="Elimina Negozio"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={HeaderTags}
      headerActions={HeaderActions}
    >
      <div className="space-y-4 pb-4 animate-fadeIn">
        {/* Titolo Negozio */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-orange-50/30 border border-orange-100 shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold text-gray-900 capitalize truncate">
              {supplier.nameNormalized || supplier.name}
            </h2>
            <p className="text-xs text-orange-700 font-semibold mt-0.5">Punto vendita / Negozio</p>
          </div>
        </div>

        {/* Riquadri Statistiche */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShoppingIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Acquisti Totali</p>
              <p className="text-base font-extrabold text-gray-900">{supplier.purchaseCount}</p>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ultimo Acquisto</p>
              <p className="text-xs font-extrabold text-gray-900 truncate">
                {supplier.lastPurchaseDate ? formatToItalianShortDate(supplier.lastPurchaseDate) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Elenco Prodotti e Acquisti Registrati in questo Negozio */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2.5">
            <TagIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Acquisti Registrati ({batches.length})</span>
          </h4>

          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
            {batches.length === 0 ? (
              <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-200/80 p-4">
                <StoreIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-bold text-xs text-gray-600">Nessun acquisto registrato in questo negozio.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Quando registrerai una spesa per questo negozio, comparirà qui lo storico.
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
                    className="p-3 rounded-xl border border-gray-200 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 truncate text-xs">
                        {batch.productName || 'Prodotto'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                        <span>{formatToItalianShortDate(batch.purchaseDate)}</span>
                        {batch.listName && (
                          <>
                            <span>•</span>
                            <span className="truncate">Lista: {batch.listName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      {batch.isOnSale && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                          Offerta
                        </span>
                      )}

                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-extrabold text-gray-900 text-xs">
                          {totalPrice != null ? `€ ${totalPrice.toFixed(2)}` : '—'}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500">
                          {quantityDisplay}
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
    </MobileBaseModal>
  );
};

export default MobileSupplierDetailModal;
