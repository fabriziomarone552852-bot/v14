// src/components/trackers/shared/GenreIncludeAllButton.tsx
import React from 'react';
import type { GenreFilterRule } from '@/utils/trackerFilterUtils';

export interface GenreIncludeAllButtonProps {
  rule: GenreFilterRule;
  onChange: (nextRule: GenreFilterRule) => void;
}

/**
 * Pulsante compatto "Includi tutti" posizionato sulla riga di "Genere":
 * - < 2 generi inclusi (+): grigio chiaro disabilitato (logica automatica 'O')
 * - >= 2 generi inclusi e modalità 'OR': grigio più scuro cliccabile (significa 'O')
 * - >= 2 generi inclusi e modalità 'AND': blu attivo cliccabile (significa 'E')
 */
export const GenreIncludeAllButton: React.FC<GenreIncludeAllButtonProps> = ({
  rule,
  onChange,
}) => {
  const canToggle = rule.include.length >= 2;
  const isAllRequired = canToggle && rule.mode === 'AND';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!canToggle) return;
    onChange({
      ...rule,
      mode: isAllRequired ? 'OR' : 'AND',
    });
  };

  return (
    <button
      type="button"
      disabled={!canToggle}
      onClick={handleClick}
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all leading-tight shrink-0 select-none ${
        !canToggle
          ? 'bg-gray-50 text-gray-300 border-gray-200/70 cursor-not-allowed'
          : isAllRequired
          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs hover:bg-blue-700 active:scale-95 cursor-pointer'
          : 'bg-gray-200/80 text-gray-700 border-gray-300 hover:bg-gray-300/80 active:scale-95 cursor-pointer'
      }`}
      title={
        !canToggle
          ? 'Seleziona almeno 2 generi (+) per richiedere che siano tutti presenti'
          : isAllRequired
          ? 'Attivo (E): deve avere tutti i generi selezionati'
          : 'Disattivo (O): basta almeno uno dei generi selezionati'
      }
    >
      Includi tutti
    </button>
  );
};

export default GenreIncludeAllButton;
