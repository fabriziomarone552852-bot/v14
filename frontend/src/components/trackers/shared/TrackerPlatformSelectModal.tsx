// src/components/trackers/shared/TrackerPlatformSelectModal.tsx
import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';

export interface TrackerPlatformSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
  onSelectPlatform: (platform: string) => void;
  allPlatforms: string[];
  title?: string;
  zIndex?: number;
}

/**
 * Modale universale per la scelta della piattaforma di visione.
 * Condiviso tra recensioni Serie TV (Episodi), Film e futuri media.
 * Salva automaticamente le nuove piattaforme nel database via createPlatform.
 */
export const TrackerPlatformSelectModal: React.FC<TrackerPlatformSelectModalProps> = ({
  isOpen,
  onClose,
  platform,
  onSelectPlatform,
  allPlatforms,
  title = 'Piattaforma di Visione',
  zIndex = 10060,
}) => {
  const [customPlatformInput, setCustomPlatformInput] = useState('');
  const { createPlatform } = useTrackersMutations();

  const sortedPlatforms = useMemo(() => {
    return [...allPlatforms].sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
  }, [allPlatforms]);

  const handleClose = () => {
    setCustomPlatformInput('');
    onClose();
  };

  const handleConfirmCustom = () => {
    const trimmed = customPlatformInput.trim();
    if (!trimmed) return;
    createPlatform(trimmed);
    onSelectPlatform(trimmed);
    setCustomPlatformInput('');
    onClose();
  };

  return (
    <SelectModalDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidthClass="max-w-xs"
      zIndex={zIndex}
    >
      <div className="space-y-2 py-1">
        {/* Inserimento Nuova Piattaforma (In alto come prima opzione) */}
        <div className="pb-2 border-b border-gray-100 flex gap-2">
          <input
            type="text"
            placeholder="Altra piattaforma..."
            value={customPlatformInput}
            onChange={(e) => setCustomPlatformInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmCustom();
              }
            }}
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-blue-500"
          />
          <button
            type="button"
            disabled={!customPlatformInput.trim()}
            onClick={handleConfirmCustom}
            className="px-3 py-2 bg-blue-600 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            OK
          </button>
        </div>

        {/* Opzione Nessuna Piattaforma (Sotto altra piattaforma, selezionata di default se non impostata) */}
        <button
          type="button"
          onClick={() => {
            onSelectPlatform('');
            handleClose();
          }}
          className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
            !platform
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          <span>Nessuna piattaforma specificata</span>
          {!platform && <Check className="w-4 h-4 text-white shrink-0 stroke-[3]" />}
        </button>

        {/* Elenco Piattaforme Esistenti in Ordine Alfabetico */}
        {sortedPlatforms.map((p) => {
          const isSelected = platform.toLowerCase() === p.toLowerCase();
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                onSelectPlatform(p);
                handleClose();
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
              }`}
            >
              <span>{p}</span>
              {isSelected && <Check className="w-4 h-4 text-white shrink-0 stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </SelectModalDialog>
  );
};
