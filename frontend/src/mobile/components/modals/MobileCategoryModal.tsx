// src/mobile/components/modals/MobileCategoryModal.tsx
import React from 'react';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import { CategoryGenre, type Category } from '@/types/categories';
import { useMobileCategoryFormLogic } from '@/mobile/hooks/useMobileCategoryFormLogic';
import { MobileCategoryLiveBadge } from './category/MobileCategoryLiveBadge';
import {
  MobileCategoryGenreSelector,
  GENRE_OPTIONS,
} from './category/MobileCategoryGenreSelector';
import { MobileCategoryColorSection } from './category/MobileCategoryColorSection';

export interface MobileCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  defaultGenre?: number;
  onSuccess?: (category: Category) => void;
}

export const MobileCategoryModal: React.FC<MobileCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  defaultGenre = CategoryGenre.TASKS,
  onSuccess,
}) => {
  const {
    name,
    setName,
    color,
    setColor,
    genre,
    setGenre,
    errorMsg,
    setErrorMsg,
    colorInputRef,
    isEditing,
    isSubmitting,
    handleSubmit,
    openNativeColorPicker,
  } = useMobileCategoryFormLogic({
    isOpen,
    onClose,
    categoryToEdit,
    defaultGenre,
    onSuccess,
  });

  if (!isOpen) return null;

  const currentGenreLabel =
    GENRE_OPTIONS.find((g) => g.id === genre)?.label || 'Categoria';

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifica Categoria' : 'Nuova Categoria'}
      confirmText={
        isSubmitting
          ? 'Salvataggio...'
          : isEditing
          ? 'Salva Modifiche'
          : 'Crea Categoria'
      }
      cancelText="Annulla"
      onConfirm={handleSubmit}
      onCancel={onClose}
      isConfirmDisabled={isSubmitting || !name.trim()}
      isLoading={isSubmitting}
    >
      <div className="space-y-4 pb-4">
        {/* 1. ANTEPRIMA LIVE BADGE CATEGORIA */}
        <MobileCategoryLiveBadge
          name={name}
          color={color}
          genreLabel={currentGenreLabel}
        />

        {/* 2. NOME DELLA CATEGORIA */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
            Nome Categoria
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="es. Lavoro, Salute, Finanze..."
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
            autoFocus
            required
          />
        </div>

        {/* 3. DESTINAZIONE D'USO / TIPOLOGIA */}
        <MobileCategoryGenreSelector
          selectedGenre={genre}
          onSelectGenre={setGenre}
        />

        {/* 4. COLORE CATEGORIA */}
        <MobileCategoryColorSection
          color={color}
          onChangeColor={setColor}
          colorInputRef={colorInputRef}
          onOpenNativeColorPicker={openNativeColorPicker}
        />

        {/* MESSAGGIO ERRORE */}
        {errorMsg && (
          <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
            {errorMsg}
          </p>
        )}
      </div>
    </MobileBaseModal>
  );
};

export default MobileCategoryModal;
