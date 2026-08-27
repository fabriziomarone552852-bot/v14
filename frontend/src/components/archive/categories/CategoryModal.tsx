// src/components/categories/CategoryModal.tsx
import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { CategoryGenre, type Category } from '@/types/categories';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { logger } from '@/utils/logger';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  defaultGenre?: number;
  onSuccess?: (category: Category) => void;
}

const COLOR_PRESETS = [
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

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  defaultGenre = CategoryGenre.TASKS,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [genre, setGenre] = useState<number>(defaultGenre);
  const [errorMsg, setErrorMsg] = useState('');

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const isEditing = Boolean(categoryToEdit);
  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  useEffect(() => {
    if (categoryToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Form state reset when modal opens or edit target changes
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

  if (!isOpen) return null;

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

  const modalFooter = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="py-2.5 px-4 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        Annulla
      </button>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || !name.trim()}
        className="py-2.5 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-sm cursor-pointer"
      >
        {isSubmitting
          ? 'Salvataggio...'
          : isEditing
          ? 'Salva Modifiche'
          : 'Crea Categoria'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifica Categoria' : 'Nuova Categoria'}
      maxWidthClass="max-w-md"
      footer={modalFooter}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. NOME CATEGORIA */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nome Categoria
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Lavoro, Spesa, Salute..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            autoFocus
            required
          />
        </div>

        {/* 2. TIPOLOGIA / GENERE */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Tipologia / Destinazione d'Uso
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: CategoryGenre.TASKS, label: 'Tasks' },
              { id: CategoryGenre.EVENTS, label: 'Eventi' },
              { id: CategoryGenre.COMMON, label: 'Comune (Tasks & Eventi)' },
              { id: CategoryGenre.MOOD, label: 'Stati d\'animo' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGenre(item.id)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
                  genre === item.id
                    ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-2xs font-extrabold'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. COLORE */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Colore Categoria
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 p-0.5 border border-gray-200 rounded-xl cursor-pointer shrink-0 shadow-2xs"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs uppercase outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Tavolozza Colori Predefiniti */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                  color.toLowerCase() === preset.toLowerCase()
                    ? 'scale-125 border-gray-900 shadow-md ring-2 ring-blue-400'
                    : 'border-black/10 hover:scale-110'
                }`}
                style={{ backgroundColor: preset }}
                title={preset}
              />
            ))}
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
            {errorMsg}
          </p>
        )}
      </form>
    </BaseModal>
  );
};

export default CategoryModal;
