import React from 'react';
import { TrackerHeader } from './shared/TrackerHeader';

interface Props {
  goalPercent: number;
  goalViewType: 'percent' | 'fraction';
  setGoalViewType: React.Dispatch<React.SetStateAction<'percent' | 'fraction'>>;
  currentEpisodes: number;
  goal: number;
  setStatsModalOpen: (b: boolean) => void;
  setRandomModalOpen: (b: boolean) => void;
}

export const TVSeriesHeader: React.FC<Props> = ({
  goalPercent,
  goalViewType,
  setGoalViewType,
  currentEpisodes,
  goal,
  setStatsModalOpen,
  setRandomModalOpen,
}) => {
  return (
    <TrackerHeader
      title="Serie TV"
      goalLabel="Obiettivo Annuale di Episodi"
      goalPercent={goalPercent}
      goalViewType={goalViewType}
      onToggleGoalViewType={() => setGoalViewType((prev) => (prev === 'percent' ? 'fraction' : 'percent'))}
      currentCount={currentEpisodes}
      goalTotal={goal}
      onOpenStats={() => setStatsModalOpen(true)}
      onOpenRandom={() => setRandomModalOpen(true)}
      statsButtonTitle="Vedi Statistiche Serie TV"
    />
  );
};
