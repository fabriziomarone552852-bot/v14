// src/mobile/components/shopping/picker/PersonalSectionHeader.tsx
import React from 'react';
import { ChevronDownIcon } from '@/components/shared/utils/Icons';

export interface PersonalSectionHeaderProps {
  listsCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const PersonalSectionHeader: React.FC<PersonalSectionHeaderProps> = ({
  listsCount,
  isExpanded,
  onToggle,
}) => {
  return (
    <div
      onClick={onToggle}
      className="flex items-center justify-between gap-2 p-3 bg-gray-50 hover:bg-gray-100/80 transition-colors cursor-pointer select-none"
    >
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs">
          👤
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold text-gray-900 truncate">
            Private
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {listsCount} {listsCount === 1 ? 'lista' : 'liste'}
          </p>
        </div>
      </div>

      <div
        className={`p-1.5 text-gray-400 hover:text-blue-600 transition-transform duration-200 shrink-0 ${
          isExpanded ? 'rotate-180 text-blue-600' : ''
        }`}
      >
        <ChevronDownIcon className="w-5 h-5" />
      </div>
    </div>
  );
};
