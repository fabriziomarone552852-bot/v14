// src/mobile/components/MobileFAB.tsx
import React, { useState } from 'react';
import { PlusIcon, CalendarIcon, TaskListIcon } from '@/components/shared/utils/Icons';

interface MobileFABProps {
  onAddEvent: () => void;
  onAddTask: () => void;
}

export const MobileFAB: React.FC<MobileFABProps> = ({ onAddEvent, onAddTask }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenEvent = () => {
    setIsOpen(false);
    onAddEvent();
  };

  const handleOpenTask = () => {
    setIsOpen(false);
    onAddTask();
  };

  return (
    <>
      {/* Backdrop for closing speed dial */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-2xs transition-opacity animate-fadeIn"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3">
        {/* Speed-dial options */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-1 animate-fadeIn">
            
            {/* Opzione 1: Nuovo Evento */}
            <button
              onClick={handleOpenEvent}
              className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-blue-50 active:scale-95 transition-all group"
            >
              <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">
                Nuovo Evento
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                <CalendarIcon className="w-4 h-4" />
              </div>
            </button>

            {/* Opzione 2: Nuova Task */}
            <button
              onClick={handleOpenTask}
              className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-emerald-50 active:scale-95 transition-all group"
            >
              <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-600">
                Nuova Task
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <TaskListIcon className="w-4 h-4" />
              </div>
            </button>

          </div>
        )}

        {/* Main Floating Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 focus:outline-none cursor-pointer ${
            isOpen
              ? 'bg-gray-800 text-white rotate-45 scale-105'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-600/30'
          }`}
          aria-label={isOpen ? "Chiudi menu aggiungi" : "Aggiungi nuovo evento o task"}
          title="Aggiungi"
        >
          <PlusIcon className="w-7 h-7" />
        </button>
      </div>
    </>
  );
};

export default MobileFAB;
