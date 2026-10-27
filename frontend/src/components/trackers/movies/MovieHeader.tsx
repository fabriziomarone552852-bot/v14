import React from 'react';
import { TrackerHeader } from '../shared/TrackerHeader';

interface MovieHeaderProps {
  goalPercent: number;
  goalViewType: 'percent' | 'fraction';
  setGoalViewType: React.Dispatch<React.SetStateAction<'percent' | 'fraction'>>;
  currentMovies: number;
  goal: number;
  setStatsModalOpen: (b: boolean) => void;
  setRandomModalOpen: (b: boolean) => void;
}

export const MovieHeader: React.FC<MovieHeaderProps> = ({
  goalPercent,
  goalViewType,
  setGoalViewType,
  currentMovies,
  goal,
  setStatsModalOpen,
  setRandomModalOpen,
}) => {
  return (
    <TrackerHeader
      title="Film"
      goalLabel="Obiettivo Annuale di Film"
      goalPercent={goalPercent}
      goalViewType={goalViewType}
      onToggleGoalViewType={() => setGoalViewType((prev) => (prev === 'percent' ? 'fraction' : 'percent'))}
      currentCount={currentMovies}
      goalTotal={goal}
      onOpenStats={() => setStatsModalOpen(true)}
      onOpenRandom={() => setRandomModalOpen(true)}
      statsButtonTitle="Vedi Statistiche Film"
      randomButtonTooltip="Non sai cosa guardare? Scegliamo un film per te!"
    />
  );
};
