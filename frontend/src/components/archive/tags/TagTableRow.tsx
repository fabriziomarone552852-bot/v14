// src/components/archive/tags/TagTableRow.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { EnrichedTagItem } from '@/hooks/useTagArchiveData';

interface TagTableRowProps {
  tag: EnrichedTagItem;
  onSaveTagName: (tagId: number, newName: string) => void;
  onDoubleClick: (tag: EnrichedTagItem) => void;
}

export const TagTableRow: React.FC<TagTableRowProps> = ({
  tag,
  onSaveTagName,
  onDoubleClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRowClick = () => {
    if (isEditing) return;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      onDoubleClick(tag);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        setIsEditing(true);
        setEditText(tag.name);
      }, 250);
    }
  };

  const handleFinishEdit = () => {
    const trimmed = editText.trim().replace(/^#/, '');
    if (trimmed) {
      onSaveTagName(tag.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const tagColor = tag.color || '#8B5CF6';

  return (
    <div
      onClick={handleRowClick}
      className="grid grid-cols-[1fr_48px_56px_56px] sm:grid-cols-[1fr_110px_130px_130px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer group select-none"
    >
      {/* 1. Tag Nome con Chip e Colore + Modifica Inline */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 pl-1">
        <div
          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
          style={{ backgroundColor: tagColor }}
        />
        {isEditing ? (
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-slate-500">#</span>
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="bg-white px-2 py-0.5 rounded-lg border border-purple-500 text-slate-900 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-32 sm:w-40"
            />
          </div>
        ) : (
          <span
            className="font-bold text-xs sm:text-sm truncate px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border text-slate-800 group-hover:text-slate-950 transition-colors"
            style={{
              backgroundColor: `${tagColor}10`,
              borderColor: `${tagColor}30`,
            }}
          >
            #{tag.name}
          </span>
        )}
      </div>

      {/* 2. Utilizzo Totale */}
      <div className="w-12 sm:w-[110px] flex justify-center items-center min-w-0">
        <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-extrabold rounded-md sm:rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 min-w-[28px] sm:min-w-[36px] text-center">
          {tag.totalUsage}
        </span>
      </div>

      {/* 3. Review Mensili */}
      <div className="w-14 sm:w-[130px] flex justify-center items-center min-w-0">
        <span className="hidden sm:inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 min-w-[36px] text-center">
          {tag.monthlyCount} {tag.monthlyCount === 1 ? 'mese' : 'mesi'}
        </span>
        <span className="sm:hidden px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 min-w-[28px] text-center">
          {tag.monthlyCount}
        </span>
      </div>

      {/* 4. Review Annuali */}
      <div className="w-14 sm:w-[130px] flex justify-center items-center min-w-0">
        <span className="hidden sm:inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60 min-w-[36px] text-center">
          {tag.yearlyCount} {tag.yearlyCount === 1 ? 'anno' : 'anni'}
        </span>
        <span className="sm:hidden px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 min-w-[28px] text-center">
          {tag.yearlyCount}
        </span>
      </div>
    </div>
  );
};

export default TagTableRow;
