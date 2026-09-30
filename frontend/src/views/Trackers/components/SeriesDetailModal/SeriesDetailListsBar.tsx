import React, { useRef } from 'react';
import { useResizeObserver } from '@/hooks/useResizeObserver';

interface SeriesDetailListsBarProps {
  lists: any[];
  onOpenManager: () => void;
  onOpenDrawer: (listId?: number) => void;
}

export const SeriesDetailListsBar: React.FC<SeriesDetailListsBarProps> = ({ lists, onOpenManager, onOpenDrawer }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollWidth, clientWidth } = useResizeObserver(containerRef, 50);

  const isTruncated = scrollWidth > clientWidth + 2;

  return (
    <div className="flex-1 min-w-0 flex items-center flex-row-reverse gap-1.5 justify-start">
      {/* Container di misurazione: sempre presente, overflow-hidden */}
      <div 
        ref={containerRef} 
        className="flex-1 flex flex-row-reverse items-center gap-1.5 overflow-hidden justify-start relative"
      >
        {/* We ALWAYS render the items so scrollWidth is stable.
            If truncated, we make them invisible so they don't overlap the absolute button. */}
        <div className={`flex flex-row-reverse items-center gap-1.5 min-w-max transition-opacity duration-200 ${isTruncated ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button
               onClick={onOpenManager}
               className="shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg hover:bg-white/40 transition-colors"
               title="Aggiungi ad una Lista"
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
               </svg>
            </button>
            {lists.map(list => (
              <span 
                key={list.id} 
                className="shrink-0 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-md border border-white/30 shadow-lg flex items-center gap-1 cursor-pointer hover:bg-white/30 transition-colors" 
                onClick={() => onOpenDrawer(list.id)}
                title="Vedi lista"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {list.name}
              </span>
            ))}
        </div>

        {isTruncated && (
          <button
            onClick={() => onOpenDrawer()}
            className="absolute right-0 shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg hover:bg-white/40 transition-colors"
            title="Vedi tutte le liste"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
