// src/components/tags/TagReviewsModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import type { EnrichedTagItem, AssociatedReview } from '@/hooks/useTagArchiveData';
import { CalendarIcon, ReviewIcon, ForwardIcon } from '@/components/shared/utils/Icons';

interface TagReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: EnrichedTagItem | null;
  onOpenReview?: (review: AssociatedReview) => void;
}

export const TagReviewsModal: React.FC<TagReviewsModalProps> = ({
  isOpen,
  onClose,
  tag,
  onOpenReview,
}) => {
  if (!tag) return null;

  const tagColor = tag.color || '#8B5CF6';
  const monthlyReviews = tag.associatedReviews.filter((r) => r.type === 'month');
  const yearlyReviews = tag.associatedReviews.filter((r) => r.type === 'year');

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
            style={{ backgroundColor: tagColor }}
          />
          <span className="font-extrabold text-slate-900 text-base sm:text-lg">
            Review collegate a #{tag.name}
          </span>
        </div>
      }
      maxWidthClass="max-w-4xl"
      onConfirm={onClose}
      confirmText="Chiudi"
    >
      <div className="w-full">
        {tag.associatedReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <div className="p-4 bg-slate-100 rounded-2xl mb-3">
              <ReviewIcon className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">Nessuna review collegata</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Questo tag non è stato ancora assegnato ad alcuna revisione mensile o annuale.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. COLONNA REVISIONI MENSILI */}
            <div className="flex flex-col min-h-0 bg-slate-50/60 rounded-2xl border border-slate-200/70 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Revisioni Mensili
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                  {monthlyReviews.length}
                </span>
              </div>

              {monthlyReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-center">
                  <p className="text-xs font-medium">Nessuna review mensile</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {monthlyReviews.map((rev) => (
                    <div
                      key={rev.id}
                      onClick={() => onOpenReview && onOpenReview(rev)}
                      className={`flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-white hover:bg-indigo-50/60 hover:border-indigo-300 transition-all ${
                        onOpenReview ? 'cursor-pointer group' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                          {rev.title}
                        </span>
                      </div>
                      {onOpenReview && (
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <span>Apri</span>
                          <ForwardIcon className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. COLONNA REVISIONI ANNUALI */}
            <div className="flex flex-col min-h-0 bg-slate-50/60 rounded-2xl border border-slate-200/70 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <ReviewIcon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Revisioni Annuali
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                  {yearlyReviews.length}
                </span>
              </div>

              {yearlyReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-center">
                  <p className="text-xs font-medium">Nessuna review annuale</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {yearlyReviews.map((rev) => (
                    <div
                      key={rev.id}
                      onClick={() => onOpenReview && onOpenReview(rev)}
                      className={`flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-white hover:bg-purple-50/60 hover:border-purple-300 transition-all ${
                        onOpenReview ? 'cursor-pointer group' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-purple-700 transition-colors">
                          {rev.title}
                        </span>
                      </div>
                      {onOpenReview && (
                        <div className="flex items-center gap-1 text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <span>Apri</span>
                          <ForwardIcon className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default TagReviewsModal;
