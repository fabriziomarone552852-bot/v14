// src/components/habits/HabitCard.tsx
import React from 'react';
import type { EnrichedHabitItem } from '@/hooks/useHabitArchiveData';

interface HabitCardProps {
  habit: EnrichedHabitItem;
  onClick: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onClick }) => {
  const isPaused = !habit.isAttiva;

  return (
    <div
      onClick={onClick}
      className={`h-40 sm:h-44 w-full rounded-2xl bg-white border p-5 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md group transform transition-all duration-200 hover:-translate-y-0.5 ${
        isPaused
          ? 'border-amber-200/80 bg-amber-50/20'
          : 'border-slate-200/90 hover:border-purple-300'
      }`}
    >
      {/* 1. PARTE SUPERIORE: ICONA E BADGE STATO */}
      <div className="flex items-start justify-between">
        {/* ICONA EMOJI */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-105 shadow-2xs border ${
            isPaused
              ? 'bg-amber-50 border-amber-200/70 text-amber-700'
              : 'bg-purple-50 border-purple-100 text-purple-700'
          }`}
        >
          {habit.icon || '✨'}
        </div>

        {/* BADGE STATO */}
        {isPaused ? (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <span>⏸</span>
            <span>In pausa</span>
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Attivo</span>
          </span>
        )}
      </div>

      {/* 2. PARTE INFERIORE: TITOLO E FREQUENZA GIORNALIERA */}
      <div className="min-w-0">
        <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-800 truncate group-hover:text-purple-600 transition-colors">
          {habit.title}
        </h3>
        <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1 truncate">
          <span>✨</span>
          <span>1 volta al giorno • Tutti i giorni</span>
        </p>
      </div>
    </div>
  );
};

export default HabitCard;
