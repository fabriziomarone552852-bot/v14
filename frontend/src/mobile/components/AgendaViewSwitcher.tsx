// src/mobile/components/AgendaViewSwitcher.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, CalendarRange, Grid3X3, Layers } from 'lucide-react';

export const AgendaViewSwitcher: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine current active agenda subview
  const isDay = path === '/giorno';
  const isWeek = path === '/settimana';
  const isMonth = path === '/mese';
  const isYear = path === '/anno';

  return (
    <div className="bg-white/95 backdrop-blur-sm px-3 py-2 border-b border-gray-200 sticky top-[57px] z-20 shadow-xs">
      <div className="flex items-center justify-between bg-gray-100 p-1 rounded-xl border border-gray-200/80 gap-1">
        
        {/* GIORNO */}
        <Link
          to="/giorno"
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            isDay
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Giorno</span>
        </Link>

        {/* SETTIMANA */}
        <Link
          to="/settimana"
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            isWeek
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span>Settimana</span>
        </Link>

        {/* MESE */}
        <Link
          to="/mese"
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            isMonth
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>Mese</span>
        </Link>

        {/* ANNO */}
        <Link
          to="/anno"
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            isYear
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Anno</span>
        </Link>

      </div>
    </div>
  );
};

export default AgendaViewSwitcher;
