// src/views/Archive/ArchivePage.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuBarsIcon, ArrowRightIcon } from '@/components/shared/utils/Icons';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { useAuth } from '@/context/AuthContext';
import { getVisibleArchiveSections } from '@/data/archiveModules';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

const panelClass =
  'rounded-2xl border border-slate-200/80 bg-white shadow-xs';

export const ArchivePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleScroll, modalScrollbarClass } = useFadeScrollbar();

  const sections = useMemo(
    () => getVisibleArchiveSections(user?.module_preferences),
    [user?.module_preferences]
  );

  const totalModulesCount = useMemo(
    () => sections.reduce((sum, sec) => sum + sec.modules.length, 0),
    [sections]
  );

  return (
    <div className="h-full flex flex-col gap-4 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* HEADER DELLA PAGINA ARCHIVIO */}
      <ArchiveHeader
        icon={<MenuBarsIcon className="w-5 h-5" />}
        title="Archivio Dati"
        subtitle="Centro di gestione per organizzare e consultare tutti i dati di Vita."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            {totalModulesCount} {totalModulesCount === 1 ? 'Modulo' : 'Moduli'}
          </span>
        }
      />

      {/* SEZIONI ARCHIVIO ORGANIZZATE PER AMBITO */}
      <div
        onScroll={handleScroll}
        className={`flex-1 min-h-0 overflow-y-auto pr-1 space-y-5 pb-2 relative z-10 ${modalScrollbarClass}`}
      >
        {sections.map((section) => (
          <section key={section.id} className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                {section.label}
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                {section.modules.length} {section.modules.length === 1 ? 'modulo' : 'moduli'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {section.modules.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => navigate(mod.to)}
                    className={`${panelClass} p-4 sm:p-5 flex flex-col justify-between text-left group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-400/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 relative z-10 min-h-[184px]`}
                  >
                    {/* Top Bar della Card: Icona */}
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`p-3 rounded-2xl transition-colors ${mod.accentBg} ${mod.accentText} shadow-2xs group-hover:scale-105 transition-transform duration-200`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Contenuto Testuale */}
                    <div className="my-auto py-2.5">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    {/* Footer della Card: Link azione */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                      <span>Apri modulo</span>
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ArrowRightIcon className="w-3 h-3 text-current" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ArchivePage;
