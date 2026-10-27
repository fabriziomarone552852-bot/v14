import React, { useState } from 'react';
import { useMovieFullStats } from '@/hooks/queries/useMovieQueries';
import { MediaStatsModalShell } from '@/components/trackers/shared/stats';
import { MovieGeneralStatsView } from './MovieGeneralStatsView';
import { MovieRatingsStatsView } from './MovieRatingsStatsView';
import { MovieHabitsStatsView } from './MovieHabitsStatsView';
import { MovieRewatchStatsView } from './MovieRewatchStatsView';
import { MovieCalendarStatsView } from './MovieCalendarStatsView';

interface MovieStatsModalProps {
  onClose: () => void;
}

const TABS = [
  { id: 'generale', label: 'Generale' },
  { id: 'voti', label: 'Voti' },
  { id: 'abitudini', label: 'Abitudini' },
  { id: 'rewatch', label: 'Rewatch' },
  { id: 'calendario', label: 'Calendario' },
] as const;

type MovieStatsTab = (typeof TABS)[number]['id'];

export const MovieStatsModal: React.FC<MovieStatsModalProps> = ({ onClose }) => {
  const { data: stats, isLoading, isError } = useMovieFullStats();
  const [activeTab, setActiveTab] = useState<MovieStatsTab>('generale');

  return (
    <MediaStatsModalShell
      title="Statistiche Film"
      onClose={onClose}
      isLoading={isLoading}
      isError={isError || !stats}
      loadingMessage="Elaborazione statistiche film in corso..."
      errorMessage="Errore durante il caricamento delle statistiche film."
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as MovieStatsTab)}
    >
      {stats && (
        <>
          {activeTab === 'generale' && <MovieGeneralStatsView stats={stats} />}
          {activeTab === 'voti' && <MovieRatingsStatsView stats={stats} />}
          {activeTab === 'abitudini' && <MovieHabitsStatsView stats={stats} />}
          {activeTab === 'rewatch' && <MovieRewatchStatsView stats={stats} />}
          {activeTab === 'calendario' && <MovieCalendarStatsView />}
        </>
      )}
    </MediaStatsModalShell>
  );
};

export default MovieStatsModal;
