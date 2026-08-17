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

export const categoriesQueryKey = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: getCategories,
  });
}

export function useCategory(categoryId?: number) {
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () => getCategory(categoryId!),
    enabled: Boolean(categoryId),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryCreatePayload) => createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
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
    },
  });
}