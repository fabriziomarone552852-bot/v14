// src/components/archive/countdowns/CountdownsPageModals.tsx
import React from 'react';
import type { UseModalResult } from '@/hooks/useModals';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import type { CountdownFilterState } from './CountdownFilterModal';
import type { CountdownSavePayload } from '@/components/day/CountdownNewModal';

import { CountdownFilterModal } from './CountdownFilterModal';
import CountdownDetailModal from '@/components/day/CountdownDetailModal';
import CountdownNewModal from '@/components/day/CountdownNewModal';
import { MobileCountdownDetailModal } from '@/mobile/components/modals/MobileCountdownDetailModal';
import { MobileCountdownNewModal } from '@/mobile/components/modals/MobileCountdownNewModal';

interface CountdownsPageModalsProps {
  isMobile: boolean;
  /** Il modale filtri non usa .data — unknown è il default di useModal<T> */
  filterModal: UseModalResult<unknown>;
  filters: CountdownFilterState;
  onFilterChange: (filters: CountdownFilterState) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onPageReset: () => void;
  detailModal: UseModalResult<CountdownItem>;
  formModal: UseModalResult<CountdownItem>;
  onEditFromDetail: () => void;
  onDelete: (id: number) => void;
  onRenew: (renewed: CountdownItem) => void;
  onSaveCountdown: (payload: CountdownSavePayload) => void;
}

export const CountdownsPageModals: React.FC<CountdownsPageModalsProps> = ({
  isMobile,
  filterModal,
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  onPageReset,
  detailModal,
  formModal,
  onEditFromDetail,
  onDelete,
  onRenew,
  onSaveCountdown,
}) => {
  return (
    <>
      {/* 1. MODALE FILTRI & RICERCA */}
      <CountdownFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={(newFilters) => {
          onFilterChange(newFilters);
          onPageReset();
        }}
        onReset={onResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 2. MODALE DI DETTAGLIO */}
      {isMobile ? (
        <MobileCountdownDetailModal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          countdown={detailModal.data}
          onEditClick={onEditFromDetail}
          onDeleteClick={onDelete}
          onRenewClick={onRenew}
        />
      ) : (
        <CountdownDetailModal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          countdown={detailModal.data}
          onEditClick={onEditFromDetail}
          onDeleteClick={onDelete}
          onRenewClick={onRenew}
        />
      )}

      {/* 3. MODALE NUOVO / MODIFICA */}
      {isMobile ? (
        <MobileCountdownNewModal
          isOpen={formModal.isOpen}
          onClose={formModal.close}
          countdownToEdit={formModal.data}
          onSave={onSaveCountdown}
        />
      ) : (
        <CountdownNewModal
          isOpen={formModal.isOpen}
          onClose={formModal.close}
          countdownToEdit={formModal.data}
          onSave={onSaveCountdown}
        />
      )}
    </>
  );
};
