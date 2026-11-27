import React, { useMemo, useRef, type RefObject } from 'react';
import type { MediaList } from '@/types/trackers';
import { useListsBarOverflow } from './useListsBarOverflow';

export interface TrackerDetailListsBarProps {
  lists: MediaList[];
  onOpenManager: () => void;
  onOpenDrawer: (listId?: number) => void;
  posterRef?: RefObject<HTMLElement | null>;
  headerRef?: RefObject<HTMLElement | null>;
}

export const TrackerDetailListsBar: React.FC<TrackerDetailListsBarProps> = ({
  lists,
  onOpenManager,
  onOpenDrawer,
  posterRef,
  headerRef,
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const listsSignature = useMemo(
    () => lists.map((list) => `${list.id}:${list.name}`).join('|'),
    [lists]
  );

  const isCollapsed = useListsBarOverflow({
    anchorRef,
    contentRef,
    posterRef,
    headerRef,
    listsCount: lists.length,
    listsSignature,
  });

  return (
    <div ref={anchorRef} className="relative flex items-center justify-end h-8">
      {/* Riga completa delle liste: sempre presente per misurare in tempo reale la larghezza reale
          senza sfarfallii; quando collassata viene resa invisibile e fuori dal flusso layout. */}
      <div
        ref={contentRef}
        aria-hidden={isCollapsed}
        className={
          isCollapsed
            ? 'absolute right-0 top-0 invisible pointer-events-none flex flex-row-reverse items-center gap-1.5 w-max whitespace-nowrap'
            : 'flex flex-row-reverse items-center gap-1.5 w-max whitespace-nowrap'
        }
      >
        <button
          type="button"
          onClick={onOpenManager}
          tabIndex={isCollapsed ? -1 : undefined}
          className="shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg hover:bg-white/40 transition-colors cursor-pointer"
          title="Aggiungi ad una Lista"
          aria-label="Aggiungi ad una Lista"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {lists.map((list) => (
          <span
            key={list.id}
            className="shrink-0 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-md border border-white/30 shadow-lg flex items-center gap-1 cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => onOpenDrawer(list.id)}
            title={`Vedi lista: ${list.name}`}
          >
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            {list.name}
          </span>
        ))}
      </div>

      {isCollapsed && (
        <button
          type="button"
          onClick={() => onOpenDrawer()}
          className="shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg hover:bg-white/40 transition-colors cursor-pointer"
          title={`Vedi tutte le liste (${lists.length})`}
          aria-label={`Vedi tutte le liste (${lists.length})`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
};
