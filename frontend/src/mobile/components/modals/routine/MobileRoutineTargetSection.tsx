// src/mobile/components/modals/routine/MobileRoutineTargetSection.tsx
import React from 'react';

interface MobileRoutineTargetSectionProps {
  piuVolte: boolean;
  onPiuVolteChange: (checked: boolean) => void;
  targetCompletamenti: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const MobileRoutineTargetSection: React.FC<MobileRoutineTargetSectionProps> = ({
  piuVolte,
  onPiuVolteChange,
  targetCompletamenti,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="mobileRoutineMultiToggle"
          checked={piuVolte}
          onChange={(e) => onPiuVolteChange(e.target.checked)}
          className="w-4.5 h-4.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
        />
        <label
          htmlFor="mobileRoutineMultiToggle"
          className="text-xs sm:text-sm font-bold text-gray-800 cursor-pointer select-none"
        >
          Da completare più volte al giorno
        </label>
      </div>

      {piuVolte && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/60 animate-fadeIn">
          <span className="text-xs sm:text-sm font-semibold text-gray-600">
            Target al giorno:
          </span>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={onDecrement}
              className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 hover:text-red-500 font-black transition-colors cursor-pointer text-base select-none"
            >
              -
            </button>
            <span className="px-3 py-2 font-extrabold text-sm text-gray-900 border-x border-gray-100 min-w-[2.5rem] text-center">
              {targetCompletamenti}
            </span>
            <button
              type="button"
              onClick={onIncrement}
              className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 hover:text-green-600 font-black transition-colors cursor-pointer text-base select-none"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileRoutineTargetSection;
