// src/hooks/useRoutineManager.ts
import { useState } from 'react';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { RoutineSavePayload } from '@/components/day/RoutineNewModal';
import type { SaveHabitPayload } from '@/types';
import { calculateSafeSuspendDate, getActivePeriodToSuspend } from '@/utils/habitUtils';

interface UseRoutineManagerProps {
  targetDateStr: string;
  suspendRoutine: (params: { habitId: number; periodId: number; endDate: string }) => Promise<unknown> | void;
  resumeRoutine: (params: { habitId: number; target: number; startDate: string }) => Promise<unknown> | void;
  updateHabitPeriod: (params: { habitId: number; periodId: number; target: number }) => Promise<unknown> | void;
  saveHabit: (payload: SaveHabitPayload) => Promise<unknown> | void;
}

export const useRoutineManager = ({ 
  targetDateStr, suspendRoutine, resumeRoutine, updateHabitPeriod, saveHabit 
}: UseRoutineManagerProps) => {
  const [isResuming, setIsResuming] = useState(false);

  // 1. Logica per capire se la routine è attiva estraendo i periodi
  const getRoutineStatus = (routine: RoutineItem | null) => {
    const activePeriod = getActivePeriodToSuspend(routine, targetDateStr);
    const isAttiva = Boolean(
      routine &&
        (activePeriod
          ? !routine.periods?.find((p) => p.id === activePeriod.id)?.data_fine ||
            (routine.periods?.find((p) => p.id === activePeriod.id)?.data_fine ?? '') >= targetDateStr
          : true)
    );
    return { sortedPeriods: routine?.periods ?? [], isAttiva };
  };

  // 2. Logica per la sospensione
  const handleSuspend = (routine: RoutineItem) => {
    const periodToSuspend = getActivePeriodToSuspend(routine, targetDateStr);
    if (!periodToSuspend) return;
    
    const endDate = calculateSafeSuspendDate(periodToSuspend.data_inizio, targetDateStr);
    
    suspendRoutine({ 
      habitId: routine.id, 
      periodId: periodToSuspend.id, 
      endDate
    });
  };

  // 3. Logica unificata per il salvataggio (Crea, Modifica, Riattiva)
  const handleSaveRoutine = async (habitId: number | undefined, payload: RoutineSavePayload, currentPeriodId?: number) => {
    if (habitId) {
      // CASO A: Modifica o Riattivazione
      await saveHabit({ 
        existingId: habitId, 
        data: { 
          titolo: payload.titolo,
          tipo: payload.tipo,
          immagine_url: payload.immagine_url,
          immagine_posizione: payload.immagine_posizione,
          rrule: payload.rrule
        }
      });

      if (isResuming) {
        await resumeRoutine({
          habitId,
          target: payload.target_completamenti,
          startDate: payload.data_inizio 
        });
      } else if (currentPeriodId) {
        await updateHabitPeriod({
          habitId,
          periodId: currentPeriodId,
          target: payload.target_completamenti
        });
      }
    } else {
      // CASO B: Creazione
      await saveHabit({ 
        data: { 
          titolo: payload.titolo,
          tipo: payload.tipo,
          immagine_url: payload.immagine_url,
          immagine_posizione: payload.immagine_posizione,
          rrule: payload.rrule,
          periods: [{
            data_inizio: payload.data_inizio,
            target: payload.target_completamenti
          }]
        }
      });
    }

    setIsResuming(false); // Resetta lo stato alla fine
  };

  return {
    isResuming,
    setIsResuming,
    getRoutineStatus,
    handleSuspend,
    handleSaveRoutine
  };
};