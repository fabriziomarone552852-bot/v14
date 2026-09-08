// src/context/RoutineModalContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { RoutineSavePayload } from '@/components/day/RoutineNewModal';
import RoutineDetailModal from '@/components/day/RoutineDetailModal';
import RoutineNewModal from '@/components/day/RoutineNewModal';
import MobileRoutineDetailModal from '@/mobile/components/modals/MobileRoutineDetailModal';
import MobileRoutineNewModal from '@/mobile/components/modals/MobileRoutineNewModal';
import { useModal } from '@/hooks/useModals';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createHabit,
  updateHabit,
  deleteHabit as apiDeleteHabit,
  createHabitPeriod,
  updateHabitPeriod as apiUpdateHabitPeriod,
} from '@/api/habitsApi';
import { formatDateString } from '@/utils/dateUtils';
import { useDay } from './DayContext';

interface RoutineModalContextType {
  isDetailOpen: boolean;
  selectedRoutine: RoutineItem | null;
  isFormOpen: boolean;
  routineToEdit: RoutineItem | null;
  openRoutineDetail: (routine: RoutineItem) => void;
  closeRoutineDetail: () => void;
  openRoutineForm: (routineToEdit?: RoutineItem | null) => void;
  closeRoutineForm: () => void;
}

const RoutineModalContext = createContext<RoutineModalContextType | undefined>(undefined);

export const RoutineModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const detailModal = useModal<RoutineItem>();
  const formModal = useModal<RoutineItem | null>();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { dataRiferimento: targetDate } = useDay();
  const targetDateStr = formatDateString(targetDate);

  const [isResuming, setIsResuming] = useState(false);

  const invalidateHabitQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['daySync'] });
    queryClient.invalidateQueries({ queryKey: ['habits'] });
  };

  const saveRoutineMutation = useMutation({
    mutationFn: async ({
      habitId,
      payload,
      currentPeriodId,
    }: {
      habitId?: number;
      payload: RoutineSavePayload;
      currentPeriodId?: number;
    }) => {
      if (habitId) {
        // Aggiorna dati base abitudine/routine
        await updateHabit(habitId, {
          titolo: payload.titolo,
          tipo: payload.tipo,
          immagine_url: payload.immagine_url,
          immagine_posizione: payload.immagine_posizione,
          rrule: payload.rrule,
        });

        if (isResuming) {
          await createHabitPeriod(habitId, {
            data_inizio: payload.data_inizio,
            target: payload.target_completamenti,
          });
        } else if (currentPeriodId) {
          await apiUpdateHabitPeriod(habitId, currentPeriodId, {
            target: payload.target_completamenti,
          });
        }
      } else {
        // Creazione nuova routine
        await createHabit({
          titolo: payload.titolo,
          tipo: payload.tipo,
          immagine_url: payload.immagine_url,
          immagine_posizione: payload.immagine_posizione,
          rrule: payload.rrule,
          periods: [
            {
              data_inizio: payload.data_inizio,
              target: payload.target_completamenti,
            },
          ],
        });
      }
    },
    onSuccess: () => {
      invalidateHabitQueries();
      setIsResuming(false);
      formModal.close();
    },
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiDeleteHabit(id);
      return id;
    },
    onSuccess: () => {
      invalidateHabitQueries();
      detailModal.close();
    },
  });

  const suspendRoutineMutation = useMutation({
    mutationFn: async ({
      habitId,
      periodId,
      endDate,
    }: {
      habitId: number;
      periodId: number;
      endDate: string;
    }) => {
      await apiUpdateHabitPeriod(habitId, periodId, { data_fine: endDate });
    },
    onSuccess: () => {
      invalidateHabitQueries();
      detailModal.close();
    },
  });

  // Calcolo stato routine (attiva/sospesa)
  const selectedRoutine = detailModal.data || null;
  const sortedPeriods = selectedRoutine?.periods
    ? [...selectedRoutine.periods].sort(
        (a, b) => new Date(b.data_inizio).getTime() - new Date(a.data_inizio).getTime()
      )
    : [];
  const isAttiva = sortedPeriods.length > 0 && !sortedPeriods[0].data_fine;

  const handleSuspend = (routine: RoutineItem) => {
    if (sortedPeriods.length === 0) return;
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const ieri = new Date(y, m - 1, d);
    ieri.setDate(ieri.getDate() - 1);

    suspendRoutineMutation.mutate({
      habitId: routine.id,
      periodId: sortedPeriods[0].id,
      endDate: formatDateString(ieri),
    });
  };

  const handleEditRoutine = () => {
    if (detailModal.data) {
      formModal.open(detailModal.data);
      detailModal.close();
    }
  };

  const handleResumeRoutine = () => {
    if (detailModal.data) {
      setIsResuming(true);
      formModal.open(detailModal.data);
      detailModal.close();
    }
  };

  const handleSaveRoutine = async (payload: RoutineSavePayload) => {
    await saveRoutineMutation.mutateAsync({
      habitId: formModal.data?.id,
      payload,
      currentPeriodId: formModal.data?.periodId,
    });
  };

  return (
    <RoutineModalContext.Provider
      value={{
        isDetailOpen: detailModal.isOpen,
        selectedRoutine: detailModal.data || null,
        isFormOpen: formModal.isOpen,
        routineToEdit: formModal.data || null,
        openRoutineDetail: (routine) => detailModal.open(routine),
        closeRoutineDetail: detailModal.close,
        openRoutineForm: (routineToEdit = null) => {
          setIsResuming(false);
          formModal.open(routineToEdit);
        },
        closeRoutineForm: () => {
          setIsResuming(false);
          formModal.close();
        },
      }}
    >
      {children}

      {isMobile ? (
        <>
          <MobileRoutineDetailModal
            isOpen={detailModal.isOpen}
            onClose={detailModal.close}
            selectedRoutine={detailModal.data}
            onEditClick={handleEditRoutine}
            onDeleteClick={(id) => deleteRoutineMutation.mutate(id)}
            isAttiva={isAttiva}
            onSuspendClick={() => {
              if (selectedRoutine) handleSuspend(selectedRoutine);
            }}
            onResumeClick={handleResumeRoutine}
          />

          <MobileRoutineNewModal
            isOpen={formModal.isOpen}
            onClose={() => {
              setIsResuming(false);
              formModal.close();
            }}
            routineToEdit={formModal.data}
            onSave={handleSaveRoutine}
          />
        </>
      ) : (
        <>
          <RoutineDetailModal
            isOpen={detailModal.isOpen}
            onClose={detailModal.close}
            selectedRoutine={detailModal.data}
            onEditClick={handleEditRoutine}
            onDeleteClick={(id) => deleteRoutineMutation.mutate(id)}
            isAttiva={isAttiva}
            onSuspendClick={() => {
              if (selectedRoutine) handleSuspend(selectedRoutine);
            }}
            onResumeClick={handleResumeRoutine}
          />

          <RoutineNewModal
            isOpen={formModal.isOpen}
            onClose={() => {
              setIsResuming(false);
              formModal.close();
            }}
            routineToEdit={formModal.data}
            onSave={handleSaveRoutine}
          />
        </>
      )}
    </RoutineModalContext.Provider>
  );
};

export const useRoutineModals = (): RoutineModalContextType => {
  const context = useContext(RoutineModalContext);
  if (!context) {
    throw new Error('useRoutineModals deve essere usato dentro RoutineModalProvider');
  }
  return context;
};

export default RoutineModalContext;
