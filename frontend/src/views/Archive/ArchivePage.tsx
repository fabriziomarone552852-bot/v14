// src/views/ArchivePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MenuBarsIcon,
  TaskListIcon,
  CalendarIcon,
  CategoryIcon,
  CountdownIcon,
  HabitIcon,
  NoteIcon,
  ReviewIcon,
  TagIcon,
  StoreIcon,
  ShoppingIcon,
  ArrowRightIcon,
} from '@/components/shared/utils/Icons';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';

interface ArchiveModuleCard {
  id: string;
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  accentBg: string;
  accentText: string;
}

const MODULES: ArchiveModuleCard[] = [
  {
    id: 'tasks',
    title: 'Task & To-Do',
    description: 'Gestisci la lista completa delle tue attività, sotto-task gerarchici e priorità.',
    to: '/tasks',
    icon: <TaskListIcon className="w-6 h-6" />,
    accentBg: 'bg-blue-50 hover:bg-blue-100/80',
    accentText: 'text-blue-600',
  },
  {
    id: 'events',
    title: 'Eventi & Calendario',
    description: 'Consulta e organizza tutti gli eventi, fasce orarie e ricorrenze del calendario.',
    to: '/events',
    icon: <CalendarIcon className="w-6 h-6" />,
    accentBg: 'bg-indigo-50 hover:bg-indigo-100/80',
    accentText: 'text-indigo-600',
  },
  {
    id: 'categories',
    title: 'Categorie & Ambiti',
    description: 'Organizza i tuoi ambiti di vita, icone e colori per catalogare ogni elemento.',
    to: '/categories',
    icon: <CategoryIcon className="w-6 h-6" />,
    accentBg: 'bg-violet-50 hover:bg-violet-100/80',
    accentText: 'text-violet-600',
  },
  {
    id: 'countdowns',
    title: 'Countdown & Scadenze',
    description: 'Monitora il tempo rimanente e i giorni trascorsi per date importanti.',
    to: '/countdowns',
    icon: <CountdownIcon className="w-6 h-6" />,
    accentBg: 'bg-amber-50 hover:bg-amber-100/80',
    accentText: 'text-amber-600',
  },
  {
    id: 'habits',
    title: 'Abitudini & Routine',
    description: 'Traccia la frequenza delle tue routine giornaliere, settimanali e mensili.',
    to: '/habits',
    icon: <HabitIcon className="w-6 h-6" />,
    accentBg: 'bg-emerald-50 hover:bg-emerald-100/80',
    accentText: 'text-emerald-600',
  },
  {
    id: 'notes',
    title: 'Note & Appunti',
    description: 'Raccogli pensieri, promemoria veloci e appunti collegati a categorie.',
    to: '/notes',
    icon: <NoteIcon className="w-6 h-6" />,
    accentBg: 'bg-cyan-50 hover:bg-cyan-100/80',
    accentText: 'text-cyan-600',
  },
  {
    id: 'reviews',
    title: 'Review Mesi & Anni',
    description: 'Analizza i bilanci periodici, le risposte di review e il progresso annuale.',
    to: '/reviews',
    icon: <ReviewIcon className="w-6 h-6" />,
    accentBg: 'bg-rose-50 hover:bg-rose-100/80',
    accentText: 'text-rose-600',
  },
  {
    id: 'tags',
    title: 'Tag & Etichette',
    description: 'Organizza i tag per collegare task, eventi e note con parole chiave veloci.',
    to: '/tags',
    icon: <TagIcon className="w-6 h-6" />,
    accentBg: 'bg-teal-50 hover:bg-teal-100/80',
    accentText: 'text-teal-600',
  },
  {
    id: 'shopping',
    title: 'Spesa & Liste',
    description: 'Gestisci gruppi collaborativi, liste spesa archiviate e lo storico prezzi.',
    to: '/shopping-archive',
    icon: <ShoppingIcon className="w-6 h-6" />,
    accentBg: 'bg-emerald-50 hover:bg-emerald-100/80',
    accentText: 'text-emerald-600',
  },
  {
    id: 'fornitori',
    title: 'Negozi & Brand',
    description: 'Gestisci negozi di fiducia, supermercati e i marchi dei tuoi prodotti.',
    to: '/fornitori',
    icon: <StoreIcon className="w-6 h-6" />,
    accentBg: 'bg-orange-50 hover:bg-orange-100/80',
    accentText: 'text-orange-600',
  },
];

const panelClass =
  'rounded-2xl border border-slate-200/80 bg-white shadow-xs';

export const ArchivePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col gap-4 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* HEADER DELLA PAGINA ARCHIVIO */}
      <ArchiveHeader
        icon={<MenuBarsIcon className="w-5 h-5" />}
        title="Archivio Dati"
        subtitle="Centro di gestione per organizzare e consultare tutti i dati della tua Smart Agenda."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            10 Moduli
          </span>
        }
      />

      {/* GRIGLIA BENTO DEI MODULI: 2 RIGHE DA 5 COLONNE CON LO SPAZIO VUOTO SUL 10° SLOT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 grid-rows-2 gap-4 flex-1 min-h-0 relative z-10">
        {MODULES.map((mod) => (
          <button
            key={mod.id}
            type="button"
            onClick={() => navigate(mod.to)}
            className={`${panelClass} p-5 flex flex-col justify-between text-left group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 relative z-10 h-full`}
          >
            {/* Top Bar della Card: Icona */}
            <div className="flex items-start justify-between gap-2">
              <div
                className={`p-3 rounded-2xl transition-colors ${mod.accentBg} ${mod.accentText} shadow-2xs group-hover:scale-105 transition-transform duration-200`}
              >
                {mod.icon}
              </div>
            </div>

            {/* Contenuto Testuale */}
            <div className="my-auto py-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {mod.title}
              </h2>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {mod.description}
              </p>
            </div>

            {/* Footer della Card: Link azione */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
              <span>Apri modulo</span>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRightIcon className="w-3 h-3 text-current" />
              </div>
            </div>
          </button>
        ))}

      </div>
    </div>
  );
};

export default ArchivePage;

