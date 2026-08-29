// src/components/shared/utils/ImagePositionPicker.tsx
import React, { useRef, useState, useMemo } from 'react';
import { UndoIcon } from '@/components/shared/utils/Icons';

interface ImagePositionPickerProps {
  imageUrl: string;
  value?: string | null;
  onChange: (position: string) => void;
  titlePreview?: string;
}

/**
 * Parser per estrarre coordinate percentuali (0-100) da stringhe CSS
 * Supporta: '50% 30%', 'center top', 'left bottom', 'center', ecc.
 */
const parsePosition = (posStr?: string | null): { x: number; y: number } => {
  if (!posStr || !posStr.trim() || posStr === 'center' || posStr === 'center center') {
    return { x: 50, y: 50 };
  }

  const trimmed = posStr.trim().toLowerCase();

  const percentMatch = trimmed.match(/^(\d+(?:\.\d+)?)(?:%|\s)\s*(\d+(?:\.\d+)?)(?:%|)$/);
  if (percentMatch) {
    const x = Math.min(100, Math.max(0, Math.round(parseFloat(percentMatch[1]))));
    const y = Math.min(100, Math.max(0, Math.round(parseFloat(percentMatch[2]))));
    return { x, y };
  }

  let x = 50;
  let y = 50;

  if (trimmed.includes('left')) x = 0;
  if (trimmed.includes('right')) x = 100;
  if (trimmed.includes('top')) y = 0;
  if (trimmed.includes('bottom')) y = 100;

  return { x, y };
};

export const ImagePositionPicker: React.FC<ImagePositionPickerProps> = ({
  imageUrl,
  value,
  onChange,
  titlePreview = 'Anteprima Card',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; posX: number; posY: number } | null>(null);

  const { x, y } = useMemo(() => parsePosition(value), [value]);
  const isCentered = x === 50 && y === 50;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      posX: x,
      posY: y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = e.clientX - dragStartRef.current.clientX;
    const deltaY = e.clientY - dragStartRef.current.clientY;

    const percentDeltaX = (deltaX / rect.width) * 100;
    const percentDeltaY = (deltaY / rect.height) * 100;

    const newX = Math.min(100, Math.max(0, Math.round(dragStartRef.current.posX - percentDeltaX)));
    const newY = Math.min(100, Math.max(0, Math.round(dragStartRef.current.posY - percentDeltaY)));

    onChange(`${newX}% ${newY}%`);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Nessun problema se già rilasciato
      }
    }
  };

  if (!imageUrl) return null;

  const currentPosCss = `${x}% ${y}%`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Inquadratura Card
        </span>
        
        {/* Pulsante Ripristina Centro */}
        <button
          type="button"
          onClick={() => onChange('50% 50%')}
          disabled={isCentered}
          title="Ripristina inquadratura al centro"
          className={`px-2.5 py-1 rounded-lg border transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
            isCentered
              ? 'opacity-30 cursor-not-allowed border-transparent text-gray-400'
              : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-700 hover:text-blue-600 shadow-2xs active:scale-95'
          }`}
        >
          <UndoIcon className="w-3.5 h-3.5" />
          <span>Ripristina</span>
        </button>
      </div>

      {/* BOX TRASCINAMENTO DIRETTO DELLO SFONDO */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative h-48 w-full rounded-2xl overflow-hidden select-none bg-slate-900 border-2 border-slate-300 hover:border-blue-400 transition-colors shadow-inner group touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Trascina l'immagine per spostare lo sfondo"
      >
        {/* Layer Immagine con Spostamento Diretto */}
        <div
          className="absolute inset-0 bg-cover transition-none pointer-events-none"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: currentPosCss,
          }}
        />

        {/* Gradiente Overlay Card */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20 pointer-events-none" />

        {/* Simulazione Testo Card */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end pointer-events-none">
          <span className="text-white font-extrabold text-sm uppercase tracking-wider truncate drop-shadow-md">
            {titlePreview || 'Titolo Card'}
          </span>
        </div>

        {/* Istruzione sovraimpressa trasparente */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="text-[10px] font-bold text-white/90 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            Trascina per spostare
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImagePositionPicker;
