import React, { useState } from 'react';
import { useFullSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { MediaStatsModalShell } from '@/components/trackers/shared/stats';
import { SeriesGeneralStatsView } from './SeriesGeneralStatsView';
import { SeriesRatingsStatsView } from './SeriesRatingsStatsView';
import { SeriesHabitsStatsView } from './SeriesHabitsStatsView';
import { SeriesRewatchStatsView } from './SeriesRewatchStatsView';
import { SeriesCalendarStatsView } from './SeriesCalendarStatsView';

interface SeriesStatsModalProps {
  onClose: () => void;
}

const TABS = [
  { id: 'generale', label: 'Generale' },
  { id: 'voti', label: 'Voti' },
  { id: 'abitudini', label: 'Abitudini' },
  { id: 'rewatch', label: 'Rewatch' },
  { id: 'calendario', label: 'Calendario' },
] as const;

type SeriesStatsTab = (typeof TABS)[number]['id'];

export const SeriesStatsModal: React.FC<SeriesStatsModalProps> = ({ onClose }) => {
  const { data: stats, isLoading, isError } = useFullSeriesStats();
  const [activeTab, setActiveTab] = useState<SeriesStatsTab>('generale');

  return (
    <MediaStatsModalShell
      title="Statistiche Serie TV"
      onClose={onClose}
      isLoading={isLoading}
      isError={isError || !stats}
      loadingMessage="Elaborazione statistiche in corso..."
      errorMessage="Errore durante il caricamento delle statistiche."
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as SeriesStatsTab)}
    >
      {stats && (
        <>
          {activeTab === 'generale' && <SeriesGeneralStatsView stats={stats} />}
          {activeTab === 'voti' && <SeriesRatingsStatsView stats={stats} />}
          {activeTab === 'abitudini' && <SeriesHabitsStatsView stats={stats} />}
          {activeTab === 'rewatch' && <SeriesRewatchStatsView stats={stats} />}
          {activeTab === 'calendario' && <SeriesCalendarStatsView />}
        </>
      )}
    </MediaStatsModalShell>
  );
};

export default SeriesStatsModal;
