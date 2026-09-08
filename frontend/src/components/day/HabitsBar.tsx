// src/components/day/HabitsBar.tsx
import React from 'react';
import { PlusIcon } from '@/components/shared/utils/Icons';

export interface HabitItem {
  id: number;
  title: string;
  icon: string;
  done: boolean;
}

interface HabitsBarProps {
  habits: HabitItem[];
  onToggleHabit: (id: number) => void;
  onAddHabitClick: () => void;
}

const HabitsBar: React.FC<HabitsBarProps> = ({ habits, onToggleHabit, onAddHabitClick }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 select-none">
      <div className="flex items-center gap-2.5 w-max min-w-full justify-center px-2">
        {habits.map((h) => (
          <button 
            key={h.id} 
            title={h.title}
            type="button"
            onClick={() => onToggleHabit(h.id)}
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer ${
              h.done 
                ? 'bg-blue-100 border-2 border-blue-500 shadow-blue-500/10' 
                : 'bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {h.icon}
          </button>
        ))}

        <button 
          type="button"
          onClick={onAddHabitClick}
          title="Nuova Abitudine"
          className="w-10 h-10 shrink-0 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 hover:scale-105 active:scale-95 active:bg-blue-100 transition-all flex justify-center items-center focus:outline-none cursor-pointer shadow-2xs bg-white/80"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HabitsBar;