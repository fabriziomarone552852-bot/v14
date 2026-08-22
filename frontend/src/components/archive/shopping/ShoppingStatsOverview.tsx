// src/components/archive/shopping/ShoppingStatsOverview.tsx
import React from 'react';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';

interface ShoppingStatsOverviewProps {
  panelClass?: string;
}

export const ShoppingStatsOverview: React.FC<ShoppingStatsOverviewProps> = ({
  panelClass,
}) => {
  return (
    <ArchiveHeader
      icon={<ShoppingIcon className="w-5 h-5 text-white" />}
      title="Gestione Spesa & Liste"
      subtitle="Organizza e consulta gruppi, liste della spesa e lo storico prezzi nel tempo."
      className={panelClass}
    />
  );
};

export default ShoppingStatsOverview;
