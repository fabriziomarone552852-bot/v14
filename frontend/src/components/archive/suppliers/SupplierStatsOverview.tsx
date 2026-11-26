// src/components/archive/suppliers/SupplierStatsOverview.tsx
import React from 'react';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { StoreIcon } from '@/components/shared/utils/Icons';

interface SupplierStatsOverviewProps {
  panelClass?: string;
}

export const SupplierStatsOverview: React.FC<SupplierStatsOverviewProps> = ({
  panelClass,
}) => {
  return (
    <ArchiveHeader
      icon={<StoreIcon className="w-5 h-5 text-white" />}
      title="Negozi & Brand"
      subtitle="Anagrafica dei punti vendita, negozi di fiducia e dei marchi per monitorare i prezzi e la spesa."
      className={panelClass}
    />
  );
};

export default SupplierStatsOverview;
