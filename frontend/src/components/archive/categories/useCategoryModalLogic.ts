// src/components/archive/categories/useCategoryModalLogic.ts
import { useState, useEffect, useRef } from 'react';
import { CategoryGenre, type Category } from '@/types/categories';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { logger } from '@/utils/logger';

export const COLOR_PRESETS = [
  '#3B82F6', // Blu
  '#6366F1', // Indaco
  '#8B5CF6', // Viola
  '#EC4899', // Rosa
  '#EF4444', // Rosso
  '#F97316', // Arancione
  '#F59E0B', // Giallo ambra
  '#10B981', // Smeraldo
  '#14B8A6', // Teal
  '#64748B', // Ardesia
];

interface UseCategoryModalLogicProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  defaultGenre?: number;
  onSuccess?: (category: Category) => void;
}

export const useCategoryModalLogic = ({
  isOpen,
  onClose,
  categoryToEdit,
  defaultGenre = CategoryGenre.TASKS,
  onSuccess,
}: UseCategoryModalLogicProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [genre, setGenre] = useState<number>(defaultGenre);
  const [errorMsg, setErrorMsg] = useState('');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const isEditing = Boolean(categoryToEdit);
  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.category_name);
      setColor(categoryToEdit.colore || '#3B82F6');
      setGenre(categoryToEdit.genre || defaultGenre);
    } else {
      setName('');
      setColor('#3B82F6');
      setGenre(defaultGenre);
    }
    setErrorMsg('');
  }, [categoryToEdit, defaultGenre, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomePulito = name.trim();
    if (!nomePulito) {
      setErrorMsg('Inserisci il nome della categoria.');
      return;
    }

    setErrorMsg('');
    try {
      let saved: Category;
      if (isEditing && categoryToEdit) {
        saved = await updateCategoryMutation.mutateAsync({
          id: categoryToEdit.id,
          data: {
            category_name: nomePulito,
            colore: color || null,
            genre,
          },
        });
      } else {
        saved = await createCategoryMutation.mutateAsync({
          category_name: nomePulito,
          colore: color || null,
          genre,
        });
      }

      if (onSuccess && saved) onSuccess(saved);
      onClose();
    } catch (err: unknown) {
      logger.error('Errore salvataggio categoria:', err);
      let message = 'Impossibile salvare la categoria.';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.detail) message = parsed.detail;
        } catch {
          if (err.message) message = err.message;
        }
      }
      setErrorMsg(message);
    }
  };

  const openNativeColorPicker = () => {
    const input = colorInputRef.current;
    if (input) {
      if ('showPicker' in input && typeof input.showPicker === 'function') {
        try {
          input.showPicker();
        } catch {
          input.click();
        }
      } else {
        input.click();
      }
    }
  };

  return {
    name,
    setName,
    color,
    setColor,
    genre,
    setGenre,
    errorMsg,
    colorInputRef,
    isEditing,
    isSubmitting,
    handleSubmit,
    openNativeColorPicker,
  };
};
