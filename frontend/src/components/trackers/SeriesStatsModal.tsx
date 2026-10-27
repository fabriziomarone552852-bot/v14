import React, { useState } from 'react';
import { useFullSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { MediaStatsModalShell } from '@/components/trackers/shared/stats';
import { GeneralStatsView } from './SeriesStatsViews/GeneralStatsView';
import { RatingsStatsView } from './SeriesStatsViews/RatingsStatsView';
import { HabitsStatsView } from './SeriesStatsViews/HabitsStatsView';
import { RewatchStatsView } from './SeriesStatsViews/RewatchStatsView';
import { SeriesCalendarStatsView } from './SeriesStatsViews/SeriesCalendarStatsView';

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
          {activeTab === 'generale' && <GeneralStatsView stats={stats} />}
          {activeTab === 'voti' && <RatingsStatsView stats={stats} />}
          {activeTab === 'abitudini' && <HabitsStatsView stats={stats} />}
          {activeTab === 'rewatch' && <RewatchStatsView stats={stats} />}
          {activeTab === 'calendario' && <SeriesCalendarStatsView />}
        </>
      )}
    </MediaStatsModalShell>
  );
};

export default SeriesStatsModal;
