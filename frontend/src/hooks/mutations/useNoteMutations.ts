import axios from 'axios';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { rollbackOnError } from '@/utils/queryCacheUtils';
import type { LocalNoteEntry, NoteVariant, DailyEntry } from '@/types';
import type { DbMonthlyEntry } from '@/types/monthlyentries';

// Il "contratto": la cache che usa questo hook DEVE avere un array 'note'
export interface CacheWithNotes {
  note?: DailyEntry[];
  eventi_positivi?: DailyEntry[] | DbMonthlyEntry[];
  eventi_negativi?: DailyEntry[] | DbMonthlyEntry[];
}

// 1. IL CONTRATTO DEI DATI INVIATI — allineato ai nomi del DB e del backend
export interface SaveNotePayload {
  id?: number;
  data_riferimento?: string;
  testo?: string;
  tipo?: NoteVariant;
  isNew?: boolean;
}

// 2. 🪄 IL CONTRATTO DEL CONTESTO: Elimina i tipi "any/unknown" in onSuccess/onError
export interface NoteMutationContext<T> {
  previousData: T | undefined;
  tempId: number;
}

export function useNoteMutations<T extends CacheWithNotes>(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  // 3. Tipizziamo ESATTAMENTE la mutazione: <DatiDalServer, Errore, DatiInviati, Contesto>
  const saveNoteMutation = useMutation<
    DailyEntry | null,      // TData
    Error,                  // TError
    SaveNotePayload,        // TVariables
    NoteMutationContext<T>  // TContext
  >({
    mutationFn: async (note) => {
      const textVal = (note.testo || '').trim();
      if (!textVal) return Promise.resolve(null);

      const payload = { 
        data_riferimento: note.data_riferimento || '', 
        tipo: note.tipo || 'N1', 
        testo: textVal 
      };
      
      const result = note.id && !note.isNew 
        ? await api.patch<DailyEntry>(`/daily-entries/${note.id}`, payload)
        : await api.post<DailyEntry>('/daily-entries', payload);
        
      return result;
    },
    
    // onMutate ora DEVE restituire una Promise che contiene esattamente NoteMutationContext<T>
    onMutate: async (newNote): Promise<NoteMutationContext<T>> => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>(queryKey);

      const tempId = newNote.id || Date.now();

      queryClient.setQueryData<T>(queryKey, (old) => {
        if (!old) return old;

        const currentNotes = old.note || [];
        
        const noteEntry: LocalNoteEntry = {
          id: tempId, 
          data_riferimento: newNote.data_riferimento || '',
          tipo: newNote.tipo || 'N1',
          testo: newNote.testo || '',
          user_id: 0,
          isNew: newNote.isNew
        };

        const exists = currentNotes.some(n => n.id === tempId);

        return {
          ...old,
          note: exists 
            ? currentNotes.map(n => n.id === tempId ? { ...n, ...noteEntry } : n)
            : [noteEntry, ...currentNotes]
        };
      });

      return { previousData, tempId };
    },

    onError: (err, _newNote, context) => {
      rollbackOnError(err, context, queryClient, queryKey, 'Errore salvataggio nota:');
    },

    onSuccess: (savedNoteFromDB, newNote, context) => {
      if (!savedNoteFromDB || !context) return;

      // context.tempId è riconosciuto come 'number' al 100%
      if ((newNote.isNew || !newNote.id) && context.tempId) {
        queryClient.setQueryData<T>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            note: (old.note || []).map((n) =>
              n.id === context.tempId ? { ...savedNoteFromDB, isNew: false } : n
            ),
          };
        });
      }

      // Sincronizza istantaneamente l'Archivio Note e le altre viste dell'agenda
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // 4. Stessa cosa per l'eliminazione: Tipizziamo il Contesto per il Rollback
  const deleteNoteMutation = useMutation<
    number, 
    Error, 
    { id: number; isNew?: boolean }, 
    { previousData: T | undefined }
  >({
    mutationFn: async ({ id, isNew }) => {
      // Se la nota è locale / nuova (tempId) e non è mai stata sincronizzata sul server, non chiamiamo l'API
      if (isNew || id > 1000000000000) {
        return id;
      }
      try {
        await api.delete(`/daily-entries/${id}`);
      } catch (err: unknown) {
        // Se l'API restituisce 404, la nota non esiste già sul server: trattala come eliminata con successo
        if (axios.isAxiosError(err) && (err.status === 404 || err.response?.status === 404)) {
          return id;
        }
        throw err;
      }
      return id; 
    },
    
    onMutate: async ({ id: deletedId }): Promise<{ previousData: T | undefined }> => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>(queryKey);

      queryClient.setQueryData<T>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          ...(old.note && { note: old.note.filter((n) => n.id !== deletedId) }),
          ...(old.eventi_positivi && { eventi_positivi: old.eventi_positivi.filter((e) => e.id !== deletedId) }),
          ...(old.eventi_negativi && { eventi_negativi: old.eventi_negativi.filter((e) => e.id !== deletedId) }),
        };
      });

      return { previousData };
    },
    onError: (err, { id }, context) => {
      if (id > 1000000000000) return; // nota locale mai sincronizzata — nessun rollback necessario
      rollbackOnError(err, context, queryClient, queryKey, 'Errore cancellazione nota:');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    saveNote: (payload: SaveNotePayload) => {
      const textVal = (payload.testo || '').trim();
      if (!textVal && !payload.isNew) return;
      saveNoteMutation.mutate(payload);
    },
    deleteNote: (idOrPayload: number | { id: number; isNew?: boolean }, isNew?: boolean) => {
      const id = typeof idOrPayload === 'number' ? idOrPayload : idOrPayload.id;
      const isNewNote = typeof idOrPayload === 'object' ? idOrPayload.isNew : (isNew || id > 1000000000000);
      deleteNoteMutation.mutate({ id, isNew: isNewNote });
    },
  };
}