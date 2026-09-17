import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { rollbackOnError } from '@/utils/queryCacheUtils';
import type { DbMonthlyEntry, MonthlyType } from '@/types/monthlyentries';

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

export const useMonthlyEntryMutations = (queryKey: QueryKey) => {
  const queryClient = useQueryClient();

  const saveEntryMutation = useMutation({
    mutationFn: async (payload: SaveMonthlyEntryPayload): Promise<DbMonthlyEntry | null> => {
      // Se abbiamo un ID valido e testo vuoto -> eliminazione (DELETE)
      if (payload.existingEntryId && payload.existingEntryId > 0 && !payload.monthly_field?.trim()) {
        await api.delete(`/monthly-entries/${payload.existingEntryId}`);
        return null;
      }

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
      const textTrimmed = (newEntry.monthly_field || '').trim();

      queryClient.setQueryData<MonthCacheData>(queryKey, (old) => {
        if (!old) return old;

        const currentEntries = old.monthly_entries || [];
        let updatedEntries: DbMonthlyEntry[];

        if (newEntry.existingEntryId && newEntry.existingEntryId > 0) {
          if (!textTrimmed) {
            // Se testo vuoto, rimuovi l'entry
            updatedEntries = currentEntries.filter(e => e.id !== newEntry.existingEntryId);
          } else {
            // Aggiornamento ottimistico sul record con quell'ID
            updatedEntries = currentEntries.map(e =>
              e.id === newEntry.existingEntryId
                ? { ...e, monthly_field: newEntry.monthly_field }
                : e
            );
          }
        } else {
          // Creazione ottimistica nuovo record
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
      // Sostituiamo l'ID temporaneo con quello reale del DB o rimuoviamo se cancellato
      if (context?.tempId) {
        queryClient.setQueryData<MonthCacheData>(queryKey, (old) => {
          if (!old) return old;
          if (!savedEntry) {
            return {
              ...old,
              monthly_entries: (old.monthly_entries || []).filter(e => e.id !== context.tempId),
            };
          }
          const updatedEntries = (old.monthly_entries || []).map(e =>
            e.id === context.tempId ? savedEntry : e
          );
          return { ...old, monthly_entries: updatedEntries };
        });
      }
    },

    onError: (err, _newEntry, context) => {
      rollbackOnError(err, context, queryClient, queryKey, 'Errore salvataggio monthly entry:');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['monthly_entries'] });
      queryClient.invalidateQueries({ queryKey: ['tags_archive'] });
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
      rollbackOnError(err, context, queryClient, queryKey, 'Errore eliminazione monthly entry:');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['monthly_entries'] });
      queryClient.invalidateQueries({ queryKey: ['tags_archive'] });
    },
  });

  return {
    saveMonthlyEntry: saveEntryMutation.mutate,
    saveMonthlyEntryAsync: saveEntryMutation.mutateAsync,
    deleteMonthlyEntry: deleteEntryMutation.mutate,
  };
};