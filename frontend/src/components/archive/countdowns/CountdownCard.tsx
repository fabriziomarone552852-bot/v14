// src/components/countdowns/CountdownCard.tsx
import React from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import TickDisplay from '@/components/day/utils/TickDisplay';
import starsGif from '@/assets/stars.gif';
import { formatToItalianShortDate, pad } from '@/utils/dateUtils';

interface CountdownCardProps {
  countdown: CountdownItem;
  onClick: () => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ countdown, onClick }) => {
  const targetDate = new Date(countdown.targetDateStr);
  const now = new Date();
  const hasExpired = !isNaN(targetDate.getTime()) && targetDate.getTime() <= now.getTime();

  let formattedDate = '';
  let formattedTime = '';

  if (countdown.targetDateStr) {
    formattedDate = formatToItalianShortDate(countdown.targetDateStr.substring(0, 10));
    if (!isNaN(targetDate.getTime())) {
      const hours = pad(targetDate.getHours());
      const minutes = pad(targetDate.getMinutes());
      formattedTime = `${hours}:${minutes}`;
    }
  }

  return (
    <div
      onClick={onClick}
      className={`relative h-48 w-full rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg group transform transition-all duration-300 hover:-translate-y-1 bg-slate-900 border ${
        hasExpired ? 'border-slate-300/60 opacity-90' : 'border-slate-200/80'
      }`}
    >
      {/* 1. IMMAGINE DI SFONDO CON ZOOM FLUIDO ED EFFETTO BIANCO E NERO SE SCADUTO */}
      <div
        className={`absolute inset-0 bg-cover transition-all duration-700 group-hover:scale-105 ${
          hasExpired ? 'grayscale contrast-125 brightness-75' : ''
        }`}
        style={{
          backgroundImage: `url(${countdown.imageUrl})`,
          backgroundPosition: countdown.immaginePosizione || 'center',
        }}
      />

      {/* 2. GRADIENTE OVERLAY SCURO PER LEGGIBILITÀ OTTIMALE */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />

      {/* 3. OVERLAY GIF STELLE SE IL COUNTDOWN È SCADUTO */}
      {hasExpired && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 z-0 mix-blend-screen"
          style={{ backgroundImage: `url(${starsGif})` }}
        />
      )}

      {/* 4. BADGE STATO IN ALTO A DESTRA */}
      <div className="absolute top-3 right-3 z-20">
        {hasExpired ? (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-slate-700/85 backdrop-blur-md text-slate-200 border border-white/10 shadow-sm">
            Scaduto
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/80 backdrop-blur-md text-white shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            In corso
          </span>
        )}
      </div>

      {/* 5. DATA TARGET ED ORARIO IN ALTO A SINISTRA */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-[11px] font-bold text-white/90 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span>{formattedDate}</span>
          {formattedTime && (
            <>
              <span className="text-white/40">•</span>
              <span className="font-mono text-white/90">{formattedTime}</span>
            </>
          )}
        </span>
      </div>

      {/* 6. CONTENUTO CENTRALE E TICK DISPLAY */}
      <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end z-10">
        <h3 className="text-white font-extrabold text-base uppercase tracking-wider truncate mb-2.5 drop-shadow-md group-hover:text-blue-200 transition-colors">
          {countdown.title}
        </h3>

        {!hasExpired ? (
          <div className="overflow-x-auto custom-scrollbar pb-0.5">
            <TickDisplay targetDateStr={countdown.targetDateStr} variant="hub" isActive={true} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-amber-300 drop-shadow-md uppercase tracking-widest animate-pulse">
              🎉 Traguardo Raggiunto!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownCard;
