import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '@/api/categoriesApi';
import { useAuth } from '@/context/AuthContext';
import { invalidateAllViews } from '@/utils/queryCacheUtils';
import type {
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '@/types/categories';

export const categoriesQueryKey = ['categories'] as const;

export function useCategories(enabled = true) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: getCategories,
    enabled: isAuthenticated && enabled,
  });
}

export function useCategory(categoryId?: number) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () => getCategory(categoryId!),
    enabled: isAuthenticated && Boolean(categoryId),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryCreatePayload) => createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      invalidateAllViews(queryClient);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdatePayload }) =>
      updateCategory(id, data),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['categories', variables.id] }),
      ]);
      invalidateAllViews(queryClient);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      invalidateAllViews(queryClient);
    },
  });
}