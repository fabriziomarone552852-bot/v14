// src/mobile/components/modals/review/shared/MobileReviewTagBar.tsx
import React, { useState, useMemo } from 'react';
import type { Category } from '@/types/categories';
import { MobileReviewTagInput } from './MobileReviewTagInput';

export interface MobileReviewTagBarProps {
  assignedTags?: Category[];
  allTags?: Category[];
  tagEntryMap?: Record<number, number>;
  onAddTag?: (categoryId: number) => void;
  onCreateAndAddTag?: (tagName: string) => void;
  onRemoveTag?: (yearlyEntryId: number) => void;
}

/** Barra dei Tag Orizzontale Scrollabile per Mobile */
export const MobileReviewTagBar: React.FC<MobileReviewTagBarProps> = ({
  assignedTags = [],
  allTags = [],
  tagEntryMap = {},
  onAddTag,
  onCreateAndAddTag,
  onRemoveTag,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  const assignedIds = useMemo(() => new Set(assignedTags.map((t) => t.id)), [assignedTags]);

  const suggestions = useMemo(() => {
    const available = allTags.filter((t) => !assignedIds.has(t.id));
    if (!search.trim()) return available;
    const q = search.toLowerCase().trim();
    return available.filter((t) => t.category_name.toLowerCase().includes(q));
  }, [search, allTags, assignedIds]);

  const nameAlreadyExists = useMemo(() => {
    if (!search.trim()) return false;
    return allTags.some((t) => t.category_name.toLowerCase() === search.toLowerCase().trim());
  }, [search, allTags]);

  const handleSelect = (tagId: number) => {
    onAddTag?.(tagId);
    setSearch('');
    setIsAdding(false);
  };

  const handleCreateNew = () => {
    const name = search.trim();
    if (!name) return;
    onCreateAndAddTag?.(name);
    setSearch('');
    setIsAdding(false);
  };

  if (!onAddTag || !onRemoveTag) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap py-2 px-3 bg-gray-50 border-t border-gray-200 shrink-0 relative z-30 overflow-visible">
      {assignedTags.map((tag) => {
        const entryId = tagEntryMap[tag.id];
        return (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0 shadow-2xs"
          >
            #{tag.category_name}
            {entryId && (
              <button
                type="button"
                onClick={() => onRemoveTag(entryId)}
                className="ml-0.5 text-indigo-400 hover:text-red-500 font-black focus:outline-none cursor-pointer"
                title="Rimuovi tag"
              >
                ×
              </button>
            )}
          </span>
        );
      })}

      {isAdding ? (
        <MobileReviewTagInput
          search={search}
          onSearchChange={setSearch}
          suggestions={suggestions}
          nameAlreadyExists={nameAlreadyExists}
          onSelectTag={handleSelect}
          onCreateTag={handleCreateNew}
          onClose={() => {
            setIsAdding(false);
            setSearch('');
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-gray-600 border border-dashed border-gray-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          + Tag
        </button>
      )}
    </div>
  );
};
