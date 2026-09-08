// src/mobile/components/modals/MobileCategoryModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import { CategoryGenre, type Category } from '@/types/categories';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import {
  CategoryIcon,
  CalendarIcon,
  TaskListIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';
import { logger } from '@/utils/logger';

export interface MobileCategoryModalProps {
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

export const MobileCategoryModal: React.FC<MobileCategoryModalProps> = ({
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

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
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
      logger.error('Errore salvataggio categoria mobile:', err);
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

  const genreOptions = [
    { id: CategoryGenre.TASKS, label: 'Tasks', desc: 'Per le attività', icon: TaskListIcon },
    { id: CategoryGenre.EVENTS, label: 'Eventi', desc: 'Per il calendario', icon: CalendarIcon },
    { id: CategoryGenre.COMMON, label: 'Comune', desc: 'Tasks & Eventi', icon: CategoryIcon },
    { id: CategoryGenre.MOOD, label: 'Mood', desc: 'Stati d\'animo', icon: CheckCircleIcon },
  ];

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifica Categoria' : 'Nuova Categoria'}
      confirmText={isSubmitting ? 'Salvataggio...' : isEditing ? 'Salva Modifiche' : 'Crea Categoria'}
      cancelText="Annulla"
      onConfirm={handleSubmit}
      onCancel={onClose}
      isConfirmDisabled={isSubmitting || !name.trim()}
      isLoading={isSubmitting}
    >
      <div className="space-y-4 pb-4">
        {/* 1. ANTEPRIMA LIVE BADGE CATEGORIA */}
        <div className="bg-gray-50/90 border border-gray-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-4 h-4 rounded-full border border-gray-300/80 shrink-0 shadow-xs"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-bold text-gray-800 truncate">
              {name.trim() || 'Nome Categoria'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shrink-0">
            {genreOptions.find((g) => g.id === genre)?.label || 'Categoria'}
          </span>
        </div>

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
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
            Destinazione d'Uso
          </label>
          <div className="grid grid-cols-2 gap-2">
            {genreOptions.map((item) => {
              const IconComponent = item.icon;
              const isSelected = genre === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGenre(item.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-2xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.99]'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate leading-tight">{item.label}</div>
                    <div className="text-[10px] text-gray-400 truncate leading-tight">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. COLORE CATEGORIA */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
            Colore Identificativo
          </label>

          {/* Palette Preset Rapidi Touch */}
          <div className="grid grid-cols-5 gap-2.5 py-1">
            {COLOR_PRESETS.map((preset) => {
              const isSelected = color.toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={`h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                    isSelected
                      ? 'scale-105 border-gray-900 ring-2 ring-blue-500 shadow-sm'
                      : 'border-black/10 hover:scale-102 active:scale-95'
                  }`}
                  style={{ backgroundColor: preset }}
                  title={preset}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                </button>
              );
            })}
          </div>

          {/* Selettore Personalizzato Hex & Color Picker RGB */}
          <div className="flex items-center gap-2 mt-2">
            <div
              onClick={openNativeColorPicker}
              className="relative cursor-pointer shrink-0"
              title="Apri selettore colore RGB / spettro cromatico"
            >
              <input
                ref={colorInputRef}
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 p-0.5 border border-gray-200 rounded-xl cursor-pointer shadow-2xs"
              />
            </div>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs uppercase outline-none focus:border-blue-500 font-mono bg-white"
            />
          </div>
        </div>

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
