// src/components/habits/RoutineCard.tsx
import React from 'react';
import type { EnrichedRoutineItem } from '@/hooks/useHabitArchiveData';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';

interface RoutineCardProps {
  routine: EnrichedRoutineItem;
  onClick: () => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onClick }) => {
  const isPaused = !routine.isAttiva;

  return (
    <div
      onClick={onClick}
      className={`relative h-48 w-full rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg group transform transition-all duration-300 hover:-translate-y-1 bg-slate-900 border ${
        isPaused ? 'border-amber-200/60 opacity-90' : 'border-slate-200/80'
      }`}
    >
      {/* 1. IMMAGINE DI SFONDO CON ZOOM FLUIDO (E BIANCO/NERO SE IN PAUSA) */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105 ${
          isPaused ? 'grayscale contrast-125 brightness-75' : ''
        }`}
        style={{ backgroundImage: `url(${routine.imageUrl || DEFAULT_COVER_IMAGE})` }}
      />

      {/* 2. GRADIENTE OVERLAY SCURO PER LEGGIBILITÀ OTTIMALE */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />

      {/* 3. BADGE STATO IN ALTO A DESTRA */}
      <div className="absolute top-3 right-3 z-20">
        {isPaused ? (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-500/85 backdrop-blur-md text-white shadow-sm flex items-center gap-1">
            <span>⏸</span>
            <span>In pausa</span>
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/85 backdrop-blur-md text-white shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Attiva
          </span>
        )}
      </div>

      {/* 4. PROSSIMA SCADENZA IN ALTO A SINISTRA */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-[11px] font-bold text-white/90 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {routine.nextOccurrenceLabel}
        </span>
      </div>

      {/* 5. TITOLO E FREQUENZA IN BASSO */}
      <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end z-10">
        <h3 className="text-white font-extrabold text-base uppercase tracking-wider truncate mb-1.5 drop-shadow-md group-hover:text-blue-200 transition-colors">
          {routine.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200/90 drop-shadow-sm truncate">
          <span>🔄</span>
          <span className="truncate">{routine.frequencyLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default RoutineCard;
