import React from 'react';

export const YearInPixelsIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-4 gap-[2.5px] p-0.5 items-center justify-center ${className}`} aria-hidden="true">
      {/* Prima riga completa */}
      <span className="w-[5px] h-[5px] rounded-[1px] bg-red-500 shadow-2xs" />
      <span className="w-[5px] h-[5px] rounded-[1px] bg-amber-400 shadow-2xs" />
      <span className="w-[5px] h-[5px] rounded-[1px] bg-emerald-500 shadow-2xs" />
      <span className="w-[5px] h-[5px] rounded-[1px] bg-purple-500 shadow-2xs" />

      {/* Seconda riga completa */}
      <span className="w-[5px] h-[5px] rounded-[1px] bg-purple-500 shadow-2xs" />
      <span className="w-[5px] h-[5px] rounded-[1px] bg-red-500 shadow-2xs" />
      <span className="w-[5px] h-[5px] rounded-[1px] bg-amber-400 shadow-2xs" />
      <span className="w-[5px] h-[5px] rounded-[1px] bg-emerald-500 shadow-2xs" />

      {/* Terza riga a metà (2 quadratini su 4) */}
      <span className="w-[5px] h-[5px] rounded-[1px] bg-emerald-500 shadow-2xs" />
      <span className="w-[5px] h-[5px] rounded-[1px] bg-amber-400 shadow-2xs" />
      <span className="w-[5px] h-[5px] opacity-0" />
      <span className="w-[5px] h-[5px] opacity-0" />
    </div>
  );
};

export default YearInPixelsIcon;
