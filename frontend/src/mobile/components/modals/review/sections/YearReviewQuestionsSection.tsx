// src/mobile/components/modals/review/sections/YearReviewQuestionsSection.tsx
import React from 'react';
import { YEAR_REVIEW_QUESTIONS } from '../yearReview.utils';
import { AutoExpandingReviewTextarea } from '../shared/AutoExpandingReviewTextarea';
import type { DbYearlyEntry, YearlyType } from '@/types/yearlyentries';

export interface YearReviewQuestionsSectionProps {
  entries: DbYearlyEntry[];
  onSaveAnswer: (code: YearlyType, text: string, existingId?: number) => void;
}

export const YearReviewQuestionsSection: React.FC<YearReviewQuestionsSectionProps> = ({
  entries,
  onSaveAnswer,
}) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4">
      {YEAR_REVIEW_QUESTIONS.map(({ code, text }) => {
        const existing = entries.find((e) => e.yearly_type === code);
        const currentText = existing?.yearly_field ?? '';
        const existingId = existing?.id;

        return (
          <div
            key={code}
            className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3 flex flex-col gap-2 shadow-2xs"
          >
            <p className="text-xs sm:text-sm font-bold text-gray-800 whitespace-pre-line leading-relaxed">
              {text}
            </p>

            <AutoExpandingReviewTextarea
              key={`${code}-${existingId || 'empty'}`}
              initialValue={currentText}
              onSave={(val) => onSaveAnswer(code, val, existingId)}
            />
          </div>
        );
      })}
    </div>
  );
};
