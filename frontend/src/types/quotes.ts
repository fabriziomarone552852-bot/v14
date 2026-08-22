// frontend/src/types/quotes.ts

export type QuoteCategory = 
  | 'Filosofia' 
  | 'Motivazione' 
  | 'Saggezza' 
  | 'Crescita' 
  | 'Creatività' 
  | 'Focus';

export interface Quote {
  id: number;
  text: string;
  author: string;
  category: QuoteCategory;
}

export interface QuoteCardProps {
  quote: Quote;
  isTodayQuote: boolean;
}
