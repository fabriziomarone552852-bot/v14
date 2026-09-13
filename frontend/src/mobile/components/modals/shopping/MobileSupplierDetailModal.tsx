// src/mobile/components/modals/shopping/MobileSupplierDetailModal.tsx
import React from 'react';
import MobileBaseModal from '../MobileBaseModal';
import {
  EditIcon,
  TrashIcon,
  ShoppingIcon,
  ClockIcon,
  StoreIcon,
} from '@/components/shared/utils/Icons';
import type { EnrichedSupplier } from '@/hooks/useSupplierArchiveData';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { MobileSupplierBatchesList } from './supplier';

export interface MobileSupplierDetailModalProps {
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
        <MobileSupplierBatchesList batches={batches} />
      </div>
    </MobileBaseModal>
  );
};

export default MobileSupplierDetailModal;
