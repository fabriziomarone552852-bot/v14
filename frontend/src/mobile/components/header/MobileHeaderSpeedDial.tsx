// src/mobile/components/header/MobileHeaderSpeedDial.tsx
import React from 'react';
import {
  CalendarIcon,
  TaskListIcon,
  RepeatIcon,
  ShoppingIcon,
  TagIcon,
  UsersIcon,
} from '@/components/shared/utils/Icons';

interface MobileHeaderSpeedDialProps {
  isOpen: boolean;
  onClose: () => void;
  isShopping: boolean;
  isDay: boolean;
  onShoppingQuickPrice: () => void;
  onShoppingNewItem: () => void;
  onShoppingNewList: () => void;
  onShoppingNewGroup: () => void;
  onNewEvent: () => void;
  onNewTask: () => void;
  onNewRoutine: () => void;
}

export const MobileHeaderSpeedDial: React.FC<MobileHeaderSpeedDialProps> = ({
  isOpen,
  onClose,
  isShopping,
  isDay,
  onShoppingQuickPrice,
  onShoppingNewItem,
  onShoppingNewList,
  onShoppingNewGroup,
  onNewEvent,
  onNewTask,
  onNewRoutine,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop oscurato */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pulsanti Fluttuanti Speed-Dial */}
      <div className="fixed top-20 right-4 z-50 flex flex-col items-end gap-3 animate-fadeIn select-none">
        {isShopping ? (
          /* Menu Speed-Dial per SHOPPING */
          <>
            {/* Opzione 1: Prezzo rapido */}
            <button
              type="button"
              onClick={onShoppingQuickPrice}
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
              onClick={onShoppingNewItem}
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
              onClick={onShoppingNewList}
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
              onClick={onShoppingNewGroup}
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
              onClick={onNewEvent}
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
              onClick={onNewTask}
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
                onClick={onNewRoutine}
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
    </>
  );
};

export default MobileHeaderSpeedDial;
