import React from 'react';
import type { UseModalResult } from '@/hooks/useModals';
import type { EnrichedSupplier, SupplierFilterState } from '@/hooks/useSupplierArchiveData';
import type { EnrichedBrand, BrandFilterState } from '@/hooks/useBrandArchiveData';
import type { ShoppingConfigBundle, ShoppingSupplierOption } from '@/types/shopping';

import { SupplierFilterModal } from './SupplierFilterModal';
import { SupplierDetailModal } from './SupplierDetailModal';
import { SupplierModal } from './SupplierModal';

import { BrandFilterModal } from './BrandFilterModal';
import { BrandDetailModal } from './BrandDetailModal';
import { BrandModal } from './BrandModal';

import { MobileSupplierModal } from '@/mobile/components/modals/shopping/MobileSupplierModal';
import { MobileSupplierDetailModal } from '@/mobile/components/modals/shopping/MobileSupplierDetailModal';
import { MobileBrandModal } from '@/mobile/components/modals/shopping/MobileBrandModal';
import { MobileBrandDetailModal } from '@/mobile/components/modals/shopping/MobileBrandDetailModal';

interface SuppliersPageModalsProps {
  isMobile: boolean;
  isSuperuser: boolean;
  config?: ShoppingConfigBundle | null;
  // Modali e filtri Negozi
  supplierFilterModal: UseModalResult<unknown>;
  supplierDetailModal: UseModalResult<EnrichedSupplier>;
  supplierFormModal: UseModalResult<ShoppingSupplierOption>;
  supplierFilters: SupplierFilterState;
  setSupplierFilters: (filters: SupplierFilterState) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onDeleteSupplier: (supplier: EnrichedSupplier) => void;
  onPageReset: () => void;
  // Modali e filtri Brand
  brandFilterModal: UseModalResult<unknown>;
  brandDetailModal: UseModalResult<EnrichedBrand>;
  brandFormModal: UseModalResult<ShoppingSupplierOption>;
  brandFilters: BrandFilterState;
  setBrandFilters: (filters: BrandFilterState) => void;
  onDeleteBrand: (brand: EnrichedBrand) => void;
}

export const SuppliersPageModals: React.FC<SuppliersPageModalsProps> = ({
  isMobile,
  isSuperuser,
  config,
  supplierFilterModal,
  supplierDetailModal,
  supplierFormModal,
  supplierFilters,
  setSupplierFilters,
  onResetFilters,
  hasActiveFilters,
  onDeleteSupplier,
  onPageReset,
  brandFilterModal,
  brandDetailModal,
  brandFormModal,
  brandFilters,
  setBrandFilters,
  onDeleteBrand,
}) => {
  return (
    <>
      {/* 1. MODALI NEGOZI */}
      <SupplierFilterModal
        isOpen={supplierFilterModal.isOpen}
        onClose={supplierFilterModal.close}
        filters={supplierFilters}
        onFilterChange={(newFilters) => {
          setSupplierFilters(newFilters);
          onPageReset();
        }}
        onReset={onResetFilters}
        hasActiveFilters={hasActiveFilters}
        isSuperuser={isSuperuser}
      />

      {isMobile ? (
        <>
          <MobileSupplierDetailModal
            isOpen={supplierDetailModal.isOpen}
            onClose={supplierDetailModal.close}
            supplier={supplierDetailModal.data}
            onEditClick={(supplier) => {
              supplierDetailModal.close();
              supplierFormModal.open(supplier);
            }}
            onDeleteClick={onDeleteSupplier}
            isSuperuser={isSuperuser}
          />

          <MobileSupplierModal
            isOpen={supplierFormModal.isOpen}
            onClose={supplierFormModal.close}
            supplierToEdit={supplierFormModal.data}
            config={config}
            isSuperuser={isSuperuser}
          />
        </>
      ) : (
        <>
          <SupplierDetailModal
            isOpen={supplierDetailModal.isOpen}
            onClose={supplierDetailModal.close}
            supplier={supplierDetailModal.data}
            onEditClick={(supplier) => {
              supplierDetailModal.close();
              supplierFormModal.open(supplier);
            }}
            onDeleteClick={onDeleteSupplier}
            isSuperuser={isSuperuser}
          />

          <SupplierModal
            isOpen={supplierFormModal.isOpen}
            onClose={supplierFormModal.close}
            supplierToEdit={supplierFormModal.data}
            config={config}
            isSuperuser={isSuperuser}
          />
        </>
      )}

      {/* 2. MODALI BRAND */}
      <BrandFilterModal
        isOpen={brandFilterModal.isOpen}
        onClose={brandFilterModal.close}
        filters={brandFilters}
        onFilterChange={(newFilters) => {
          setBrandFilters(newFilters);
          onPageReset();
        }}
        onReset={onResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isMobile ? (
        <>
          <MobileBrandDetailModal
            isOpen={brandDetailModal.isOpen}
            onClose={brandDetailModal.close}
            brand={brandDetailModal.data}
            onEditClick={(brand) => {
              brandDetailModal.close();
              brandFormModal.open(brand);
            }}
            onDeleteClick={onDeleteBrand}
          />

          <MobileBrandModal
            isOpen={brandFormModal.isOpen}
            onClose={brandFormModal.close}
            brandToEdit={brandFormModal.data}
          />
        </>
      ) : (
        <>
          <BrandDetailModal
            isOpen={brandDetailModal.isOpen}
            onClose={brandDetailModal.close}
            brand={brandDetailModal.data}
            onEditClick={(brand) => {
              brandDetailModal.close();
              brandFormModal.open(brand);
            }}
            onDeleteClick={onDeleteBrand}
          />

          <BrandModal
            isOpen={brandFormModal.isOpen}
            onClose={brandFormModal.close}
            brandToEdit={brandFormModal.data}
          />
        </>
      )}
    </>
  );
};
