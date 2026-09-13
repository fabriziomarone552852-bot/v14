// src/mobile/components/chips/MobileGoalChipInput.tsx
import React from 'react';

interface MobileGoalChipInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder: string;
}

export const MobileGoalChipInput: React.FC<MobileGoalChipInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
}) => {
  return (
    <div className="flex items-center justify-center px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-100/70 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white focus-within:border-blue-300 transition-all w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder={placeholder}
        className="w-full text-center bg-transparent border-none p-0 text-xs font-semibold text-gray-900 placeholder:text-blue-600/70 placeholder:italic focus:ring-0 focus:outline-none"
      />
    </div>
  );
};

export default MobileGoalChipInput;
