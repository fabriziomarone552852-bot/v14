// frontend/src/hooks/mutations/useNoteMutations.ts
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { LocalNoteEntry, NoteVariant, DailyEntry } from '@/types';
import type { DbMonthlyEntry } from '@/types/monthlyentries';
import { logger } from '@/utils/logger';

// Il "contratto": la cache che usa questo hook DEVE avere un array 'note'
export interface CacheWithNotes {
  note?: DailyEntry[];
  eventi_positivi?: DailyEntry[] | DbMonthlyEntry[];
  eventi_negativi?: DailyEntry[] | DbMonthlyEntry[];
}

// 1. IL CONTRATTO DEI DATI INVIATI (Perfettamente allineato al Backend)
export interface SaveNotePayload {
  id?: number;
  data_riferimento?: string; 
  dateStr?: string;
  testo?: string;            
  text?: string;
  tipo?: NoteVariant;        
  variant?: NoteVariant;
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
      const textVal = (note.testo || note.text || '').trim();
      if (!textVal) return Promise.resolve(null);

      const payload = { 
        data_riferimento: note.data_riferimento || note.dateStr || '', 
        tipo: note.tipo || note.variant || 'N1', 
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
          data_riferimento: newNote.data_riferimento || newNote.dateStr || '',
          tipo: newNote.tipo || newNote.variant || 'N1',
          testo: newNote.testo || newNote.text || '',
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
      logger.error("Errore salvataggio nota:", err);
      // context è ora fortemente tipizzato, l'editor sa che previousData esiste
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSuccess: (savedNoteFromDB, newNote, context) => {
      if (!savedNoteFromDB || !context) return;

      // context.tempId è riconosciuto come 'number' al 100%
      if ((newNote.isNew || !newNote.id) && context.tempId) {
        queryClient.setQueryData<T>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            note: (old.note || []).map(n => 
              n.id === context.tempId ? { ...savedNoteFromDB, isNew: false } : n
            )
          };
        });
      }
    }
  });

  // 4. Stessa cosa per l'eliminazione: Tipizziamo il Contesto per il Rollback
  const deleteNoteMutation = useMutation<
    number, 
    Error, 
    number, 
    { previousData: T | undefined }
  >({
    mutationFn: async (id: number) => {
       await api.delete(`/daily-entries/${id}`);
       return id; 
    },
    
    onMutate: async (deletedId): Promise<{ previousData: T | undefined }> => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>(queryKey);

      queryClient.setQueryData<T>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          ...(old.note && { note: old.note.filter(n => n.id !== deletedId) }),
          ...(old.eventi_positivi && { eventi_positivi: old.eventi_positivi.filter(e => e.id !== deletedId) }),
          ...(old.eventi_negativi && { eventi_negativi: old.eventi_negativi.filter(e => e.id !== deletedId) }),
        };
      });

      return { previousData };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
  });

  return {
    saveNote: (payload: SaveNotePayload) => {
      const textVal = (payload.testo || payload.text || '').trim();
      if (!textVal) return;
      saveNoteMutation.mutate(payload);
    },
    deleteNote: deleteNoteMutation.mutate,
  };
}