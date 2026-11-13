// src/mobile/components/trackers/stats/MobileSeriesStatsModal.tsx
import React, { useState } from 'react';
import { useFullSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { MobileTrackerStatsModalShell } from '../../shared/stats/MobileTrackerStatsModalShell';
import { MobileSeriesStatsOverviewSection } from './MobileSeriesStatsOverviewSection';
import { MobileSeriesStatsRatingsSection } from './MobileSeriesStatsRatingsSection';
import { MobileSeriesStatsHabitsSection } from './MobileSeriesStatsHabitsSection';
import { MobileSeriesStatsRewatchSection } from './MobileSeriesStatsRewatchSection';
import { MobileSeriesStatsCalendarModal } from './MobileSeriesStatsCalendarModal';

export interface MobileSeriesStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndexClass?: string;
}

export const MobileSeriesStatsModal: React.FC<MobileSeriesStatsModalProps> = ({
  isOpen,
  onClose,
  zIndexClass = 'z-[10020]',
}) => {
  const { data: stats, isLoading, isError, refetch } = useFullSeriesStats();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <>
      <MobileTrackerStatsModalShell
        isOpen={isOpen && !isCalendarOpen}
        onClose={onClose}
        zIndexClass={zIndexClass}
        title="Statistiche"
        subtitle="Serie TV"
        isLoading={isLoading}
        isError={isError || !stats}
        onRetry={() => refetch()}
        onOpenCalendar={() => setIsCalendarOpen(true)}
      >
        {stats && (
          <>
            {/* Sezione 1: Panoramica */}
            <MobileSeriesStatsOverviewSection stats={stats} />

            {/* Sezione 2: Valutazioni & Voti */}
            <MobileSeriesStatsRatingsSection stats={stats} />

            {/* Sezione 3: Abitudini di Visione */}
            <MobileSeriesStatsHabitsSection stats={stats} />

            {/* Sezione 4: Rewatch & Fedeltà */}
            <MobileSeriesStatsRewatchSection stats={stats} />
          </>
        )}
      </MobileTrackerStatsModalShell>

      {/* Finestra Modale Calendario Visioni */}
      <MobileSeriesStatsCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        zIndexClass="z-[10030]"
      />
    </>
  );
};

export default MobileSeriesStatsModal;
