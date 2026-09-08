// src/components/shared/layout/ArchiveHeader.tsx
import React from 'react';

interface ArchiveHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  icon,
  title,
  subtitle,
  badge,
  extra,
  className = '',
}) => {
  // Se non ci sono badge extra, su mobile l'intero componente è nascosto
  if (!extra) {
    return (
      <section
        className={`hidden sm:flex rounded-2xl border border-slate-200/90 bg-white shadow-xs p-3.5 sm:px-5 shrink-0 relative z-10 ${className}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl shadow-xs shrink-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="shrink-0 relative z-10 bg-transparent border-none shadow-none p-0 sm:rounded-2xl sm:border sm:border-slate-200/90 sm:bg-white sm:shadow-xs sm:p-3.5 sm:px-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
        {/* Sinistra: Icona, Titolo, Badge e Sottotitolo (visibile solo su Desktop) */}
        <div className="hidden sm:flex items-center gap-3.5">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl shadow-xs shrink-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Destra: Targhette statistiche (su mobile centrate orizzontalmente senza alcun riquadro attorno) */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
          {extra}
        </div>
      </div>
    </section>
  );
};

export default ArchiveHeader;
