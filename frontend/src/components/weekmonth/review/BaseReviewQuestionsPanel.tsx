// frontend/src/components/weekmonth/review/BaseReviewQuestionsPanel.tsx
import React, { useState } from 'react';
import { Pagination } from '@/components/shared/utils/Pagination';

export interface QuestionItem {
  code: string;
  text: string;
}

interface BaseReviewQuestionsPanelProps<T = any> {
  questions: QuestionItem[];
  entries: T[];
  getEntryCode: (entry: T) => string;
  getEntryField: (entry: T) => string | null;
  getEntryId: (entry: T) => number;
  onSaveAnswer: (code: any, text: string, existingId?: number) => void;
  questionsPerPage?: number;
}

export function BaseReviewQuestionsPanel<T = any>({
  questions,
  entries,
  getEntryCode,
  getEntryField,
  getEntryId,
  onSaveAnswer,
  questionsPerPage = 3,
}: BaseReviewQuestionsPanelProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const startIdx = (currentPage - 1) * questionsPerPage;
  const pageQuestions = questions.slice(startIdx, startIdx + questionsPerPage);

  return (
    <div className="flex flex-col h-full">
      {/* Domande distribuite nello spazio */}
      <div className="flex-1 flex flex-col gap-4 justify-between">
        {pageQuestions.map(({ code, text }) => {
          const existing = (entries || []).find(e => getEntryCode(e) === code);
          const currentText = existing ? getEntryField(existing) : '';
          const existingId = existing ? getEntryId(existing) : undefined;

          return (
            <div key={code} className="flex-1 flex flex-col gap-2 min-h-0">
              <p className="text-sm font-semibold text-gray-700 whitespace-pre-line leading-relaxed shrink-0">
                {text}
              </p>
              <textarea
                key={`${code}-${existingId || 'new'}-p${currentPage}`}
                defaultValue={currentText ?? ''}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val !== (currentText ?? '').trim()) {
                    onSaveAnswer(code, val, existingId);
                  }
                }}
                placeholder="Scrivi la tua risposta..."
                className="flex-1 min-h-[80px] w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:bg-white transition-all resize-none placeholder-gray-400"
              />
            </div>
          );
        })}
      </div>

      {/* Paginazione */}
      <div className="shrink-0 pt-3">
        <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
      </div>
    </div>
  );
}
