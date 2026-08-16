// frontend/src/hooks/uiYear/useYearBingo.ts
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { bingoApi } from '@/api/bingoApi';
import type { SyncYearResponse } from '@/hooks/useAgendaYear';
import type { DbBingoEntry } from '@/types/yearlyentries';

export interface UseYearBingoResult {
  cells: DbBingoEntry[];
  handleCreateCell: (testo: string, posizione?: number) => Promise<void>;
  handleUpdateText: (id: number, testo: string) => Promise<void>;
  handleToggleDone: (id: number, currentDone: boolean) => Promise<void>;
  handleDeleteCell: (id: number) => Promise<void>;
}

export const useYearBingo = (yearData: SyncYearResponse | undefined, year: number): UseYearBingoResult => {
  const queryClient = useQueryClient();
  const queryKey = ['yearSync', year];

  const cells = useMemo(() => yearData?.bingo ?? [], [yearData]);

  const updateCellsState = (updater: (prev: DbBingoEntry[]) => DbBingoEntry[]) => {
    queryClient.setQueryData<SyncYearResponse>(queryKey, (old) => {
      if (!old) return old;
      const updated = updater(old.bingo ?? []).sort((a, b) => (a.posizione ?? a.id) - (b.posizione ?? b.id));
      return {
        ...old,
        bingo: updated,
      };
    });
  };

  const handleCreateCell = async (testo: string, posizione?: number) => {
    const randomRot = Math.floor(Math.random() * 360);
    const created = await bingoApi.create({ year, testo, posizione, rotazione: randomRot });
    if (created) updateCellsState(prev => [...prev, created]);
  };

  const handleUpdateText = async (id: number, testo: string) => {
    const updated = await bingoApi.update(id, { testo });
    if (updated) updateCellsState(prev => prev.map(c => c.id === id ? updated : c));
  };

  const handleToggleDone = async (id: number, currentDone: boolean) => {
    // Genera un angolo di rotazione casuale ad ampio raggio (0° - 360°) ad ogni click
    const newRot = Math.floor(Math.random() * 360);
    const updated = await bingoApi.update(id, { done: !currentDone, rotazione: newRot });
    if (updated) updateCellsState(prev => prev.map(c => c.id === id ? updated : c));
  };

  const handleDeleteCell = async (id: number) => {
    await bingoApi.delete(id);
    updateCellsState(prev => prev.filter(c => c.id !== id));
  };

  return {
    cells,
    handleCreateCell,
    handleUpdateText,
    handleToggleDone,
    handleDeleteCell,
  };
};
