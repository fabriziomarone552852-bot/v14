// src/mobile/components/modals/shopping/MobileBrandDetailModal.tsx
import React from 'react';
import MobileBaseModal from '../MobileBaseModal';
import {
  EditIcon,
  TrashIcon,
  ShoppingIcon,
  ClockIcon,
  TagIcon,
} from '@/components/shared/utils/Icons';
import type { EnrichedBrand } from '@/hooks/useBrandArchiveData';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { MobileBrandBatchesList } from './brand';

export interface MobileBrandDetailModalProps {
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
        <MobileBrandBatchesList batches={batches} />
      </div>
    </MobileBaseModal>
  );
};

export default MobileBrandDetailModal;
