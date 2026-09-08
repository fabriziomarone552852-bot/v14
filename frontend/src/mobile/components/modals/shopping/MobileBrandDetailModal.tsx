// src/mobile/components/modals/shopping/MobileBrandDetailModal.tsx
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
import type { EnrichedBrand } from '@/hooks/useBrandArchiveData';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import { formatToItalianShortDate } from '@/utils/dateUtils';

interface MobileBrandDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: EnrichedBrand | null;
  onEditClick: (brand: EnrichedBrand) => void;
  onDeleteClick: (brand: EnrichedBrand) => void;
}

export const MobileBrandDetailModal: React.FC<MobileBrandDetailModalProps> = ({
  isOpen,
  onClose,
  brand,
  onEditClick,
  onDeleteClick,
}) => {
  if (!isOpen || !brand) return null;

  const batches = brand.batches || [];

  const HeaderTags = (
    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
      Marchio / Brand
    </span>
  );

  const HeaderActions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEditClick(brand)}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
        title="Modifica Brand"
      >
        <EditIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => onDeleteClick(brand)}
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        title="Elimina Brand"
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
        {/* Titolo Brand */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 border border-indigo-100 shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <TagIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold text-gray-900 capitalize truncate">
              {brand.nameNormalized || brand.name}
            </h2>
            <p className="text-xs text-indigo-700 font-semibold mt-0.5">Marchio produttore</p>
          </div>
        </div>

        {/* Riquadri Statistiche */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <ShoppingIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Acquisti Totali</p>
              <p className="text-base font-extrabold text-gray-900">{brand.purchaseCount}</p>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ultimo Acquisto</p>
              <p className="text-xs font-extrabold text-gray-900 truncate">
                {brand.lastPurchaseDate ? formatToItalianShortDate(brand.lastPurchaseDate) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Elenco Prodotti e Acquisti Registrati con questo Brand */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2.5">
            <TagIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Acquisti Registrati ({batches.length})</span>
          </h4>

          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
            {batches.length === 0 ? (
              <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-200/80 p-4">
                <TagIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-bold text-xs text-gray-600">Nessun acquisto registrato per questo marchio.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Quando registrerai una spesa per un prodotto di questo brand, comparirà qui lo storico.
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
                    className="p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 transition-colors flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 truncate text-xs">
                        {batch.productName || 'Prodotto'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                        <span>{formatToItalianShortDate(batch.purchaseDate)}</span>
                        {batch.supplierName && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 truncate text-gray-600 font-medium">
                              <StoreIcon className="w-3 h-3 text-gray-400" />
                              {batch.supplierName}
                            </span>
                          </>
                        )}
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

export default MobileBrandDetailModal;
