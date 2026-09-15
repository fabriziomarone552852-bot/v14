// src/components/shared/feedback/FeedbackSuccessView.tsx
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const FeedbackSuccessView: React.FC = () => {
  return (
    <div className="py-6 text-center space-y-4 select-none">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl border border-emerald-200 shadow-xs">
        <CheckCircle2 className="w-9 h-9" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-extrabold text-gray-800">Grazie per la tua segnalazione!</h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          I dati sono stati inviati e memorizzati con successo. Verranno esaminati dagli amministratori.
        </p>
      </div>
    </div>
  );
};

export default FeedbackSuccessView;
