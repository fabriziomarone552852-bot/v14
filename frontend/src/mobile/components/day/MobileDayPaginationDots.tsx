// src/mobile/components/day/MobileDayPaginationDots.tsx
import React from 'react';

export interface MobileDayPaginationDotsProps {
  activePageIndex: 0 | 1;
  onSelectPage: (index: 0 | 1) => void;
}

export const MobileDayPaginationDots: React.FC<MobileDayPaginationDotsProps> = ({
  activePageIndex,
  onSelectPage,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-center gap-2 py-1 select-none">
      <button
        type="button"
        onClick={() => onSelectPage(0)}
        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
          activePageIndex === 0
            ? 'w-6 bg-blue-600 shadow-xs'
            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
        }`}
        title="Pagina 1: Focus & Task"
        aria-label="Pagina 1"
      />
      <button
        type="button"
        onClick={() => onSelectPage(1)}
        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
          activePageIndex === 1
            ? 'w-6 bg-blue-600 shadow-xs'
            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
        }`}
        title="Pagina 2: Routine & Tracker"
        aria-label="Pagina 2"
      />
    </div>
  );
};

export default MobileDayPaginationDots;
