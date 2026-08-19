// src/components/tags/TagCloudBoard.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { EnrichedTagItem } from '@/hooks/useTagArchiveData';
import { TagIcon } from '@/components/shared/utils/Icons';

interface TagCloudBoardProps {
  tags: EnrichedTagItem[];
  onSaveTagName: (tagId: number, newName: string) => void;
  onDoubleClick: (tag: EnrichedTagItem) => void;
  panelClass?: string;
}

// Funzione di ripartizione su griglia fissa 10x10 (100 celle)
const get10x10Span = (usage: number, totalUsages: number) => {
  const pct = totalUsages > 0 ? (usage / totalUsages) * 100 : 10;

  if (pct >= 30) {
    // ~30%+ dello spazio (es. #sport)
    return {
      spanClass: 'col-span-5 row-span-6',
      fontSize: 'text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight',
      rounded: 'rounded-2xl sm:rounded-3xl',
      border: 'border-2',
    };
  }
  if (pct >= 20) {
    // 20% - 29% (es. #lavoro)
    return {
      spanClass: 'col-span-5 row-span-4',
      fontSize: 'text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight',
      rounded: 'rounded-2xl sm:rounded-3xl',
      border: 'border-2',
    };
  }
  if (pct >= 12) {
    // 12% - 19% (es. #studio)
    return {
      spanClass: 'col-span-3 row-span-4',
      fontSize: 'text-base sm:text-lg lg:text-xl font-bold',
      rounded: 'rounded-xl sm:rounded-2xl',
      border: 'border',
    };
  }
  if (pct >= 7) {
    // 7% - 11% (es. #salute, #lettura con 4 usi)
    return {
      spanClass: 'col-span-2 row-span-4',
      fontSize: 'text-xs sm:text-sm lg:text-base font-bold',
      rounded: 'rounded-xl sm:rounded-2xl',
      border: 'border',
    };
  }
  if (pct >= 3.5) {
    // 3.5% - 6% (es. #famiglia con 2 usi)
    return {
      spanClass: 'col-span-3 row-span-2',
      fontSize: 'text-[11px] sm:text-xs lg:text-sm font-semibold',
      rounded: 'rounded-lg sm:rounded-xl',
      border: 'border',
    };
  }
  // < 3.5% (es. #finanze con 1 uso)
  return {
    spanClass: 'col-span-2 row-span-2',
    fontSize: 'text-[10px] sm:text-[11px] lg:text-xs font-semibold',
    rounded: 'rounded-lg sm:rounded-xl',
    border: 'border',
  };
};

export const TagCloudBoard: React.FC<TagCloudBoardProps> = ({
  tags,
  onSaveTagName,
  onDoubleClick,
  panelClass = '',
}) => {
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [hoveredTagId, setHoveredTagId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimerRef = useRef<Record<number, ReturnType<typeof setTimeout> | null>>({});

  // 1. Filtriamo solo i tag con utilizzo > 0 e prendiamo i TOP 25 più utilizzati
  const top25ActiveTags = useMemo(() => {
    return [...tags]
      .filter((t) => t.totalUsage > 0)
      .sort((a, b) => b.totalUsage - a.totalUsage)
      .slice(0, 25);
  }, [tags]);

  // Calcolo totale utilizzi per i Top 25
  const totalUsages = useMemo(() => {
    return top25ActiveTags.reduce((sum, t) => sum + t.totalUsage, 0);
  }, [top25ActiveTags]);

  // Disposizione randomica a puzzle per distribuire grandi e piccoli
  const puzzleTags = useMemo(() => {
    return [...top25ActiveTags].sort((a, b) => {
      return (b.totalUsage % 2) - (a.totalUsage % 2) || a.name.localeCompare(b.name);
    });
  }, [top25ActiveTags]);

  useEffect(() => {
    if (editingTagId !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTagId]);

  const handleTagClick = (tag: EnrichedTagItem) => {
    if (editingTagId === tag.id) return;

    const tagId = tag.id;
    if (clickTimerRef.current[tagId]) {
      // Secondo click rapido -> Doppio click (apre modale review)
      clearTimeout(clickTimerRef.current[tagId]!);
      clickTimerRef.current[tagId] = null;
      onDoubleClick(tag);
    } else {
      // Primo click -> Attesa 250ms per modifica inline
      clickTimerRef.current[tagId] = setTimeout(() => {
        clickTimerRef.current[tagId] = null;
        setEditingTagId(tag.id);
        setEditText(tag.name);
      }, 250);
    }
  };

  const handleFinishEdit = (tagId: number) => {
    const trimmed = editText.trim().replace(/^#/, '');
    if (trimmed) {
      onSaveTagName(tagId, trimmed);
    }
    setEditingTagId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tagId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFinishEdit(tagId);
    } else if (e.key === 'Escape') {
      setEditingTagId(null);
    }
  };

  return (
    <main className={`${panelClass} flex-1 min-h-0 p-4 sm:p-5 flex flex-col justify-between overflow-hidden relative z-10`}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Intestazione Bacheca */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
              <TagIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                Frequenza dei Tag
              </h2>
            </div>
          </div>
        </div>

        {/* Griglia 10x10 Fissa */}
        <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
          {puzzleTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-400">
              <div className="p-3.5 bg-slate-100 rounded-2xl mb-2">
                <TagIcon className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">Nessun tag utilizzato</p>
              <p className="text-xs text-slate-500 mt-0.5">
                I tag compariranno qui non appena verranno assegnati ad almeno una revisione.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-10 [grid-template-rows:repeat(10,minmax(0,1fr))] gap-2 sm:gap-2.5 h-full w-full grid-flow-dense">
              {puzzleTags.map((tag) => {
                const isEditing = editingTagId === tag.id;
                const isHovered = hoveredTagId === tag.id;
                const tagColor = tag.color || '#8B5CF6';
                const styleProps = get10x10Span(tag.totalUsage, totalUsages);

                return (
                  <div
                    key={tag.id}
                    onClick={() => handleTagClick(tag)}
                    onMouseEnter={() => setHoveredTagId(tag.id)}
                    onMouseLeave={() => setHoveredTagId(null)}
                    className={`group relative flex items-center justify-center p-2 transition-all duration-200 cursor-pointer select-none text-center h-full w-full active:scale-[0.98] ${styleProps.spanClass} ${styleProps.rounded} ${styleProps.border}`}
                    style={{
                      backgroundColor: isHovered ? `${tagColor}28` : `${tagColor}12`,
                      borderColor: isHovered ? tagColor : `${tagColor}35`,
                      color: tagColor,
                      boxShadow: isHovered ? `inset 0 0 0 1px ${tagColor}40` : 'none',
                    }}
                    title={`#${tag.name} (${tag.totalUsage} utilizzi) • Click: modifica nome • Doppio click: vedi review`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-purple-500 shadow-md">
                        <span className="font-bold text-slate-400 text-xs">#</span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={() => handleFinishEdit(tag.id)}
                          onKeyDown={(e) => handleKeyDown(e, tag.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none w-20 sm:w-24 text-center"
                        />
                      </div>
                    ) : (
                      <span
                        className={`truncate leading-tight px-1 transition-transform duration-200 ${
                          isHovered ? 'scale-105 font-black' : ''
                        } ${styleProps.fontSize}`}
                      >
                        #{tag.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default TagCloudBoard;
