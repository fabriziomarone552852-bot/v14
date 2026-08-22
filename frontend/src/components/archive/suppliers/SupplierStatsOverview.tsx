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
      icon={
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs [&>svg]:w-5 [&>svg]:h-5">
          <StoreIcon />
        </div>
      }
      title="Fornitori & Negozi"
      subtitle="Anagrafica dei negozi, supermercati e fornitori per monitorare i prezzi e la spesa."
      className={panelClass}
    />
  );
};

export default SupplierStatsOverview;
