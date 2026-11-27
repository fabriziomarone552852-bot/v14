import React from 'react';
import type { MediaCreditPerson } from '@/types/people';

export interface ClickableCreditsLineProps {
  people?: MediaCreditPerson[];
  fallbackText?: string | null;
  onPersonClick?: (person: MediaCreditPerson) => void;
  prefixIcon?: string;
  label?: string;
  className?: string;
}

/**
 * Mostra i nominativi principali (registi o creatori) come link cliccabili
 * per aprire la scheda filmografica completa, con fallback testuale semplice.
 */
export const ClickableCreditsLine: React.FC<ClickableCreditsLineProps> = ({
  people,
  fallbackText,
  onPersonClick,
  prefixIcon = '🎬',
  label,
  className = '',
}) => {
  const hasClickablePeople = Boolean(people && people.length > 0 && onPersonClick);

  if (!hasClickablePeople && !fallbackText) {
    return null;
  }

  return (
    <span className={`inline-flex items-center flex-wrap gap-x-1 ${className}`}>
      {prefixIcon && <span>{prefixIcon}</span>}
      {label && <span className="text-gray-500 font-medium">{label}</span>}
      {hasClickablePeople ? (
        people!.map((person, idx) => (
          <React.Fragment key={person.id}>
            {idx > 0 && <span className="text-gray-400">,</span>}
            <button
              type="button"
              onClick={() => onPersonClick?.(person)}
              className="font-bold text-gray-800 hover:text-blue-600 hover:underline active:text-blue-700 cursor-pointer transition-colors"
              title={`Vedi filmografia di ${person.name}`}
            >
              {person.name}
            </button>
          </React.Fragment>
        ))
      ) : (
        <strong className="text-gray-800 font-semibold">{fallbackText}</strong>
      )}
    </span>
  );
};
