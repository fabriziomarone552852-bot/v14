// src/hooks/useNotes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
  type CreateNotePayload,
  type UpdateNotePayload,
} from '@/api/notes';
import type { DailyEntry } from '@/types/dailyentries';

export const NOTES_QUERY_KEY = ['notes'];

export const useNotes = () => {
  return useQuery<DailyEntry[]>({
    queryKey: NOTES_QUERY_KEY,
    queryFn: getNotes,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotePayload) => apiCreateNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['day'] });
      queryClient.invalidateQueries({ queryKey: ['week'] });
      queryClient.invalidateQueries({ queryKey: ['month'] });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateNotePayload }) =>
      apiUpdateNote(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousNotes = queryClient.getQueryData<DailyEntry[]>(NOTES_QUERY_KEY);

      queryClient.setQueryData<DailyEntry[]>(NOTES_QUERY_KEY, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, ...payload } : n))
      );

      return { previousNotes };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['day'] });
      queryClient.invalidateQueries({ queryKey: ['week'] });
      queryClient.invalidateQueries({ queryKey: ['month'] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiDeleteNote(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousNotes = queryClient.getQueryData<DailyEntry[]>(NOTES_QUERY_KEY);

      queryClient.setQueryData<DailyEntry[]>(NOTES_QUERY_KEY, (old = []) =>
        old.filter((n) => n.id !== id)
      );

      return { previousNotes };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['day'] });
      queryClient.invalidateQueries({ queryKey: ['week'] });
      queryClient.invalidateQueries({ queryKey: ['month'] });
    },
  });
};
