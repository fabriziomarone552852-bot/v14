// src/mobile/components/settings/MobileArchiveHubSection.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getVisibleArchiveSections } from '@/data/archiveModules';

export const MobileArchiveHubSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const sections = useMemo(
    () => getVisibleArchiveSections(user?.module_preferences),
    [user?.module_preferences]
  );

  return (
    <div className="w-full space-y-4 animate-fadeIn pb-12">
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Archivio Dati</h1>
        <p className="text-xs text-gray-500 mt-0.5">Consulta e organizza tutti i dati archiviati</p>
      </div>

      {/* Sezioni allineate con la vista Desktop */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="space-y-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
              {section.label}
            </h2>

            <div className="w-full bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
              {section.modules.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => navigate(mod.to)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`p-2 rounded-xl ${mod.accentBg} ${mod.accentText} shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {mod.title}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">
                          {mod.shortDescription}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
