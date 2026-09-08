// src/mobile/components/MobileHeader.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEventModals } from '@/context/EventModalContext';
import { useTaskModals } from '@/context/TaskModalContext';
import { useRoutineModals } from '@/context/RoutineModalContext';
import { useShoppingModals } from '@/context/ShoppingModalContext';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import { formatDateString } from '@/utils/dateUtils';
import {
  MenuBarsIcon,
  CalendarIcon,
  TaskListIcon,
  RepeatIcon,
  CalendarDayIcon,
  CalendarWeekIcon,
  CalendarMonthIcon,
  CalendarYearIcon,
  ShoppingIcon,
  SearchIcon,
  TagIcon,
  UsersIcon,
  BackIcon,
} from '@/components/shared/utils/Icons';

interface MobileHeaderProps {
  onOpenDrawer: () => void;
}

const DEFAULT_ARCHIVE_TITLES: Record<string, string> = {
  '/tasks': 'Gestione Task',
  '/events': 'Gestione Eventi',
  '/categories': 'Categorie & Ambiti',
  '/countdowns': 'Obiettivi & Countdown',
  '/habits': 'Abitudini & Routine',
  '/notes': 'Note & Appunti',
  '/reviews': 'Review Mesi & Anni',
  '/tags': 'Tag & Etichette',
  '/fornitori': 'Negozi & Brand',
  '/shopping-archive': 'Spesa & Liste',
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenDrawer,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  // Header Archivio centralizzato
  const {
    config: archiveConfig,
    triggerOpenSearch,
    triggerOpenNew,
    triggerBack,
  } = useArchiveHeader();

  // Modali Agenda
  const { openEventForm } = useEventModals();
  const { openTaskForm } = useTaskModals();
  const { openRoutineForm } = useRoutineModals();

  // Modali Shopping
  const {
    openOmniSearch,
    openQuickPrice,
    openCreateItem,
    openCreateList,
    openCreateGroup,
  } = useShoppingModals();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const isDay = path === '/giorno';
  const isWeek = path === '/settimana';
  const isMonth = path === '/mese';
  const isYear = path === '/anno';
  const isShopping = path === '/shopping';
  const isSettings = path.startsWith('/settings') || path === '/archivio' || path === '/admin';
  const isArchivePage = Object.keys(DEFAULT_ARCHIVE_TITLES).some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  // Chiudi menu con tasto Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAddMenuOpen(false);
    };
    if (isAddMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddMenuOpen]);

  // Handlers Agenda
  const handleNewEvent = () => {
    setIsAddMenuOpen(false);
    const todayStr = formatDateString(new Date());
    openEventForm(null, todayStr);
  };

  const handleNewTask = () => {
    setIsAddMenuOpen(false);
    openTaskForm();
  };

  const handleNewRoutine = () => {
    setIsAddMenuOpen(false);
    openRoutineForm();
  };

  // Handlers Shopping
  const handleShoppingQuickPrice = () => {
    setIsAddMenuOpen(false);
    openQuickPrice();
  };

  const handleShoppingNewItem = () => {
    setIsAddMenuOpen(false);
    openCreateItem();
  };

  const handleShoppingNewList = () => {
    setIsAddMenuOpen(false);
    openCreateList();
  };

  const handleShoppingNewGroup = () => {
    setIsAddMenuOpen(false);
    openCreateGroup();
  };

  const handleArchiveBack = () => {
    if (archiveConfig.hasBack) {
      triggerBack();
    } else {
      navigate('/settings/archive');
    }
  };

  return (
    <>
      {/* 1. Backdrop oscurato quando il menu di aggiunta rapida è aperto */}
      {!isSettings && !isArchivePage && isAddMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity animate-fadeIn"
          onClick={() => setIsAddMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-gray-900 shadow-xs pt-[env(safe-area-inset-top,0px)] border-b border-gray-200">
        <div className="px-3 h-14 flex items-center justify-between gap-2 max-w-lg mx-auto relative">
          
          {/* ========================================================= */}
          {/* 1. SINISTRA: Back Arrow (per Archivio) o Hamburger (altre)*/}
          {/* ========================================================= */}
          <div className="flex items-center shrink-0 z-10">
            {isArchivePage ? (
              <button
                type="button"
                onClick={handleArchiveBack}
                className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
                aria-label="Torna alla lista archivio"
                title="Torna all'archivio"
              >
                <BackIcon className="w-5 h-5 text-gray-800" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenDrawer}
                className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
                aria-label="Apri menu laterale"
                title="Menu principale"
              >
                <MenuBarsIcon className="w-6 h-6 text-gray-800" />
              </button>
            )}
          </div>

          {/* ========================================================= */}
          {/* 2. CENTRO: Nome Archivio (per Archivio) / Switcher Viste  */}
          {/* ========================================================= */}
          {isArchivePage ? (
            <>
              {/* Titolo fisso e perfettamente centrato nello schermo, immune a pulsanti asimmetrici */}
              <div className="absolute inset-x-14 top-0 bottom-0 flex items-center justify-center pointer-events-none px-2 z-0">
                <h1 className="text-sm font-extrabold text-gray-900 tracking-tight text-center truncate uppercase">
                  {archiveConfig.title || DEFAULT_ARCHIVE_TITLES[path] || 'Archivio'}
                </h1>
              </div>
              <div className="flex-1" />
            </>
          ) : isShopping || isSettings ? (
            <div className="flex-1" />
          ) : (
            <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 gap-0.5 shadow-inner">
              {/* GIORNO */}
              <Link
                to="/giorno"
                title="Vista Giorno"
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  isDay
                    ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <CalendarDayIcon className="w-5 h-5" />
              </Link>

              {/* SETTIMANA */}
              <Link
                to="/settimana"
                title="Vista Settimana"
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  isWeek
                    ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <CalendarWeekIcon className="w-5 h-5" />
              </Link>

              {/* MESE */}
              <Link
                to="/mese"
                title="Vista Mese"
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  isMonth
                    ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <CalendarMonthIcon className="w-5 h-5" />
              </Link>

              {/* ANNO */}
              <Link
                to="/anno"
                title="Vista Anno"
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  isYear
                    ? 'bg-blue-600 text-white shadow-xs font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <CalendarYearIcon className="w-5 h-5" />
              </Link>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. DESTRA: Azioni contestuali (Ricerca, Nuovo, Toggle)    */}
          {/* ========================================================= */}
          <div className="flex items-center gap-1 shrink-0 z-10">

            {/* SE SIAMO IN UNA PAGINA ARCHIVIO */}
            {isArchivePage ? (
              <>
                {/* Lente d'ingrandimento per la ricerca */}
                {archiveConfig.hasSearch && (
                  <button
                    type="button"
                    onClick={triggerOpenSearch}
                    className={`relative w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center ${
                      (archiveConfig.activeFiltersCount ?? 0) > 0 ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    title="Filtri & Ricerca"
                    aria-label="Cerca"
                  >
                    <SearchIcon className="w-5 h-5 text-gray-800" />
                    {Boolean(archiveConfig.activeFiltersCount && archiveConfig.activeFiltersCount > 0) && (
                      <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-2xs">
                        {archiveConfig.activeFiltersCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Tasto Aggiungi (+) nell'header */}
                {archiveConfig.hasNew && (
                  <button
                    type="button"
                    onClick={triggerOpenNew}
                    className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
                    title={`Nuovo in ${archiveConfig.title || 'Archivio'}`}
                    aria-label="Aggiungi"
                  >
                    <svg
                      className="w-5 h-5 text-gray-800"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                )}
              </>
            ) : isShopping && !isSettings ? (
              /* SE SIAMO IN SHOPPING */
              <button
                type="button"
                onClick={openOmniSearch}
                className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
                title="Cerca prodotti, liste o gruppi"
                aria-label="Cerca"
              >
                <SearchIcon className="w-5 h-5 text-gray-800" />
              </button>
            ) : null}

            {/* Tasto Più (+) per Agenda & Shopping (non mostrato in impostazioni o archivio) */}
            {!isSettings && !isArchivePage && (
              <button
                type="button"
                onClick={() => setIsAddMenuOpen((prev) => !prev)}
                className={`w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center ${
                  isAddMenuOpen ? 'bg-gray-200 text-gray-900 rotate-45' : ''
                }`}
                title={isShopping ? 'Aggiungi elementi spesa' : 'Aggiungi nuovo evento o task'}
                aria-label="Aggiungi"
              >
                <svg
                  className="w-5 h-5 text-gray-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 4. TASTI DI AGGIUNTA RAPIDA STILE SPEED-DIAL */}
      {isAddMenuOpen && (
        <div className="fixed top-20 right-4 z-50 flex flex-col items-end gap-3 animate-fadeIn select-none">
          {isShopping ? (
            /* Menu Speed-Dial per SHOPPING */
            <>
              {/* Opzione 1: Prezzo rapido (senza lista) */}
              <button
                type="button"
                onClick={handleShoppingQuickPrice}
                className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-2xl border border-gray-200 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">
                  Prezzo rapido
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
                  <TagIcon className="w-4 h-4" />
                </div>
              </button>

              {/* Opzione 2: Nuovo Articolo in Lista Attiva */}
              <button
                type="button"
                onClick={handleShoppingNewItem}
                className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-2xl border border-gray-200 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-600">
                  Nuovo Articolo in Lista
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
                  <ShoppingIcon className="w-4 h-4" />
                </div>
              </button>

              {/* Opzione 3: Nuova Lista Spesa */}
              <button
                type="button"
                onClick={handleShoppingNewList}
                className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-2xl border border-gray-200 hover:bg-purple-50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-gray-700 group-hover:text-purple-600">
                  Nuova Lista Spesa
                </span>
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs shrink-0">
                  <span className="text-sm">📋</span>
                </div>
              </button>

              {/* Opzione 4: Nuovo Gruppo Condiviso */}
              <button
                type="button"
                onClick={handleShoppingNewGroup}
                className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-2xl border border-gray-200 hover:bg-amber-50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-gray-700 group-hover:text-amber-600">
                  Nuovo Gruppo Condiviso
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs shrink-0">
                  <UsersIcon className="w-4 h-4" />
                </div>
              </button>
            </>
          ) : (
            /* Menu Speed-Dial per AGENDA */
            <>
              {/* Opzione 1: Nuovo Evento */}
              <button
                type="button"
                onClick={handleNewEvent}
                className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-2xl border border-gray-200 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">
                  Nuovo Evento
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </button>

              {/* Opzione 2: Nuova Task */}
              <button
                type="button"
                onClick={handleNewTask}
                className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-2xl border border-gray-200 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-600">
                  Nuova Task
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
                  <TaskListIcon className="w-4 h-4" />
                </div>
              </button>

              {/* Opzione 3: Nuova Routine (solo DayPage / Giorno) */}
              {isDay && (
                <button
                  type="button"
                  onClick={handleNewRoutine}
                  className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-2xl border border-gray-200 hover:bg-purple-50 active:scale-95 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold text-gray-700 group-hover:text-purple-600">
                    Nuova Routine
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs shrink-0">
                    <RepeatIcon className="w-4 h-4" />
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default MobileHeader;
