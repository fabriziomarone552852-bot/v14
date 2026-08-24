// frontend/src/components/weekmonth/review/ReviewQuestionsPanel.tsx
import React from 'react';
import { BaseReviewQuestionsPanel } from './BaseReviewQuestionsPanel';
import type { DbMonthlyEntry, MonthlyType } from '@/types/monthlyentries';

const REVIEW_QUESTIONS = [
  { code: 'Q1', text: '1. Quali sono stati gli eventi più significativi di questo mese?' },
  { code: 'Q2', text: '2. Quali sono le più importanti lezioni che hai imparato in questo mese?' },
  { code: 'Q3', text: '3. Controlla i tuoi obiettivi del mese appena passato. Sei soddisfatto? Datti un voto sincero da 1 a 10.\nCosa hai fatto e cosa potevi fare di più?' },
  { code: 'Q4', text: '4. Ripensa alle persone di questo ultimo mese. Chi ha fatto la differenza per te? Cosa puoi fare tu per queste persone?' },
  { code: 'Q5', text: '5. Guarda alle cose positive e a quelle negative che sono successe. A cosa sono dovute? Cosa puoi fare per aumentare quelle buone ed evitare quelle cattive?' },
  { code: 'Q6', text: '6. Pensa ad almeno 3 cose che puoi migliorare in questo prossimo mese e scrivi un elenco di azioni concrete per farlo!' },
];

interface ReviewQuestionsPanelProps {
  monthlyEntries: DbMonthlyEntry[];
  onSaveAnswer: (code: MonthlyType, text: string, existingId?: number) => void;
}

export const ReviewQuestionsPanel: React.FC<ReviewQuestionsPanelProps> = ({ monthlyEntries, onSaveAnswer }) => (
  <BaseReviewQuestionsPanel
    questions={REVIEW_QUESTIONS}
    entries={monthlyEntries}
    getEntryCode={(e) => e.monthly_type}
    getEntryField={(e) => e.monthly_field}
    getEntryId={(e) => e.id}
    onSaveAnswer={onSaveAnswer}
  />
);
