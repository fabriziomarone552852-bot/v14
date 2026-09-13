// src/components/archive/categories/CategoryModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { CategoryGenre, type Category } from '@/types/categories';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import MobileCategoryModal from '@/mobile/components/modals/MobileCategoryModal';
import { useCategoryModalLogic } from './useCategoryModalLogic';
import { CategoryGenreSelector } from './CategoryGenreSelector';
import { CategoryColorSection } from './CategoryColorSection';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  defaultGenre?: number;
  onSuccess?: (category: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  defaultGenre = CategoryGenre.TASKS,
  onSuccess,
}) => {
  const isMobile = useIsMobile();
  const {
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
  } = useCategoryModalLogic({
    isOpen,
    onClose,
    categoryToEdit,
    defaultGenre,
    onSuccess,
  });

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <MobileCategoryModal
        isOpen={isOpen}
        onClose={onClose}
        categoryToEdit={categoryToEdit}
        defaultGenre={defaultGenre}
        onSuccess={onSuccess}
      />
    );
  }

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
        <CategoryGenreSelector genre={genre} onGenreChange={setGenre} />

        {/* 3. COLORE */}
        <CategoryColorSection
          color={color}
          onColorChange={setColor}
          colorInputRef={colorInputRef}
          onOpenNativePicker={openNativeColorPicker}
        />

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
