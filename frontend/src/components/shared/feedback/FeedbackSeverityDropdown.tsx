// src/components/shared/feedback/FeedbackSeverityDropdown.tsx
import React from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { SEVERITY_OPTIONS, type SeverityOption } from '@/hooks/useFeedbackFormLogic';
import type { FeedbackSeverity } from '@/types/feedback';

export interface FeedbackSeverityDropdownProps {
  severity: FeedbackSeverity;
  onSelectSeverity: (severity: FeedbackSeverity) => void;
  isOpen: boolean;
  onToggle: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  selectedOption: SeverityOption;
}

const SEVERITY_DOTS: Record<FeedbackSeverity, React.ReactNode> = {
  low: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />,
  medium: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />,
  high: <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />,
  critical: <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />,
};

export const FeedbackSeverityDropdown: React.FC<FeedbackSeverityDropdownProps> = ({
  severity,
  onSelectSeverity,
  isOpen,
  onToggle,
  dropdownRef,
  selectedOption,
}) => {
  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-gray-700 mb-1">
        Gravità
      </label>
      <div
        onClick={onToggle}
        className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-2xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          {SEVERITY_DOTS[selectedOption.severity]}
          <span className="text-gray-800 truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 mt-1 animate-fadeIn max-h-56 overflow-y-auto">
          {SEVERITY_OPTIONS.map((sev) => {
            const isSelected = severity === sev.severity;
            return (
              <div
                key={sev.severity}
                onClick={() => onSelectSeverity(sev.severity)}
                className={`px-3 py-2 sm:py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'hover:bg-gray-50 text-gray-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {SEVERITY_DOTS[sev.severity]}
                  <span className="truncate">{sev.label}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeedbackSeverityDropdown;
