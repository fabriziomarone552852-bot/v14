// src/components/settings/PreferencesSection.tsx
import React, { useState } from 'react';

interface PreferencesSectionProps {
  defaultStartupPage: string;
  onDefaultStartupPageChange: (value: string) => void;
  modulePreferences: Record<string, boolean>;
  onModulePreferenceChange: (moduleName: string, checked: boolean) => void;
  disabled?: boolean;
}

const MACRO_SECTIONS = [
  { id: 'agenda', label: 'Agenda / Calendario' },
  { id: 'shopping', label: 'Spesa & Inventario' },
  { id: 'trackers', label: 'Trackers Media (TV/Film/Libri)' },
];

const AVAILABLE_PAGES = [
  { id: '', label: 'Pagina Predefinita (Home)' },
  { id: '/giorno', label: 'Agenda del Giorno' },
  { id: '/settimana', label: 'Agenda Settimanale' },
  { id: '/mese', label: 'Agenda Mensile' },
  { id: '/shopping', label: 'Spesa' },
  { id: '/trackers', label: 'Trackers' },
];

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  defaultStartupPage,
  onDefaultStartupPageChange,
  modulePreferences,
  onModulePreferenceChange,
  disabled = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Preferenze App</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Personalizza l&apos;aspetto e i moduli attivi della tua applicazione.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Pagina Iniziale</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Scegli quale schermata aprire all&apos;avvio.
          </p>
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen((prev) => !prev)}
            disabled={disabled}
            className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-white text-slate-700 hover:border-blue-300 transition-colors cursor-pointer focus:outline-none disabled:bg-slate-100 disabled:opacity-50"
          >
            <span className="truncate">
              {AVAILABLE_PAGES.find(p => p.id === defaultStartupPage)?.label || 'Pagina Predefinita (Home)'}
            </span>
            <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <>
              {/* Overlay invisibile per chiudere al click fuori */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-full z-50 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-fadeIn py-1">
                {AVAILABLE_PAGES.map((page) => {
                  const isSelected = page.id === defaultStartupPage;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => {
                        onDefaultStartupPageChange(page.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{page.label}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Macrosezioni Attive</h4>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Abilita o disabilita interi moduli dell&apos;applicazione. I moduli disabilitati verranno nascosti dal menu principale.
          </p>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {MACRO_SECTIONS.map((section) => {
              // Missing=True fallback logic
              const isChecked = modulePreferences[section.id] !== false;
              
              return (
                <label 
                  key={section.id} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                    isChecked 
                      ? 'border-blue-200 bg-blue-50/50 shadow-sm' 
                      : 'border-slate-200 bg-slate-50/50 opacity-75 grayscale-[0.5]'
                  }`}
                >
                  <span className={`text-xs font-bold whitespace-nowrap ${isChecked ? 'text-blue-800' : 'text-slate-500'}`}>
                    {section.label}
                  </span>
                  
                  {/* Custom Toggle Switch (Sliding) */}
                  <div className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isChecked}
                      onChange={(e) => onModulePreferenceChange(section.id, e.target.checked)}
                      disabled={disabled}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;
