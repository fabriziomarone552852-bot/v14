// frontend/src/components/weekmonth/review/ReviewTagBar.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Category } from '@/types/categories';

interface ReviewTagBarProps {
  /** Tag attualmente associati a questo mese (category objects) */
  assignedTags: Category[];
  /** Tutte le categorie TAG (genre=5) dell'utente */
  allTags: Category[];
  onAddTag: (categoryId: number) => void;
  onCreateAndAddTag: (tagName: string) => void;
  onRemoveTag: (monthlyEntryId: number) => void;
  /** Mappa tagCategoryId -> monthlyEntryId per la rimozione */
  tagEntryMap: Record<number, number>;
}

export const ReviewTagBar: React.FC<ReviewTagBarProps> = ({
  assignedTags, allTags, onAddTag, onCreateAndAddTag, onRemoveTag, tagEntryMap,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  useEffect(() => {
    if (!isAdding) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAdding(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdding]);

  const assignedIds = useMemo(() => new Set(assignedTags.map(t => t.id)), [assignedTags]);

  // Suggerimenti: solo tag (genre=5) non ancora assegnati
  const suggestions = useMemo(() => {
    const available = allTags.filter(t => !assignedIds.has(t.id));
    if (!search.trim()) return available;
    const q = search.toLowerCase().trim();
    return available.filter(t => t.category_name.toLowerCase().includes(q));
  }, [search, allTags, assignedIds]);

  const handleSelect = (tagId: number) => {
    onAddTag(tagId);
    setSearch('');
    setIsAdding(false);
  };

  const handleCreateNew = () => {
    const name = search.trim();
    if (!name) return;
    onCreateAndAddTag(name);
    setSearch('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelect(suggestions[0].id);
      } else if (search.trim()) {
        handleCreateNew();
      }
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setSearch('');
    }
  };

  // Il nome esiste già in qualsiasi categoria?
  const nameAlreadyExists = useMemo(() => {
    if (!search.trim()) return false;
    return allTags.some(t => t.category_name.toLowerCase() === search.toLowerCase().trim());
  }, [search, allTags]);

  return (
    <div className="flex items-center gap-2 flex-wrap px-1 py-2 min-h-[40px]">
      {assignedTags.map(tag => {
        const entryId = tagEntryMap[tag.id];
        return (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all hover:bg-indigo-200"
          >
            #{tag.category_name}
            {entryId && (
              <button
                onClick={() => onRemoveTag(entryId)}
                className="ml-0.5 text-indigo-400 hover:text-red-500 transition-colors focus:outline-none"
                title="Rimuovi tag"
              >
                ×
              </button>
            )}
          </span>
        );
      })}

      {isAdding ? (
        <div ref={dropdownRef} className="relative">
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cerca o crea tag..."
            className="text-xs px-3 py-1.5 rounded-full border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none w-40"
          />
          {(suggestions.length > 0 || search.trim()) && (
            <div className="absolute bottom-full left-0 mb-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 max-h-40 overflow-y-auto z-50">
              {suggestions.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleSelect(tag.id)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 transition-colors text-gray-700 font-medium"
                >
                  #{tag.category_name}
                </button>
              ))}
              {search.trim() && !nameAlreadyExists && (
                <button
                  onClick={handleCreateNew}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-green-50 transition-colors text-green-700 font-bold border-t border-gray-100"
                >
                  + Crea &quot;#{search.trim()}&quot;
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-dashed border-gray-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all"
        >
          + Tag
        </button>
      )}
    </div>
  );
};
