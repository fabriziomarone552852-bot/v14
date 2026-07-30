import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '@/api/categories';
import type {
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '@/types/categories';
import { useAuth } from '@/context/AuthContext';

export const categoriesQueryKey = ['categories'] as const;

export function useCategories() {
  const { token } = useAuth();

  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: async () => {
      if (!token) {
        throw new Error('Token non disponibile');
      }
      return getCategories(token);
    },
    enabled: Boolean(token),
  });
}

export function useCategory(categoryId?: number) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: async () => {
      if (!token) {
        throw new Error('Token non disponibile');
      }
      if (!categoryId) {
        throw new Error('ID categoria non valido');
      }
      return getCategory(token, categoryId);
    },
    enabled: Boolean(token && categoryId),
  });
}

export function useCreateCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CategoryCreatePayload) => {
      if (!token) {
        throw new Error('Token non disponibile');
      }
      return createCategory(token, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    },
  });
}

export function useUpdateCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CategoryUpdatePayload;
    }) => {
      if (!token) {
        throw new Error('Token non disponibile');
      }
      return updateCategory(token, id, data);
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['categories', variables.id] }),
      ]);
    },
  });
}