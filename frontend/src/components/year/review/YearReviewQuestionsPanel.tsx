// frontend/src/components/year/review/YearReviewQuestionsPanel.tsx
import React from 'react';
import { BaseReviewQuestionsPanel } from '@/components/weekmonth/review/BaseReviewQuestionsPanel';
import type { DbYearlyEntry, YearlyType } from '@/types/yearlyentries';

const YEAR_REVIEW_QUESTIONS = [
  { code: 'Q1', text: '1. Quali sono stati gli eventi più significativi di quest\'anno?' },
  { code: 'Q2', text: '2. Quali sono le più importanti lezioni che hai imparato quest\'anno?' },
  { code: 'Q3', text: '3. Controlla i tuoi obiettivi dell\'anno appena passato. Sei soddisfatto? Datti un voto sincero da 1 a 10.\nCosa hai fatto e cosa potevi fare di più?' },
  { code: 'Q4', text: '4. Ripensa alle persone di quest\'anno. Chi ha fatto la differenza per te? Cosa puoi fare tu per queste persone?' },
  { code: 'Q5', text: '5. Guarda alle cose positive e a quelle negative dell\'anno. A cosa sono dovute? Cosa puoi fare per aumentare quelle buone ed evitare quelle cattive?' },
  { code: 'Q6', text: '6. Pensa ad almeno 3 cose che puoi migliorare nel prossimo anno e scrivi un elenco di azioni concrete!' },
];

interface YearReviewQuestionsPanelProps {
  yearlyEntries: DbYearlyEntry[];
  onSaveAnswer: (code: YearlyType, text: string, existingId?: number) => void;
}

export const YearReviewQuestionsPanel: React.FC<YearReviewQuestionsPanelProps> = ({ yearlyEntries, onSaveAnswer }) => (
  <BaseReviewQuestionsPanel
    questions={YEAR_REVIEW_QUESTIONS}
    entries={yearlyEntries}
    getEntryCode={(e) => e.yearly_type}
    getEntryField={(e) => e.yearly_field}
    getEntryId={(e) => e.id}
    onSaveAnswer={onSaveAnswer}
  />
);
