import React from 'react';
import type { TVFullStats } from '@/types/trackers';
import {
  ComfortZoneCard,
  GuiltyPleasuresCard,
  ExplorationVsNostalgiaCard,
} from '@/components/trackers/shared/stats';

interface Props {
  stats: TVFullStats;
}

export const RewatchStatsView: React.FC<Props> = ({ stats }) => {
  return (
    <div className="gap-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <ComfortZoneCard
          title="Comfort Zone"
          tabs={[
            { key: 'series', label: 'Serie', items: stats.most_rewatched || [] },
            {
              key: 'episodes',
              label: 'Episodi',
              items: stats.most_rewatched_episodes || [],
            },
          ]}
          defaultTabKey="series"
        />

        <GuiltyPleasuresCard
          title="Il Test del Tempo"
          items={stats.guilty_pleasures || []}
        />

        <ExplorationVsNostalgiaCard
          title="Esplorazione vs Nostalgia"
          firstWatchHours={stats.rewatch_comparison?.first_watch_hours || 0}
          rewatchHours={stats.rewatch_comparison?.rewatch_hours || 0}
        />
      </div>
    </div>
  );
};
