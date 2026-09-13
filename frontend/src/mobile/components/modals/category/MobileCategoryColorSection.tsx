// src/mobile/components/modals/category/MobileCategoryColorSection.tsx
import React, { type RefObject } from 'react';

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

interface MobileCategoryColorSectionProps {
  color: string;
  onChangeColor: (color: string) => void;
  colorInputRef: RefObject<HTMLInputElement | null>;
  onOpenNativeColorPicker: () => void;
}

export const MobileCategoryColorSection: React.FC<MobileCategoryColorSectionProps> = ({
  color,
  onChangeColor,
  colorInputRef,
  onOpenNativeColorPicker,
}) => {
  return (
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
              onClick={() => onChangeColor(preset)}
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
          onClick={onOpenNativeColorPicker}
          className="relative cursor-pointer shrink-0"
          title="Apri selettore colore RGB / spettro cromatico"
        >
          <input
            ref={colorInputRef}
            type="color"
            value={color}
            onChange={(e) => onChangeColor(e.target.value)}
            className="w-10 h-10 p-0.5 border border-gray-200 rounded-xl cursor-pointer shadow-2xs"
          />
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => onChangeColor(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs uppercase outline-none focus:border-blue-500 font-mono bg-white"
        />
      </div>
    </div>
  );
};

export default MobileCategoryColorSection;
