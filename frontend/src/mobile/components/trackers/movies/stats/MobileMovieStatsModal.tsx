// src/mobile/components/trackers/stats/MobileMovieStatsModal.tsx
import React, { useState } from 'react';
import { useMovieFullStats } from '@/hooks/queries/useMovieQueries';
import { MobileTrackerStatsModalShell } from '../../shared/stats/MobileTrackerStatsModalShell';
import { MobileMovieStatsOverviewSection } from './MobileMovieStatsOverviewSection';
import { MobileMovieStatsRatingsSection } from './MobileMovieStatsRatingsSection';
import { MobileMovieStatsHabitsSection } from './MobileMovieStatsHabitsSection';
import { MobileMovieStatsRewatchSection } from './MobileMovieStatsRewatchSection';
import { MobileMovieStatsCalendarModal } from './MobileMovieStatsCalendarModal';

export interface MobileMovieStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndexClass?: string;
}

export const MobileMovieStatsModal: React.FC<MobileMovieStatsModalProps> = ({
  isOpen,
  onClose,
  zIndexClass = 'z-[10020]',
}) => {
  const { data: stats, isLoading, isError, refetch } = useMovieFullStats();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <>
      <MobileTrackerStatsModalShell
        isOpen={isOpen && !isCalendarOpen}
        onClose={onClose}
        zIndexClass={zIndexClass}
        title="Statistiche"
        subtitle="Film"
        isLoading={isLoading}
        isError={isError || !stats}
        onRetry={() => refetch()}
        onOpenCalendar={() => setIsCalendarOpen(true)}
      >
        {stats && (
          <>
            {/* Sezione 1: Panoramica */}
            <MobileMovieStatsOverviewSection stats={stats} />

            {/* Sezione 2: Valutazioni & Voti */}
            <MobileMovieStatsRatingsSection stats={stats} />

            {/* Sezione 3: Abitudini di Visione */}
            <MobileMovieStatsHabitsSection stats={stats} />

            {/* Sezione 4: Rewatch & Fedeltà */}
            <MobileMovieStatsRewatchSection stats={stats} />
          </>
        )}
      </MobileTrackerStatsModalShell>

      {/* Finestra Modale Calendario Visioni Film */}
      <MobileMovieStatsCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        zIndexClass="z-[10030]"
      />
    </>
  );
};

export default MobileMovieStatsModal;
