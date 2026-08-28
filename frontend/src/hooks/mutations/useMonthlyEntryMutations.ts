// frontend/src/hooks/mutations/useMonthlyEntryMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { DbMonthlyEntry, MonthlyType } from '@/types/monthlyentries';
import { logger } from '@/utils/logger';

export interface SaveMonthlyEntryPayload {
  monthly_type: MonthlyType;
  monthly_field: string;
  dateStr: string;
  existingEntryId?: number;
}

// 🪄 ZERO ANY: Interfaccia sicura per la cache in memoria
interface MonthCacheData {
  monthly_entries?: DbMonthlyEntry[];
  [key: string]: unknown;
}

export const useMonthlyEntryMutations = (queryKey: string[]) => {
  const queryClient = useQueryClient();

  const saveEntryMutation = useMutation({
    mutationFn: async (payload: SaveMonthlyEntryPayload): Promise<DbMonthlyEntry> => {
      // Se abbiamo un ID valido, facciamo l'aggiornamento (PATCH)
      if (payload.existingEntryId && payload.existingEntryId > 0) {
        const response = await api.patch(`/monthly-entries/${payload.existingEntryId}`, {
          monthly_field: payload.monthly_field,
        });
        return response as DbMonthlyEntry;
      }

      // Altrimenti è un nuovo inserimento (POST)
      const dataForServer = {
        year: parseInt(payload.dateStr.substring(0, 4), 10),
        month: parseInt(payload.dateStr.substring(5, 7), 10),
        monthly_type: payload.monthly_type,
        monthly_field: payload.monthly_field,
      };

      const response = await api.post('/monthly-entries', dataForServer);
      return response as DbMonthlyEntry;
    },

    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<MonthCacheData>(queryKey);
      const tempId = -(Date.now());

      queryClient.setQueryData<MonthCacheData>(queryKey, (old) => {
        if (!old) return old;

        const currentEntries = old.monthly_entries || [];
        // EP, EN, PM possono avere record multipli — per gli altri aggiorniamo l'esistente
        const isMulti = ['EP', 'EN', 'PM'].includes(newEntry.monthly_type);

        let updatedEntries: DbMonthlyEntry[];

        if (!isMulti && newEntry.existingEntryId && newEntry.existingEntryId > 0) {
          // Aggiornamento ottimistico di un entry unico esistente
          updatedEntries = currentEntries.map(e =>
            e.id === newEntry.existingEntryId
              ? { ...e, monthly_field: newEntry.monthly_field }
              : e
          );
        } else {
          // Creazione ottimistica (sia multi-record che primo inserimento)
          updatedEntries = [...currentEntries, {
            id: tempId,
            user_id: 0,
            year: parseInt(newEntry.dateStr.substring(0, 4)),
            month: parseInt(newEntry.dateStr.substring(5, 7)),
            monthly_type: newEntry.monthly_type,
            monthly_field: newEntry.monthly_field,
          }];
        }

        return { ...old, monthly_entries: updatedEntries };
      });

      return { previousData, tempId };
    },

    onSuccess: (savedEntry, _newEntry, context) => {
      // Sostituiamo l'ID temporaneo con quello reale del DB
      if (context?.tempId) {
        queryClient.setQueryData<MonthCacheData>(queryKey, (old) => {
          if (!old) return old;
          const updatedEntries = (old.monthly_entries || []).map(e =>
            e.id === context.tempId ? savedEntry : e
          );
          return { ...old, monthly_entries: updatedEntries };
        });
      }
    },

    onError: (err, _newEntry, context) => {
      logger.error('Errore salvataggio monthly entry:', err);
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number): Promise<number> => {
      await api.delete(`/monthly-entries/${entryId}`);
      return entryId;
    },

    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<MonthCacheData>(queryKey);

      queryClient.setQueryData<MonthCacheData>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          monthly_entries: (old.monthly_entries || []).filter(e => e.id !== entryId),
        };
      });

      return { previousData };
    },

    onError: (err, _id, context) => {
      logger.error('Errore eliminazione monthly entry:', err);
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    saveMonthlyEntry: saveEntryMutation.mutate,
    saveMonthlyEntryAsync: saveEntryMutation.mutateAsync,
    deleteMonthlyEntry: deleteEntryMutation.mutate,
  };
};