// src/components/shared/feedback/FeedbackTelemetryField.tsx
import React from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export interface FeedbackTelemetryFieldProps {
  includeTelemetry: boolean;
  onToggleInclude: (included: boolean) => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  diagnosticText: string;
}

export const FeedbackTelemetryField: React.FC<FeedbackTelemetryFieldProps> = ({
  includeTelemetry,
  onToggleInclude,
  showDetails,
  onToggleDetails,
  diagnosticText,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-2.5 sm:p-3 space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeTelemetry}
            onChange={(e) => onToggleInclude(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Includi diagnostica automatica</span>
        </label>

        <button
          type="button"
          onClick={onToggleDetails}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <span>{showDetails ? 'Nascondi' : 'Dettagli'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showDetails && (
        <div className="pt-2 border-t border-gray-200 animate-fadeIn">
          <pre className="text-[10px] bg-slate-900 text-slate-200 p-2.5 rounded-xl overflow-x-auto font-mono max-h-36 custom-scrollbar">
            {diagnosticText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FeedbackTelemetryField;
