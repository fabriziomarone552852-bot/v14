// src/components/categories/CategoryDetailModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { Badge } from '@/components/shared/utils/Badges';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { CategoryGenre, type Category } from '@/types/categories';
import { formatName } from '@/utils/uiUtils';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const getGenreLabel = (genre: number) => {
  switch (genre) {
    case CategoryGenre.TASKS:
    case 1:
      return 'Tasks';
    case CategoryGenre.EVENTS:
    case 2:
      return 'Eventi';
    case CategoryGenre.COMMON:
    case 3:
      return 'Comune (Tasks & Eventi)';
    case CategoryGenre.MOOD:
    case 4:
      return 'Stato d\'animo';
    default:
      return `Tipo ${genre}`;
  }
};

const getGenreDescription = (genre: number) => {
  switch (genre) {
    case CategoryGenre.TASKS:
    case 1:
      return 'Utilizzata esclusivamente per organizzare le attività e relative sotto-task.';
    case CategoryGenre.EVENTS:
    case 2:
      return 'Utilizzata per eventi, appuntamenti e blocchi di tempo nel calendario.';
    case CategoryGenre.COMMON:
    case 3:
      return 'Categoria universale condivisa sia tra i task che tra gli eventi.';
    case CategoryGenre.MOOD:
    case 4:
      return 'Utilizzata per tracciare il bilancio emotivo e il mood giornaliero nel calendario a pixel.';
    default:
      return 'Categoria di sistema.';
  }
};

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
  onEditClick,
  onDeleteClick,
}) => {
  if (!isOpen || !category) return null;

  const catColor = category.colore || '#9CA3AF';
  const genreName = getGenreLabel(category.genre);

  const HeaderTags = (
    <div className="flex items-center gap-2">
      <Badge variant="category" colorHex={catColor}>
        {formatName(category.category_name)}
      </Badge>
      <span className="px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide inline-flex items-center justify-center bg-slate-100 text-slate-700 border border-slate-200">
        {genreName}
      </span>
    </div>
  );

  const HeaderActions = (
    <>
      <button
        title="Modifica"
        onClick={onEditClick}
        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
      >
        <EditIcon className="h-5 w-5" />
      </button>
      <button
        title="Elimina"
        onClick={onDeleteClick}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </>
  );

  const ModalFooter = (
    <button
      type="button"
      onClick={onClose}
      className="w-full py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs cursor-pointer"
    >
      Chiudi
    </button>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={HeaderTags}
      headerActions={HeaderActions}
      footer={ModalFooter}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        {/* TITOLO CATEGORIA */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {formatName(category.category_name)}
          </h2>
        </div>

        {/* COLORE ASSEGNATO */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Colore Assegnato
            </h4>
            <span className="font-mono text-sm font-bold text-gray-800 uppercase">
              {catColor}
            </span>
          </div>
          <span
            className="w-8 h-8 rounded-full border border-black/10 shadow-sm shrink-0"
            style={{ backgroundColor: catColor }}
          />
        </div>

        {/* DESTINAZIONE D'USO / TIPO */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Destinazione d'Uso
          </h4>
          <p className="text-sm font-semibold text-gray-800 mb-1">
            {genreName}
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            {getGenreDescription(category.genre)}
          </p>
        </div>
      </div>
    </BaseModal>
  );
};

export default CategoryDetailModal;
