// src/mobile/hooks/useMobileHeaderLogic.ts
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEventModals } from '@/context/EventModalContext';
import { useTaskModals } from '@/context/TaskModalContext';
import { useRoutineModals } from '@/context/RoutineModalContext';
import { useShoppingModals } from '@/context/ShoppingModalContext';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import { formatDateString } from '@/utils/dateUtils';
import { useBackHandler } from '@/utils/backButtonManager';
import { useMobileSelection } from '../context/MobileSelectionContext';

export const DEFAULT_ARCHIVE_TITLES: Record<string, string> = {
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

export const useMobileHeaderLogic = () => {
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

  // Selezione Multipla globale
  const {
    state: selectionState,
    isSelectionActive,
    selectedCount,
    isAllSelected,
    clearSelection,
    toggleSelectAll,
  } = useMobileSelection();

  // Chiudi selezione con tasto Back hardware prioritario
  useBackHandler(
    isSelectionActive,
    () => {
      clearSelection();
      return true;
    },
    25
  );

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

  // Chiudi speed dial con tasto Back hardware
  useBackHandler(
    isAddMenuOpen,
    () => {
      setIsAddMenuOpen(false);
      return true;
    },
    20
  );

  const isDay = path === '/giorno';
  const isWeek = path === '/settimana';
  const isMonth = path === '/mese';
  const isYear = path === '/anno';
  const isShopping = path === '/shopping';
  const isSettings = path.startsWith('/settings') || path === '/archivio' || path === '/admin';
  const isSettingsSubpage =
    path.startsWith('/settings/') || path === '/archivio' || path === '/admin';
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

  const handleHeaderBack = () => {
    if (isArchivePage) {
      if (archiveConfig.hasBack) {
        triggerBack();
      } else {
        navigate('/settings/archive');
      }
    } else if (isSettingsSubpage) {
      navigate('/settings');
    }
  };

  return {
    path,
    isDay,
    isWeek,
    isMonth,
    isYear,
    isShopping,
    isSettings,
    isSettingsSubpage,
    isArchivePage,
    archiveConfig,
    triggerOpenSearch,
    triggerOpenNew,
    selectionState,
    isSelectionActive,
    selectedCount,
    isAllSelected,
    clearSelection,
    toggleSelectAll,
    openOmniSearch,
    isAddMenuOpen,
    setIsAddMenuOpen,
    handleNewEvent,
    handleNewTask,
    handleNewRoutine,
    handleShoppingQuickPrice,
    handleShoppingNewItem,
    handleShoppingNewList,
    handleShoppingNewGroup,
    handleHeaderBack,
  };
};

export default useMobileHeaderLogic;
