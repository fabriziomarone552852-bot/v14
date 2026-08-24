import React, { useEffect, useMemo, useState } from 'react';
import { CategoryGenre, type Category } from '@/types';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { PlusIcon, DropdownIcon } from './Icons';
import { useCategories } from '@/hooks/useCategories';
import { formatName } from '@/utils/uiUtils';
import { CategoryModal } from '@/components/archive/categories/CategoryModal';

interface CategorySelectProps {
  value: string;
  onChange: (categoryName: string) => void;
  genreType: CategoryGenre;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  genreType,
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
    if (isDropdownOpen) setIsDropdownOpen(false);
  });

  useEffect(() => {
    if (isDropdownOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 220);
    }
  }, [isDropdownOpen, wrapperRef]);

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
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors"
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

      {isDropdownOpen && (
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
      )}

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