// src/components/archive/common/ArchiveFilterSegmentedGroup.tsx
import type { ReactNode } from 'react';

export interface FilterSegmentOption<T extends string | number> {
  value: T;
  label: ReactNode;
  activeClass?: string;
}

export interface ArchiveFilterSegmentedGroupProps<T extends string | number> {
  label: string;
  options: FilterSegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  gridColsClass?: string;
}

export function ArchiveFilterSegmentedGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  gridColsClass = 'grid-cols-3',
}: ArchiveFilterSegmentedGroupProps<T>) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>
      <div className={`grid ${gridColsClass} gap-1.5`}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const activeStyle =
            opt.activeClass ||
            'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs';
          const inactiveStyle =
            'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-medium';

          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`py-2 px-2 border rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSelected ? activeStyle : inactiveStyle
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
