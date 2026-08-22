// frontend/src/components/dashboard/quotes/FairytaleHillCard.tsx
import React from 'react';
import fairytaleHill from '@/assets/fairytale-hill.svg';

/**
 * Componente atomico per la visualizzazione dell'Oasi Naturale (Collina Fatata) sul lato destro.
 * Segue il principio di modularità: in futuro questo blocco potrà essere sostituito o affiancato
 * da recap di altre sezioni dell'applicazione.
 */
export const FairytaleHillCard: React.FC = () => {
  return (
    <div className="xl:col-span-7 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-white rounded-xl shadow-sm border border-gray-200 h-full relative overflow-hidden flex items-end justify-end group">
      
      {/* Sfumatura morbida sul bordo sinistro per fondere il disegno */}
      <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-emerald-50/70 to-transparent z-10 pointer-events-none" />
      
      {/* Badge decorativo discreto */}
      <div className="absolute top-3.5 left-4 z-20 pointer-events-none opacity-85">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg backdrop-blur-xs shadow-2xs">
          🌸 Oasi di Ispirazione & Focus
        </span>
      </div>

      {/* Illustrazione della collina fiorita */}
      <img 
        src={fairytaleHill} 
        alt="Collina fatata fiorita" 
        className="h-full w-full object-cover object-right-bottom drop-shadow-xs transition-transform duration-700 ease-out group-hover:scale-[1.02] select-none" 
      />
    </div>
  );
};
