// src/components/shared/feedback/FeedbackTypeDropdown.tsx
import React from 'react';
import {
  Bug,
  Layout,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { TYPE_OPTIONS, type TypeOption } from '@/hooks/useFeedbackFormLogic';
import type { FeedbackType } from '@/types/feedback';

export interface FeedbackTypeDropdownProps {
  reportType: FeedbackType;
  onSelectType: (type: FeedbackType) => void;
  isOpen: boolean;
  onToggle: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  selectedOption: TypeOption;
}

const TYPE_ICONS: Record<FeedbackType, React.ReactNode> = {
  bug: <Bug className="w-4 h-4 text-rose-600 shrink-0" />,
  visual: <Layout className="w-4 h-4 text-purple-600 shrink-0" />,
  feature_request: <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />,
  other: <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />,
};

export const FeedbackTypeDropdown: React.FC<FeedbackTypeDropdownProps> = ({
  reportType,
  onSelectType,
  isOpen,
  onToggle,
  dropdownRef,
  selectedOption,
}) => {
  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-gray-700 mb-1">
        Tipologia
      </label>
      <div
        onClick={onToggle}
        className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-2xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          {TYPE_ICONS[selectedOption.type]}
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
          {TYPE_OPTIONS.map((opt) => {
            const isSelected = reportType === opt.type;
            return (
              <div
                key={opt.type}
                onClick={() => onSelectType(opt.type)}
                className={`px-3 py-2 sm:py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'hover:bg-gray-50 text-gray-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {TYPE_ICONS[opt.type]}
                  <span className="truncate">{opt.label}</span>
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

export default FeedbackTypeDropdown;
