// src/components/shared/utils/ColorPickerModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';

export interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onChange: (newColor: string) => void;
  title?: string;
}

export const EXTENDED_COLOR_PALETTE = [
  // Blu & Azzurri
  '#3B82F6', '#2563EB', '#0284C7', '#06B6D4',
  // Viola & Indaco
  '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  // Rossi, Rosa & Arancioni
  '#EC4899', '#F43F5E', '#EF4444', '#F97316',
  // Gialli & Ambra
  '#FB923C', '#F59E0B', '#EAB308',
  // Verdi & Smeraldo
  '#10B981', '#22C55E', '#84CC16', '#14B8A6',
  // Neutri & Scuro
  '#64748B', '#6B7280', '#1E293B',
];

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  color,
  onChange,
  title = 'Scegli Colore Categoria',
}) => {
  const [selectedColor, setSelectedColor] = useState(color || '#3B82F6');

  useEffect(() => {
    if (isOpen) {
      setSelectedColor(color || '#3B82F6');
    }
  }, [isOpen, color]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onChange(selectedColor);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 w-80 max-w-[92vw] animate-fadeIn flex flex-col gap-4 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. HEADER */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* 2. ANTEPRIMA COLORE ATTIVO */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200/80">
          <div
            className="w-12 h-12 rounded-2xl border-2 border-white shadow-md shrink-0 flex items-center justify-center transition-all duration-300"
            style={{ backgroundColor: selectedColor }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-xs" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Colore Selezionato
            </span>
            <span className="text-sm font-mono font-black text-gray-800 tracking-wider">
              {selectedColor.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 3. TAVOLOZZA COLORI RAPIDI */}
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Tavolozza Rapida
          </span>
          <div className="grid grid-cols-6 gap-2">
            {EXTENDED_COLOR_PALETTE.map((preset) => {
              const isSelected = selectedColor.toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSelectedColor(preset)}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs relative ${
                    isSelected
                      ? 'scale-110 border-gray-900 ring-2 ring-blue-500 shadow-md'
                      : 'border-black/10 hover:scale-105 active:scale-95'
                  }`}
                  style={{ backgroundColor: preset }}
                  title={preset}
                >
                  {isSelected && (
                    <CheckCircleIcon className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. COLORE PERSONALIZZATO (Nativo + Hex) */}
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Personalizzato
          </span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-10 p-0.5 border border-gray-200 rounded-xl cursor-pointer shrink-0 shadow-2xs"
              />
            </div>
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              placeholder="#3B82F6"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs uppercase outline-none focus:border-blue-500 font-mono bg-white"
            />
          </div>
        </div>

        {/* 5. FOOTER AZIONI */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer border border-gray-200"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            Applica
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ColorPickerModal;
