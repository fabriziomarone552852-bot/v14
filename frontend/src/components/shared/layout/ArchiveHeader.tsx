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
  const basePanelClass =
    'rounded-2xl border border-slate-200/90 bg-white shadow-xs p-5 sm:p-6 shrink-0 relative z-10';

  return (
    <section className={`${basePanelClass} ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Sinistra: Icona, Titolo, Badge e Sottotitolo */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs shrink-0 flex items-center justify-center">
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

        {/* Destra: Elementi Extra opzionali (es. micro-card statistiche, azioni o contatori) */}
        {extra && (
          <div className="flex flex-wrap items-center gap-2">
            {extra}
          </div>
        )}
      </div>
    </section>
  );
};

export default ArchiveHeader;
