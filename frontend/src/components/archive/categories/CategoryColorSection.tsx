// src/components/archive/categories/CategoryColorSection.tsx
import React from 'react';
import { COLOR_PRESETS } from './useCategoryModalLogic';

interface CategoryColorSectionProps {
  color: string;
  onColorChange: (color: string) => void;
  colorInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenNativePicker: () => void;
}

export const CategoryColorSection: React.FC<CategoryColorSectionProps> = ({
  color,
  onColorChange,
  colorInputRef,
  onOpenNativePicker,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        Colore Categoria
      </label>
      <div className="flex items-center gap-2 mb-2">
        <div
          onClick={onOpenNativePicker}
          className="relative cursor-pointer shrink-0"
          title="Apri selettore colore RGB"
        >
          <input
            ref={colorInputRef}
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-10 h-10 p-0.5 border border-gray-200 rounded-xl cursor-pointer shadow-2xs"
          />
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs uppercase outline-none focus:border-blue-500 font-mono"
        />
      </div>

      {/* Tavolozza Colori Predefiniti */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onColorChange(preset)}
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
  );
};
