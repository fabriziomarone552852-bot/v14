import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { DatePicker } from '@/components/shared/utils/DatePicker/DatePicker';
import { ReviewVisibilityIcon } from './shared/ReviewVisibilityBadge';

interface SeriesReviewFormProps {
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

export const SeriesReviewForm: React.FC<SeriesReviewFormProps> = ({
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {editingLogId ? 'Modifica Recensione' : 'Nuova Recensione'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <DatePicker
                value={reviewDate}
                onChange={setReviewDate}
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                usePortal={true}
                customTrigger={
                  <div
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-sm select-none gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className={`text-sm ${reviewDate ? 'text-gray-700 font-medium' : 'text-gray-400 italic'}`}>
                        {reviewDate ? new Date(reviewDate).toLocaleDateString('it-IT') : 'Senza data'}
                      </span>
                    </div>
                  </div>
                }
              />
            </div>
            {Boolean(reviewDate) && (
              <button
                type="button"
                onClick={() => setReviewDate('')}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Rimuovi data"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Visibility selector */}
          <div className="relative" style={{ width: '130px' }}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-sm select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">
                  <ReviewVisibilityIcon visibility={visibility} className="w-4 h-4" />
                </span>
                <span className="text-gray-700 font-medium">
                  {visibility === 'private' && 'Solo io'}
                  {visibility === 'friends_only' && 'Amici'}
                  {visibility === 'public' && 'Pubblico'}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 mt-1 animate-fadeIn right-0 top-full">
                  <div
                    onClick={() => {
                      setVisibility('private');
                      setIsDropdownOpen(false);
                    }}
                    className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <ReviewVisibilityIcon visibility="private" className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Solo io</span>
                  </div>
                  <div
                    onClick={() => {
                      setVisibility('friends_only');
                      setIsDropdownOpen(false);
                    }}
                    className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <ReviewVisibilityIcon visibility="friends_only" className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Amici</span>
                  </div>
                  <div
                    onClick={() => {
                      setVisibility('public');
                      setIsDropdownOpen(false);
                    }}
                    className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <ReviewVisibilityIcon visibility="public" className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Pubblico</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review text input */}
      <div className="flex flex-col flex-1 min-h-0 mb-4">
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-0 focus:border-gray-300 outline-none resize-none text-base text-gray-800 transition-colors"
          placeholder="Cosa ne pensi di questa serie?"
        />
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 shrink-0">
        <StarRating value={rating} onChange={setRating} hideNumber />
        <button
          onClick={onSave}
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
        >
          Salva
        </button>
      </div>
    </div>
  );
};
