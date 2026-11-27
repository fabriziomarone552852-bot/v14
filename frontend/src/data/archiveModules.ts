// src/data/archiveModules.ts
import type React from 'react';
import {
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
  BellIcon,
} from '@/components/shared/utils/Icons';
import type { UserModulePreferences } from '@/types/settings';

export type ArchiveModuleGroupId = 'agenda' | 'organization' | 'shopping' | 'system';

export type ArchiveModuleId =
  | 'tasks'
  | 'events'
  | 'notes'
  | 'countdowns'
  | 'habits'
  | 'categories'
  | 'tags'
  | 'reviews'
  | 'shopping-archive'
  | 'fornitori'
  | 'notifications';

export type ArchivePreferenceKey = 'agenda' | 'shopping';

export interface ArchiveModuleDefinition {
  id: ArchiveModuleId;
  group: ArchiveModuleGroupId;
  title: string;
  description: string;
  shortDescription: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentText: string;
  preferenceKey?: ArchivePreferenceKey;
}

export interface ArchiveSectionDefinition {
  id: ArchiveModuleGroupId;
  label: string;
  preferenceKey?: ArchivePreferenceKey;
  modules: ArchiveModuleDefinition[];
}

export const ARCHIVE_SECTIONS: ArchiveSectionDefinition[] = [
  {
    id: 'agenda',
    label: 'Agenda & Attività',
    preferenceKey: 'agenda',
    modules: [
      {
        id: 'tasks',
        group: 'agenda',
        title: 'Task & To-Do',
        description: 'Gestisci la lista completa delle tue attività, sotto-task gerarchici e priorità.',
        shortDescription: 'Attività, sotto-task e priorità',
        to: '/tasks',
        icon: TaskListIcon,
        accentBg: 'bg-blue-50 group-hover:bg-blue-100/80',
        accentText: 'text-blue-600',
        preferenceKey: 'agenda',
      },
      {
        id: 'events',
        group: 'agenda',
        title: 'Eventi & Calendario',
        description: 'Consulta e organizza tutti gli eventi, fasce orarie e ricorrenze del calendario.',
        shortDescription: 'Appuntamenti, orari e ricorrenze',
        to: '/events',
        icon: CalendarIcon,
        accentBg: 'bg-indigo-50 group-hover:bg-indigo-100/80',
        accentText: 'text-indigo-600',
        preferenceKey: 'agenda',
      },
      {
        id: 'notes',
        group: 'agenda',
        title: 'Note & Appunti',
        description: 'Raccogli pensieri, promemoria veloci e appunti collegati a categorie.',
        shortDescription: 'Pensieri, memo e riflessioni',
        to: '/notes',
        icon: NoteIcon,
        accentBg: 'bg-amber-50 group-hover:bg-amber-100/80',
        accentText: 'text-amber-600',
        preferenceKey: 'agenda',
      },
      {
        id: 'countdowns',
        group: 'agenda',
        title: 'Obiettivi & Countdown',
        description: 'Monitora il tempo rimanente e i giorni trascorsi per le date più importanti.',
        shortDescription: 'Scadenze e traguardi importanti',
        to: '/countdowns',
        icon: CountdownIcon,
        accentBg: 'bg-cyan-50 group-hover:bg-cyan-100/80',
        accentText: 'text-cyan-600',
        preferenceKey: 'agenda',
      },
      {
        id: 'habits',
        group: 'agenda',
        title: 'Abitudini & Routine',
        description: 'Traccia la frequenza delle tue routine giornaliere, settimanali e mensili.',
        shortDescription: 'Monitoraggio e frequenze abitudini',
        to: '/habits',
        icon: HabitIcon,
        accentBg: 'bg-emerald-50 group-hover:bg-emerald-100/80',
        accentText: 'text-emerald-600',
        preferenceKey: 'agenda',
      },
    ],
  },
  {
    id: 'organization',
    label: 'Organizzazione & Bilanci',
    preferenceKey: 'agenda',
    modules: [
      {
        id: 'categories',
        group: 'organization',
        title: 'Categorie & Ambiti',
        description: 'Organizza i tuoi ambiti di vita, icone e colori per catalogare ogni elemento.',
        shortDescription: 'Ambiti di vita, colori e icone',
        to: '/categories',
        icon: CategoryIcon,
        accentBg: 'bg-violet-50 group-hover:bg-violet-100/80',
        accentText: 'text-violet-600',
        preferenceKey: 'agenda',
      },
      {
        id: 'tags',
        group: 'organization',
        title: 'Tag & Etichette',
        description: 'Organizza i tag per collegare revisioni ed elementi con parole chiave veloci.',
        shortDescription: 'Parole chiave e frequenza tag',
        to: '/tags',
        icon: TagIcon,
        accentBg: 'bg-teal-50 group-hover:bg-teal-100/80',
        accentText: 'text-teal-600',
        preferenceKey: 'agenda',
      },
      {
        id: 'reviews',
        group: 'organization',
        title: 'Review Mesi & Anni',
        description: 'Analizza i bilanci periodici, le risposte di review e il progresso annuale.',
        shortDescription: 'Bilanci periodici e retrospettive',
        to: '/reviews',
        icon: ReviewIcon,
        accentBg: 'bg-rose-50 group-hover:bg-rose-100/80',
        accentText: 'text-rose-600',
        preferenceKey: 'agenda',
      },
    ],
  },
  {
    id: 'shopping',
    label: 'Spesa & Acquisti',
    preferenceKey: 'shopping',
    modules: [
      {
        id: 'shopping-archive',
        group: 'shopping',
        title: 'Spesa & Liste',
        description: 'Gestisci gruppi collaborativi, liste archiviate, catalogo prodotti e storico prezzi.',
        shortDescription: 'Gruppi, liste, prodotti e storico prezzi',
        to: '/shopping-archive',
        icon: ShoppingIcon,
        accentBg: 'bg-lime-50 group-hover:bg-lime-100/80',
        accentText: 'text-lime-600',
        preferenceKey: 'shopping',
      },
      {
        id: 'fornitori',
        group: 'shopping',
        title: 'Negozi & Brand',
        description: 'Gestisci negozi di fiducia, supermercati e i marchi dei tuoi prodotti.',
        shortDescription: 'Supermercati e marchi di fiducia',
        to: '/fornitori',
        icon: StoreIcon,
        accentBg: 'bg-orange-50 group-hover:bg-orange-100/80',
        accentText: 'text-orange-600',
        preferenceKey: 'shopping',
      },
    ],
  },
  {
    id: 'system',
    label: 'Sistema & Notifiche',
    modules: [
      {
        id: 'notifications',
        group: 'system',
        title: 'Notifiche & Avvisi',
        description: 'Consulta lo storico permanente di notifiche, inviti spesa, commenti e avvisi di sistema.',
        shortDescription: 'Storico permanente notifiche e avvisi',
        to: '/notifications',
        icon: BellIcon,
        accentBg: 'bg-sky-50 group-hover:bg-sky-100/80',
        accentText: 'text-sky-600',
      },
    ],
  },
];

export const ARCHIVE_MODULES: ArchiveModuleDefinition[] = ARCHIVE_SECTIONS.flatMap(
  (section) => section.modules
);

export const ARCHIVE_ROUTE_TITLES: Record<string, string> = ARCHIVE_MODULES.reduce<
  Record<string, string>
>((acc, mod) => {
  acc[mod.to] = mod.title;
  return acc;
}, {});

export const isArchivePath = (pathname: string): boolean => {
  if (pathname === '/archivio') return true;
  return ARCHIVE_MODULES.some(
    (mod) => pathname === mod.to || pathname.startsWith(`${mod.to}/`)
  );
};

export const getVisibleArchiveSections = (
  preferences?: UserModulePreferences | null
): ArchiveSectionDefinition[] => {
  const prefs = preferences ?? {};
  return ARCHIVE_SECTIONS.map((section) => ({
    ...section,
    modules: section.modules.filter((mod) => {
      if (!mod.preferenceKey) return true;
      return prefs[mod.preferenceKey] !== false;
    }),
  })).filter((section) => section.modules.length > 0);
};
