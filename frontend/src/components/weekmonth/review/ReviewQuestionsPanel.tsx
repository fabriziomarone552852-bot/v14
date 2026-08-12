// frontend/src/components/weekmonth/review/ReviewQuestionsPanel.tsx
import React, { useState } from 'react';
import { Pagination } from '@/components/shared/utils/Pagination';
import type { DbMonthlyEntry, MonthlyType } from '@/types/monthlyentries';

const REVIEW_QUESTIONS: { code: MonthlyType; text: string }[] = [
  { code: 'Q1', text: '1. Quali sono stati gli eventi più significativi di questo mese?' },
  { code: 'Q2', text: '2. Quali sono le più importanti lezioni che hai imparato in questo mese?' },
  { code: 'Q3', text: '3. Controlla i tuoi obiettivi del mese appena passato. Sei soddisfatto? Datti un voto sincero da 1 a 10.\nCosa hai fatto e cosa potevi fare di più?' },
  { code: 'Q4', text: '4. Ripensa alle persone di questo ultimo mese. Chi ha fatto la differenza per te? Cosa puoi fare tu per queste persone?' },
  { code: 'Q5', text: '5. Guarda alle cose positive e a quelle negative che sono successe. A cosa sono dovute? Cosa puoi fare per aumentare quelle buone ed evitare quelle cattive?' },
  { code: 'Q6', text: '6. Pensa ad almeno 3 cose che puoi migliorare in questo prossimo mese e scrivi un elenco di azioni concrete per farlo!' },
];

const QUESTIONS_PER_PAGE = 3;

interface ReviewQuestionsPanelProps {
  monthlyEntries: DbMonthlyEntry[];
  onSaveAnswer: (code: MonthlyType, text: string, existingId?: number) => void;
}

export const ReviewQuestionsPanel: React.FC<ReviewQuestionsPanelProps> = ({ monthlyEntries, onSaveAnswer }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(REVIEW_QUESTIONS.length / QUESTIONS_PER_PAGE);

  const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const pageQuestions = REVIEW_QUESTIONS.slice(startIdx, startIdx + QUESTIONS_PER_PAGE);

  return (
    <div className="flex flex-col h-full">
      {/* Domande distribuite nello spazio */}
      <div className="flex-1 flex flex-col gap-4 justify-between">
        {pageQuestions.map(({ code, text }) => {
          const existing = monthlyEntries.find(e => e.monthly_type === code);
          return (
            <div key={code} className="flex-1 flex flex-col gap-2 min-h-0">
              <p className="text-sm font-semibold text-gray-700 whitespace-pre-line leading-relaxed shrink-0">{text}</p>
              <textarea
                key={`${code}-${existing?.id || 'new'}-p${currentPage}`}
                defaultValue={existing?.monthly_field ?? ''}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val !== (existing?.monthly_field ?? '').trim()) {
                    onSaveAnswer(code, val, existing?.id);
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
};
