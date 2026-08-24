// src/components/shared/shopping/ShoppingUnitSelect.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon } from '@/components/shared/utils/Icons';
import type { ConfigOption } from '@/types/shopping';

export interface UnitDefinition {
  singular: string;
  plural: string;
}

export const UNIT_DICTIONARY: Record<string, UnitDefinition> = {
  g: { singular: 'grammo', plural: 'grammi' },
  grammo: { singular: 'grammo', plural: 'grammi' },
  grammi: { singular: 'grammo', plural: 'grammi' },

  hg: { singular: 'etto', plural: 'etti' },
  etto: { singular: 'etto', plural: 'etti' },
  etti: { singular: 'etto', plural: 'etti' },

  kg: { singular: 'chilo', plural: 'chili' },
  chilo: { singular: 'chilo', plural: 'chili' },
  chili: { singular: 'chilo', plural: 'chili' },

  lt: { singular: 'litro', plural: 'litri' },
  l: { singular: 'litro', plural: 'litri' },
  litro: { singular: 'litro', plural: 'litri' },
  litri: { singular: 'litro', plural: 'litri' },

  cl: { singular: 'centilitro', plural: 'centilitri' },
  centilitro: { singular: 'centilitro', plural: 'centilitri' },
  centilitri: { singular: 'centilitro', plural: 'centilitri' },

  ml: { singular: 'millilitro', plural: 'millilitri' },
  millilitro: { singular: 'millilitro', plural: 'millilitri' },
  millilitri: { singular: 'millilitro', plural: 'millilitri' },

  m: { singular: 'metro', plural: 'metri' },
  metro: { singular: 'metro', plural: 'metri' },
  metri: { singular: 'metro', plural: 'metri' },

  cm: { singular: 'centimetro', plural: 'centimetri' },
  centimetro: { singular: 'centimetro', plural: 'centimetri' },
  centimetri: { singular: 'centimetro', plural: 'centimetri' },

  mm: { singular: 'millimetro', plural: 'millimetri' },
  millimetro: { singular: 'millimetro', plural: 'millimetri' },
  millimetri: { singular: 'millimetro', plural: 'millimetri' },

  conf: { singular: 'confezione', plural: 'confezioni' },
  confezione: { singular: 'confezione', plural: 'confezioni' },
  confezioni: { singular: 'confezione', plural: 'confezioni' },

  paq: { singular: 'pacco', plural: 'pacchi' },
  paqf: { singular: 'pacco', plural: 'pacchi' },
  pacco: { singular: 'pacco', plural: 'pacchi' },
  pacchi: { singular: 'pacco', plural: 'pacchi' },

  bt: { singular: 'bottiglia', plural: 'bottiglie' },
  bottiglia: { singular: 'bottiglia', plural: 'bottiglie' },
  bottiglie: { singular: 'bottiglia', plural: 'bottiglie' },

  bar: { singular: 'barattolo', plural: 'barattoli' },
  barattolo: { singular: 'barattolo', plural: 'barattoli' },
  barattoli: { singular: 'barattolo', plural: 'barattoli' },

  pz: { singular: 'pezzo', plural: 'pezzi' },
  pezzo: { singular: 'pezzo', plural: 'pezzi' },
  pezzi: { singular: 'pezzo', plural: 'pezzi' },
  piece: { singular: 'pezzo', plural: 'pezzi' },

  rot: { singular: 'rotolo', plural: 'rotoli' },
  rotolo: { singular: 'rotolo', plural: 'rotoli' },
  rotoli: { singular: 'rotolo', plural: 'rotoli' },

  scat: { singular: 'scatola', plural: 'scatole' },
  scatola: { singular: 'scatola', plural: 'scatole' },
  scatole: { singular: 'scatola', plural: 'scatole' },

  tub: { singular: 'tubetto', plural: 'tubetti' },
  tubetto: { singular: 'tubetto', plural: 'tubetti' },
  tubetti: { singular: 'tubetto', plural: 'tubetti' },

  bust: { singular: 'busta', plural: 'buste' },
  busta: { singular: 'busta', plural: 'buste' },
  buste: { singular: 'busta', plural: 'buste' },

  fl: { singular: 'flacone', plural: 'flaconi' },
  flacone: { singular: 'flacone', plural: 'flaconi' },
  flaconi: { singular: 'flacone', plural: 'flaconi' },

  vas: { singular: 'vasetto', plural: 'vasetti' },
  vasetto: { singular: 'vasetto', plural: 'vasetti' },
  vasetti: { singular: 'vasetto', plural: 'vasetti' },

  brik: { singular: 'brick', plural: 'brick' },
  brick: { singular: 'brick', plural: 'brick' },

  mazz: { singular: 'mazzo', plural: 'mazzi' },
  mazzo: { singular: 'mazzo', plural: 'mazzi' },
  mazzi: { singular: 'mazzo', plural: 'mazzi' },

  fett: { singular: 'fetta', plural: 'fette' },
  fetta: { singular: 'fetta', plural: 'fette' },
  fette: { singular: 'fetta', plural: 'fette' },

  latt: { singular: 'lattina', plural: 'lattine' },
  lattina: { singular: 'lattina', plural: 'lattine' },
  lattine: { singular: 'lattina', plural: 'lattine' },

  ret: { singular: 'retina', plural: 'retine' },
  retina: { singular: 'retina', plural: 'retine' },
  retine: { singular: 'retina', plural: 'retine' },

  ric: { singular: 'ricarica', plural: 'ricariche' },
  ricarica: { singular: 'ricarica', plural: 'ricariche' },
  ricariche: { singular: 'ricarica', plural: 'ricariche' },

  grapp: { singular: 'grappolo', plural: 'grappoli' },
  grappolo: { singular: 'grappolo', plural: 'grappoli' },
  grappoli: { singular: 'grappolo', plural: 'grappoli' },

  spic: { singular: 'spicchio', plural: 'spicchi' },
  spicchio: { singular: 'spicchio', plural: 'spicchi' },
  spicchi: { singular: 'spicchio', plural: 'spicchi' },

  kit: { singular: 'kit', plural: 'kit' },
};

export const ORDERED_UNIT_KEYS: string[] = [
  'grammo',
  'etto',
  'chilo',
  'litro',
  'centilitro',
  'millilitro',
  'metro',
  'centimetro',
  'millimetro',
  'confezione',
  'pacco',
  'bottiglia',
  'barattolo',
  'pezzo',
  'rotolo',
  'scatola',
  'tubetto',
  'busta',
  'flacone',
  'vasetto',
  'brick',
  'mazzo',
  'fetta',
  'lattina',
  'retina',
  'ricarica',
  'grappolo',
  'spicchio',
  'kit',
];

export const getUnitDisplayName = (
  option?: ConfigOption | null,
  quantity?: number | string | null
): string => {
  if (!option) return 'Unità';
  const val = (option.codeValue || '').toLowerCase().replace(/^unit\./i, '').trim();
  const name = (option.codeName || '').toLowerCase().replace(/^unit\./i, '').trim();
  const entry = UNIT_DICTIONARY[val] || UNIT_DICTIONARY[name];
  if (!entry) return option.codeValue || option.codeName || 'Unità';

  if (quantity != null) {
    const parsed = typeof quantity === 'string' ? parseFloat(quantity.replace(',', '.')) : quantity;
    return parsed === 1 ? entry.singular : entry.plural;
  }
  return entry.plural;
};

export const formatUnitForQuantity = (
  unitCodeOrName?: string | null,
  quantity?: number | string | null
): string => {
  if (!unitCodeOrName) return '';
  const raw = unitCodeOrName.toLowerCase().replace(/^unit\./i, '').trim();
  const entry = UNIT_DICTIONARY[raw];
  if (!entry) return unitCodeOrName;

  if (quantity != null) {
    const parsed = typeof quantity === 'string' ? parseFloat(quantity.replace(',', '.')) : quantity;
    return parsed === 1 ? entry.singular : entry.plural;
  }
  return entry.plural;
};

interface ShoppingUnitSelectProps {
  value: string; // unitId come stringa, oppure ""
  onChange: (val: string) => void;
  unitOptions: ConfigOption[];
  disabled?: boolean;
  className?: string;
}

export const ShoppingUnitSelect: React.FC<ShoppingUnitSelectProps> = ({
  value,
  onChange,
  unitOptions,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 220);
    }
  }, [isOpen]);

  const sortedOptions = useMemo(() => {
    return [...unitOptions].sort((a, b) => {
      const valA = (a.codeValue || a.codeName || '').toLowerCase().replace(/^unit\./i, '').trim();
      const valB = (b.codeValue || b.codeName || '').toLowerCase().replace(/^unit\./i, '').trim();
      const keyA = UNIT_DICTIONARY[valA]?.singular || valA;
      const keyB = UNIT_DICTIONARY[valB]?.singular || valB;
      const idxA = ORDERED_UNIT_KEYS.indexOf(keyA);
      const idxB = ORDERED_UNIT_KEYS.indexOf(keyB);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });
  }, [unitOptions]);

  const selectedOption = unitOptions.find((opt) => String(opt.id) === value);
  const selectedLabel = selectedOption ? getUnitDisplayName(selectedOption) : 'Unità';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full h-[38px] px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-xs font-semibold transition-colors outline-none cursor-pointer flex justify-between items-center shadow-xs ${

          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <span className="truncate text-gray-700 capitalize">{selectedLabel}</span>
        <DropdownIcon isDropdownOpen={isOpen} />
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute z-[100] w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-56 overflow-y-auto custom-scrollbar ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {/* Opzione vuota / Nessuna unità */}
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between ${
              !value ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-500 italic'
            }`}
          >
            <span>Nessuna unità</span>
            {!value && <span className="text-blue-600 font-bold">✓</span>}
          </div>

          {sortedOptions.map((opt) => {
            const isSelected = String(opt.id) === value;
            const displayName = getUnitDisplayName(opt);

            return (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(String(opt.id));
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between ${
                  isSelected ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-700'
                }`}
              >
                <span className="capitalize">{displayName}</span>
                {isSelected && <span className="text-blue-600 font-bold">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShoppingUnitSelect;
