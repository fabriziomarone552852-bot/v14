import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CategoryGenre, type Category } from '@/types';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { PlusIcon, DropdownIcon, CloseIcon, CheckCircleIcon } from './Icons';
import { useCategories } from '@/hooks/useCategories';
import { formatName } from '@/utils/uiUtils';
import { CategoryModal } from '@/components/archive/categories/CategoryModal';

interface CategorySelectProps {
  value: string;
  onChange: (categoryName: string) => void;
  genreType: CategoryGenre;
  overlay?: boolean; // Apre il menu come modale centrato in overlay sullo schermo
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  genreType,
  overlay = false,
}) => {
  const { data: dbCategories = [] } = useCategories();
  const safeCategories = useMemo<Category[]>(() => dbCategories ?? [], [dbCategories]);

  const categories = useMemo(
    () =>
      safeCategories.filter(
        (c: Category) =>
          c.genre === genreType || c.genre === CategoryGenre.COMMON
      ),
    [safeCategories, genreType]
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const activeColor =
    categories.find((c: Category) => c.category_name === value)?.colore || '#9CA3AF';

  const wrapperRef = useOutsideClick<HTMLDivElement>(() => {
    if (overlay) return;
    if (isDropdownOpen) setIsDropdownOpen(false);
  });

  useEffect(() => {
    if (isDropdownOpen && !overlay && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 220);
    }
  }, [isDropdownOpen, overlay, wrapperRef]);

  const standardDropdown = (
    <div
      className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-48 overflow-y-auto ${
        openUpwards ? 'bottom-full mb-2' : 'top-full mt-1'
      }`}
    >
      {categories.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-400">
          Nessuna categoria disponibile
        </div>
      ) : (
        categories.map((cat: Category) => (
          <div
            key={cat.id}
            onClick={() => {
              onChange(cat.category_name);
              setIsDropdownOpen(false);
            }}
            className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors"
          >
            <span
              className="w-3 h-3 rounded-full border border-gray-200 shrink-0"
              style={{ backgroundColor: cat.colore || '#9CA3AF' }}
            />
            <span className="text-gray-700 truncate">
              {formatName(cat.category_name)}
            </span>
          </div>
        ))
      )}
    </div>
  );

  const overlayDropdown = (
    <div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsDropdownOpen(false);
      }}
      aria-hidden="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 max-w-[90vw] animate-fadeIn max-h-[75vh] flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
          <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Seleziona Categoria
          </h4>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsNewModalOpen(true);
              }}
              className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Crea nuova categoria"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2 space-y-1">
          {categories.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-gray-400">
              Nessuna categoria disponibile
            </div>
          ) : (
            categories.map((cat: Category) => {
              const isSelected = cat.category_name === value;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onChange(cat.category_name);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-sm cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-bold'
                      : 'hover:bg-gray-50 text-gray-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
                      style={{ backgroundColor: cat.colore || '#9CA3AF' }}
                    />
                    <span className="truncate">{formatName(cat.category_name)}</span>
                  </div>
                  {isSelected && <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-bold text-gray-500 uppercase">
          Categoria
        </label>
        <button
          type="button"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsNewModalOpen(true);
          }}
          className="hover:bg-blue-100 text-gray-500 hover:text-blue-500 rounded p-0.5 transition-colors cursor-pointer"
          title="Crea nuova categoria"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      <div
        onClick={() => {
          if (categories.length > 0) {
            setIsDropdownOpen(!isDropdownOpen);
          }
        }}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-xs"
      >
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: activeColor }}
          />
          <span className="text-gray-700 truncate">
            {formatName(value || 'Seleziona...')}
          </span>
        </div>
        <DropdownIcon isDropdownOpen={isDropdownOpen} />
      </div>

      {isDropdownOpen && (overlay ? createPortal(overlayDropdown, document.body) : standardDropdown)}

      {/* MODALE CREAZIONE CATEGORIA CONDIVISO */}
      <CategoryModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultGenre={genreType}
        onSuccess={(cat) => {
          onChange(cat.category_name);
        }}
      />
    </div>
  );
};

export default CategorySelect;