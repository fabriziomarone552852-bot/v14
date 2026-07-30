import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CategoryForm, { type CategoryFormValues } from '@/components/CategoryForm';
import { useCategory, useUpdateCategory } from '@/hooks/useCategories';
import type { CategoryUpdatePayload } from '@/types';

const CategoryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const navigate = useNavigate();

  const {
    data: category,
    isPending,
    isError,
    error,
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
      console.error('Exception in handleUpdate', err);
    }
  };

  if (!categoryId) {
    return <p>ID categoria non valido.</p>;
  }

  if (isPending) {
    return <p>Caricamento categoria...</p>;
  }

  if (isError || !category) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Modifica categoria</h1>
        <p>
          Errore nel caricamento della categoria:{' '}
          {error instanceof Error ? error.message : 'errore sconosciuto'}
        </p>
        <button
          type="button"
          style={{ marginTop: 16 }}
          onClick={() => navigate(-1)}
        >
          Torna indietro
        </button>
      </div>
    );
  }

  const initialValues: CategoryFormValues = {
    name: category.category_name,
    color: category.colore || '#cccccc',
    genre: category.genre,
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Modifica categoria</h1>

      <CategoryForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleUpdate}
        isSubmitting={updateCategoryMutation.isPending}
      />

      <button
        type="button"
        style={{ marginTop: 16 }}
        onClick={() => navigate(-1)}
        disabled={updateCategoryMutation.isPending}
      >
        Annulla
      </button>
    </div>
  );
};

export default CategoryEditPage;