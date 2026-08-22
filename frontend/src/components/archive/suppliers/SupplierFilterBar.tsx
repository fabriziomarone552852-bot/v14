// src/components/archive/suppliers/SupplierFilterBar.tsx
import React from 'react';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';

interface SupplierFilterBarProps {
  onOpenNewSupplier: () => void;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const SupplierFilterBar: React.FC<SupplierFilterBarProps> = ({
  onOpenNewSupplier,
  onOpenSearch,
  activeFiltersCount,
  panelClass,
}) => {
  return (
    <ArchiveActionBar
      addLabel="Nuovo Fornitore"
      onAdd={onOpenNewSupplier}
      onOpenSearch={onOpenSearch}
      activeFiltersCount={activeFiltersCount}
      className={panelClass}
    />
  );
};

export default SupplierFilterBar;
