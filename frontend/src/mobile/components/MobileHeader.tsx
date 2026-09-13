// src/mobile/components/MobileHeader.tsx
import React from 'react';
import {
  MenuBarsIcon,
  BackIcon,
} from '@/components/shared/utils/Icons';
import { useMobileHeaderLogic, DEFAULT_ARCHIVE_TITLES } from '../hooks/useMobileHeaderLogic';
import MobileSelectionHeader from './MobileSelectionHeader';
import { MobileHeaderPeriodSwitcher } from './header/MobileHeaderPeriodSwitcher';
import { MobileHeaderRightActions } from './header/MobileHeaderRightActions';
import { MobileHeaderSpeedDial } from './header/MobileHeaderSpeedDial';

interface MobileHeaderProps {
  onOpenDrawer: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenDrawer,
}) => {
  const {
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
  } = useMobileHeaderLogic();

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-gray-900 shadow-xs pt-[env(safe-area-inset-top,0px)] border-b border-gray-200">
        {isSelectionActive ? (
          <MobileSelectionHeader
            selectedCount={selectedCount}
            isAllSelected={isAllSelected}
            onClearSelection={clearSelection}
            onToggleSelectAll={toggleSelectAll}
            onDelete={
              selectionState.onDelete
                ? () => selectionState.onDelete!(selectionState.selectedIds)
                : undefined
            }
            onArchive={
              selectionState.onArchive
                ? () => selectionState.onArchive!(selectionState.selectedIds)
                : undefined
            }
          />
        ) : (
          <div className="px-3 h-14 flex items-center justify-between gap-2 max-w-lg mx-auto relative">
            {/* 1. SINISTRA: Back Arrow o Hamburger Menu */}
            <div className="flex items-center shrink-0 z-10">
              {isArchivePage || isSettingsSubpage ? (
                <button
                  type="button"
                  onClick={handleHeaderBack}
                  className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
                  aria-label={isArchivePage ? "Torna all'archivio" : "Torna alle impostazioni"}
                  title={isArchivePage ? "Torna all'archivio" : "Torna alle impostazioni"}
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

            {/* 2. CENTRO: Titolo Archivio o Switcher Viste Agenda */}
            {isArchivePage ? (
              <>
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
              <MobileHeaderPeriodSwitcher
                isDay={isDay}
                isWeek={isWeek}
                isMonth={isMonth}
                isYear={isYear}
              />
            )}

            {/* 3. DESTRA: Azioni contestuali & Tasto Speed Dial (+) */}
            <MobileHeaderRightActions
              isArchivePage={isArchivePage}
              isShopping={isShopping}
              isSettings={isSettings}
              archiveConfig={archiveConfig}
              triggerOpenSearch={triggerOpenSearch}
              triggerOpenNew={triggerOpenNew}
              openOmniSearch={openOmniSearch}
              isAddMenuOpen={isAddMenuOpen}
              onToggleAddMenu={() => setIsAddMenuOpen((prev) => !prev)}
            />
          </div>
        )}
      </header>

      {/* 4. Menu Fluttuante Speed-Dial */}
      <MobileHeaderSpeedDial
        isOpen={!isSettings && !isArchivePage && isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        isShopping={isShopping}
        isDay={isDay}
        onShoppingQuickPrice={handleShoppingQuickPrice}
        onShoppingNewItem={handleShoppingNewItem}
        onShoppingNewList={handleShoppingNewList}
        onShoppingNewGroup={handleShoppingNewGroup}
        onNewEvent={handleNewEvent}
        onNewTask={handleNewTask}
        onNewRoutine={handleNewRoutine}
      />
    </>
  );
};

export default MobileHeader;
