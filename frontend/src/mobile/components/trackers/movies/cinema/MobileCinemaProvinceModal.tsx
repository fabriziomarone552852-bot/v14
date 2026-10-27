// src/mobile/components/trackers/movies/cinema/MobileCinemaProvinceModal.tsx
import React, { useState, useMemo } from 'react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { CheckCircleIcon, SearchIcon } from '@/components/shared/utils/Icons';
import type { CinemaProvince } from '@/types/cinema';

export interface MobileCinemaProvinceModalProps {
  isOpen: boolean;
  onClose: () => void;
  provinces: CinemaProvince[];
  selectedSlug: string;
  onSelectProvince: (slug: string) => void;
}

export const MobileCinemaProvinceModal: React.FC<MobileCinemaProvinceModalProps> = ({
  isOpen,
  onClose,
  provinces,
  selectedSlug,
  onSelectProvince,
}) => {
  const [search, setSearch] = useState('');

  const filteredProvinces = useMemo(() => {
    if (!search.trim()) return provinces;
    const q = search.toLowerCase();
    return provinces.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.region && p.region.toLowerCase().includes(q))
    );
  }, [provinces, search]);

  const handleSelect = (slug: string) => {
    onSelectProvince(slug);
    onClose();
  };

  return (
    <SelectModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Scegli Provincia Cinema"
      maxWidthClass="max-w-sm"
      zIndex={10040}
    >
      <div className="space-y-3 py-1">
        {/* Barra di ricerca rapida provincia */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca provincia (es. Roma, Milano)..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
          />
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Elenco Province */}
        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto custom-scrollbar pr-0.5">
          {filteredProvinces.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">
              Nessuna provincia trovata.
            </div>
          ) : (
            filteredProvinces.map((p) => {
              const isSelected = p.slug === selectedSlug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => handleSelect(p.slug)}
                  className={`w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold">{p.name}</span>
                    {p.region && (
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {p.region}
                      </span>
                    )}
                  </div>
                  {isSelected && <CheckCircleIcon className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </SelectModalDialog>
  );
};
