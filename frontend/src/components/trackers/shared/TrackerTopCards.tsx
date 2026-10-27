import React from 'react';
import { GlassCardWidget } from '../GlassCardWidget';

export interface TrackerTopCardItem {
  label: string;
  title?: string | null;
  subtitle?: string | null;
  posterPath?: string | null;
  emptyTitle?: string;
  emptySubtitle?: string;
  onClick?: () => void;
}

export interface TrackerTopCardsProps {
  cards: TrackerTopCardItem[];
}

export const TrackerTopCards: React.FC<TrackerTopCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 shrink-0">
      {cards.slice(0, 3).map((card, index) => {
        const hasContent = Boolean(card.title);
        return (
          <GlassCardWidget
            key={index}
            label={card.label}
            title={hasContent ? card.title! : card.emptyTitle || 'Nessuno'}
            subtitle={hasContent ? card.subtitle || '' : card.emptySubtitle || ''}
            posterPath={card.posterPath || null}
            onClick={hasContent && card.onClick ? card.onClick : undefined}
          />
        );
      })}
    </div>
  );
};
