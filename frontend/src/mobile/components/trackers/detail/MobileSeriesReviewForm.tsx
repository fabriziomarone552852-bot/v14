// src/mobile/components/trackers/detail/MobileSeriesReviewForm.tsx
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Check, X } from 'lucide-react';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { DatePicker } from '@/components/shared/utils/DatePicker/DatePicker';
import { ReviewVisibilityIcon } from '@/components/trackers/SeriesDetailModal/shared/ReviewVisibilityBadge';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';

export interface MobileSeriesReviewFormProps {
  editingLogId: number | null;
  onBack: () => void;
  reviewDate: string;
  setReviewDate: (d: string) => void;
  visibility: string;
  setVisibility: (v: string) => void;
  review: string;
  setReview: (r: string) => void;
  rating: number;
  setRating: (n: number) => void;
  onSave: () => void;
}

export const MobileSeriesReviewForm: React.FC<MobileSeriesReviewFormProps> = ({
  editingLogId,
  onBack,
  reviewDate,
  setReviewDate,
  visibility,
  setVisibility,
  review,
  setReview,
  rating,
  setRating,
  onSave,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden">
      {/* 1. SEZIONE SUPERIORE: INTESTAZIONE E STELLINE CENTRATE */}
      <div className="flex flex-col shrink-0">
        {/* INTESTAZIONE */}
        <div className="flex items-center gap-2 border-b border-gray-200/80 pb-2 pt-0.5 mb-1">
          <button type="button" onClick={onBack} className="p-1 -ml-1 text-gray-500 hover:text-gray-800 active:scale-90 transition-all cursor-pointer rounded-lg hover:bg-gray-100" title="Torna indietro" aria-label="Torna indietro">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-extrabold text-gray-900">
            {editingLogId ? 'Modifica Recensione Serie' : 'Nuova Recensione Serie'}
          </h2>
        </div>

        {/* STELLINE CENTRATE */}
        <div className="flex flex-col items-center justify-center py-1 border-b border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Il Tuo Voto</span>
          <StarRating value={rating} onChange={setRating} iconClassName="w-6 h-6" hideNumber />
        </div>
      </div>

      {/* 2. AREA CENTRALE: TEXTAREA */}
      <div className="flex-1 min-h-0 flex flex-col my-1.5 overflow-hidden">
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Cosa ne pensi di questa serie?"
          className="w-full flex-1 min-h-[40px] p-3 bg-white border border-gray-200/90 rounded-2xl outline-none resize-none text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed shadow-2xs overflow-y-auto custom-scrollbar"
        />
      </div>

      {/* 3. SEZIONE INFERIORE: 4 colonne (Calendario, Privacy, Salva x2) */}
      <div className="shrink-0 -mx-4 px-4 pt-2 pb-2 bg-gray-50/95 backdrop-blur-xs border-t border-gray-200/80 flex flex-col gap-1.5">
        <div className="grid grid-cols-4 gap-2 w-full">
          {/* Colonna 1: Calendario */}
          <div className="col-span-1">
            <div className="relative w-full">
              <DatePicker
                value={reviewDate}
                onChange={setReviewDate}
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                overlay={true}
                align="center"
                customTrigger={
                  <button type="button" className="w-full h-10 px-1 border border-gray-200 bg-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-gray-300 active:scale-95 transition-all shadow-2xs cursor-pointer select-none" title="Data recensione">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className={`truncate ${reviewDate ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                      {reviewDate ? new Date(`${reviewDate}T00:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'Senza data'}
                    </span>
                  </button>
                }
              />
              {Boolean(reviewDate) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReviewDate('');
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer z-10"
                  title="Rimuovi data"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Colonna 2: Privacy */}
          <div className="col-span-1">
            <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="w-full h-10 px-1 border border-gray-200 bg-white rounded-xl text-xs text-gray-700 font-semibold flex items-center justify-center gap-1.5 hover:border-gray-300 active:scale-95 transition-all shadow-2xs cursor-pointer select-none" title="Visibilita recensione">
              <ReviewVisibilityIcon visibility={visibility} className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="truncate">
                {visibility === 'private' && 'Solo io'}
                {visibility === 'friends_only' && 'Amici'}
                {visibility === 'public' && 'Pubblico'}
              </span>
            </button>
          </div>

          {/* Colonne 3 e 4: Salva */}
          <div className="col-span-2">
            <button type="button" onClick={onSave} className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center">
              Salva
            </button>
          </div>
        </div>
      </div>

      {/* Modale Centrale Selezione Privacy */}
      <SelectModalDialog isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} title="Visibilita Recensione" maxWidthClass="max-w-xs" zIndex={10060}>
        <div className="space-y-1.5 py-1">
          {[
            { value: 'private', label: 'Solo io', desc: 'Visibile solo a te' },
            { value: 'friends_only', label: 'Amici', desc: 'Visibile solo ai tuoi amici' },
            { value: 'public', label: 'Pubblico', desc: 'Visibile a tutta la community' },
          ].map((opt) => {
            const isSelected = visibility === opt.value;
            return (
              <button key={opt.value} type="button" onClick={() => { setVisibility(opt.value); setIsPrivacyModalOpen(false); }} className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'}`}>
                <div className="flex items-center gap-2.5">
                  <ReviewVisibilityIcon visibility={opt.value} className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                  <div className="flex flex-col text-left">
                    <span>{opt.label}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>{opt.desc}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </SelectModalDialog>
    </div>
  );
};

export default MobileSeriesReviewForm;
