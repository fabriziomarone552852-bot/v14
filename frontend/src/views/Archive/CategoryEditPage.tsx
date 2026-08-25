import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CategoryForm, { type CategoryFormValues } from '@/components/CategoryForm';
import { useCategory, useUpdateCategory } from '@/hooks/useCategories';
import { type CategoryUpdatePayload, CategoryGenre } from '@/types';
import { logger } from '@/utils/logger';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

const CategoryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const navigate = useNavigate();

  const {
    data: category,
    isPending,
    isError,
  } = useCategory(categoryId);

  const updateCategoryMutation = useUpdateCategory();

  const handleUpdate = async (values: CategoryFormValues) => {
    const payload: CategoryUpdatePayload = {
      category_name: values.name.trim(),
      colore: values.color || null,
      genre: values.genre,
    };

    try {
      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        data: payload,
      });

      navigate('/categories');
    } catch (err) {
      logger.error('Exception in handleUpdate', err);
    }
  };

  if (!categoryId) {
    return <p>ID categoria non valido.</p>;
  }

  if (isPending) {
    return <PageLoadingState messages={LOADING_MESSAGES.archiveCategories} />;
  }

  if (isError || !category) {
    return <PageErrorState message={ERROR_MESSAGES.archive} onRetry={() => navigate(-1)} />;
  }

  const initialValues: CategoryFormValues = {
    name: category.category_name,
    color: category.colore || '#cccccc',
    genre: (category.genre as CategoryGenre) || CategoryGenre.TASKS,
  };

  return (
    <div className="p-6">
      <h1>Modifica categoria</h1>

      <CategoryForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleUpdate}
        isSubmitting={updateCategoryMutation.isPending}
      />

      <button
        type="button"
        className="mt-4 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
        onClick={() => navigate(-1)}
        disabled={updateCategoryMutation.isPending}
      >
        Annulla
      </button>
    </div>
  );
};

export default CategoryEditPage;