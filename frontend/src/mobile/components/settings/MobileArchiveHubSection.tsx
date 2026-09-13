// src/mobile/components/settings/MobileArchiveHubSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Calendar,
  FileText,
  Clock,
  Repeat,
  FolderTree,
  Tag,
  Truck,
  ShoppingBag,
  BarChart2,
  ChevronRight,
} from 'lucide-react';

interface ArchiveModuleItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
  path: string;
}

const ARCHIVE_MODULES: ArchiveModuleItem[] = [
  {
    id: 'tasks',
    title: 'Attività & Task',
    description: 'Gestisci le tue attività e i sotto-task',
    icon: <CheckSquare className="w-5 h-5 text-blue-600" />,
    bg: 'bg-blue-50',
    path: '/tasks',
  },
  {
    id: 'events',
    title: 'Eventi & Calendario',
    description: 'Tutti gli eventi e le ricorrenze',
    icon: <Calendar className="w-5 h-5 text-emerald-600" />,
    bg: 'bg-emerald-50',
    path: '/events',
  },
  {
    id: 'notes',
    title: 'Note & Appunti',
    description: 'Pensieri e promemoria organizzati',
    icon: <FileText className="w-5 h-5 text-amber-600" />,
    bg: 'bg-amber-50',
    path: '/notes',
  },
  {
    id: 'countdowns',
    title: 'Obiettivi & Countdown',
    description: 'Scadenze e traguardi importanti',
    icon: <Clock className="w-5 h-5 text-indigo-600" />,
    bg: 'bg-indigo-50',
    path: '/countdowns',
  },
  {
    id: 'habits',
    title: 'Abitudini & Routine',
    description: 'Monitoraggio e frequenze abitudini',
    icon: <Repeat className="w-5 h-5 text-cyan-600" />,
    bg: 'bg-cyan-50',
    path: '/habits',
  },
  {
    id: 'categories',
    title: 'Categorie & Ambiti',
    description: 'Ambiti di vita, colori e icone',
    icon: <FolderTree className="w-5 h-5 text-pink-600" />,
    bg: 'bg-pink-50',
    path: '/categories',
  },
  {
    id: 'tags',
    title: 'Tag & Etichette',
    description: 'Parole chiave veloci per elementi',
    icon: <Tag className="w-5 h-5 text-violet-600" />,
    bg: 'bg-violet-50',
    path: '/tags',
  },
  {
    id: 'fornitori',
    title: 'Negozi & Brand',
    description: 'Supermercati e marchi di fiducia',
    icon: <Truck className="w-5 h-5 text-orange-600" />,
    bg: 'bg-orange-50',
    path: '/fornitori',
  },
  {
    id: 'shopping-archive',
    title: 'Spesa & Liste',
    description: 'Storico liste spesa e prezzi',
    icon: <ShoppingBag className="w-5 h-5 text-lime-600" />,
    bg: 'bg-lime-50',
    path: '/shopping-archive',
  },
  {
    id: 'reviews',
    title: 'Review Mesi & Anni',
    description: 'Bilanci periodici e retrospettive',
    icon: <BarChart2 className="w-5 h-5 text-rose-600" />,
    bg: 'bg-rose-50',
    path: '/reviews',
  },
];

export const MobileArchiveHubSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-3 animate-fadeIn pb-12">
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Archivio Dati</h1>
        <p className="text-xs text-gray-500 mt-0.5">Consulta e organizza tutti i dati archiviati</p>
      </div>

      {/* Lista dei 10 moduli di archiviazione a tutta larghezza */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
        {ARCHIVE_MODULES.map((mod) => (
          <button
            key={mod.id}
            type="button"
            onClick={() => navigate(mod.path)}
            className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className={`p-2 rounded-xl ${mod.bg} shrink-0`}>{mod.icon}</div>
              <div className="truncate">
                <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {mod.title}
                </div>
                <div className="text-[11px] text-gray-500 truncate mt-0.5">
                  {mod.description}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
