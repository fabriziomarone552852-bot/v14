import React from 'react';
import { TrashIcon, CloseIcon } from '@/components/shared/utils/Icons';
import type { ExpandedCardState } from '@/mobile/hooks/useMobileBingoLogic';
import { getStampSrc } from '@/config/bingoStamps';

interface MobileBingoExpandedCardProps {
  expandedState: ExpandedCardState;
  setExpandedState: React.Dispatch<React.SetStateAction<ExpandedCardState | null>>;
  isExpandedDone: boolean;
  expandedRotation: number;
  expandedStamp?: string | null;
  onDelete: () => void;
  onCollapse: () => void;
}

export const MobileBingoExpandedCard: React.FC<MobileBingoExpandedCardProps> = ({
  expandedState,
  setExpandedState,
  isExpandedDone,
  expandedRotation,
  expandedStamp,
  onDelete,
  onCollapse,
}) => {
  return (
    <div
      className={`absolute inset-0 z-30 rounded-3xl border-2 border-blue-400 shadow-2xl p-4 flex flex-col justify-between animate-fadeIn select-none ${
        isExpandedDone ? 'bg-gray-50/98' : 'bg-white/98'
      } backdrop-blur-xs`}
    >
      {/* Header Card Espansa: SOLO Cestino (se esistente) e Tasto X in Alto a Destra */}
      <div className="flex items-center justify-end gap-1.5 shrink-0">
        {/* Tasto Cestino per Eliminare */}
        {!expandedState.isNew && expandedState.id && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all cursor-pointer"
            title="Elimina card"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}

        {/* Tasto X per Salvare e Rimpicciolire */}
        <button
          type="button"
          onClick={onCollapse}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
          title="Salva e chiudi"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Area Centrale Textarea con Testo Ingrandito in Maniera Proporzionale */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center py-4 px-2">
        {/* Timbro a Stella Ingrandito in Background se completato */}
        {isExpandedDone && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
            style={{ transform: `rotate(${expandedRotation}deg)` }}
          >
            <img
              src={getStampSrc(expandedStamp)}
              alt="✓"
              className="w-3/5 h-3/5 object-contain opacity-70"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(200,0,0,0.2))' }}
            />
          </div>
        )}

        <textarea
          autoFocus
          value={expandedState.text}
          onChange={(e) =>
            setExpandedState((prev) =>
              prev ? { ...prev, text: e.target.value } : null
            )
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onCollapse();
            }
            if (e.key === 'Escape') {
              setExpandedState(null);
            }
          }}
          rows={4}
          className="w-full text-center text-2xl sm:text-3xl font-black text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none resize-none placeholder-gray-400 leading-snug relative z-10 p-2"
          placeholder="Scrivi qui il tuo obiettivo..."
        />
      </div>
    </div>
  );
};

export default MobileBingoExpandedCard;
