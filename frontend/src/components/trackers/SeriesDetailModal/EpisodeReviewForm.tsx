import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { DatePicker } from '@/components/shared/utils/DatePicker/DatePicker';
import { ReviewVisibilityIcon } from './shared/ReviewVisibilityBadge';

interface EpisodeReviewFormProps {
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
  platform: string;
  setPlatform: (p: string) => void;
  allPlatforms: string[];
  onSave: () => void;
}

export const EpisodeReviewForm: React.FC<EpisodeReviewFormProps> = ({
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
  platform,
  setPlatform,
  allPlatforms,
  onSave,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [newPlatformInput, setNewPlatformInput] = useState('');

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {editingLogId ? 'Modifica Recensione' : 'Nuova Recensione'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

          <div className="relative" style={{ width: '130px' }}>
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-sm select-none">
              <div className="flex items-center gap-2">
                <span className="text-gray-500"><ReviewVisibilityIcon visibility={visibility} className="w-4 h-4" /></span>
                <span className="text-gray-700 font-medium">
                  {visibility === 'private' && 'Solo io'}
                  {visibility === 'friends_only' && 'Amici'}
                  {visibility === 'public' && 'Pubblico'}
                </span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 mt-1 animate-fadeIn right-0 top-full">
                  {[{v:'private',l:'Solo io'},{v:'friends_only',l:'Amici'},{v:'public',l:'Pubblico'}].map(o => (
                    <div key={o.v} onClick={() => { setVisibility(o.v); setIsDropdownOpen(false); }} className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors">
                      <ReviewVisibilityIcon visibility={o.v} className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{o.l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Piattaforma — stesso stile degli altri selettori */}
          <div className="relative">
            <div onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex items-center gap-2 hover:border-blue-500 transition-colors shadow-sm select-none min-w-[140px]">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className={`font-medium truncate flex-1 ${platform ? 'text-gray-800' : 'text-gray-400'}`}>{platform || 'Piattaforma'}</span>
              {platform ? (
                <button onClick={(e) => { e.stopPropagation(); setPlatform(''); }} className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none">&#x2715;</button>
              ) : (
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isPlatformDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
            {isPlatformDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPlatformDropdownOpen(false)} />
                <div className="absolute z-50 right-0 top-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 mt-1 animate-fadeIn max-h-56 overflow-y-auto custom-scrollbar" style={{ minWidth: '180px' }}>
                  {/* Aggiungi nuova piattaforma */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex gap-2">
                      <input type="text" value={newPlatformInput} onChange={(e) => setNewPlatformInput(e.target.value)} placeholder="Nuova piattaforma..." className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); if (newPlatformInput.trim()) { setPlatform(newPlatformInput.trim()); setNewPlatformInput(''); setIsPlatformDropdownOpen(false); } } }} />
                      <button onClick={(e) => { e.stopPropagation(); if (newPlatformInput.trim()) { setPlatform(newPlatformInput.trim()); setNewPlatformInput(''); setIsPlatformDropdownOpen(false); } }} className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                        + Aggiungi
                      </button>
                    </div>
                    {/* Avviso duplicati */}
                    {newPlatformInput.trim().length > 0 && (() => {
                      const q = newPlatformInput.trim().toLowerCase();
                      const matches = allPlatforms.filter(p => p.toLowerCase().includes(q));
                      const exactMatch = allPlatforms.some(p => p.toLowerCase() === q);
                      if (matches.length === 0) return null;
                      return (
                        <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-lg p-2 space-y-1" onClick={(e) => e.stopPropagation()}>
                          <p className="text-[10px] font-bold text-amber-700">{exactMatch ? '⚠️ Già presente!' : '🔍 Simili già salvate:'}</p>
                          {matches.map(m => (
                            <button key={m} type="button" onClick={(e) => { e.stopPropagation(); setPlatform(m); setNewPlatformInput(''); setIsPlatformDropdownOpen(false); }} className="w-full text-left text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded px-2 py-1 transition-colors cursor-pointer">
                              {m}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  {platform && (
                    <div onClick={() => { setPlatform(''); setIsPlatformDropdownOpen(false); }} className="px-3 py-2.5 text-sm hover:bg-red-50 cursor-pointer text-red-500 transition-colors border-b border-gray-100">
                      ✕ Rimuovi piattaforma
                    </div>
                  )}
                  {allPlatforms.map((p) => (
                    <div key={p} onClick={() => { setPlatform(p); setIsPlatformDropdownOpen(false); }} className={`px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors ${p === platform ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}>
                      {p}
                      {p === platform && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto mb-4">
        <textarea value={review} onChange={(e) => setReview(e.target.value)} className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-0 focus:border-gray-300 outline-none resize-none text-base text-gray-800 transition-colors" placeholder="Cosa ne pensi di questo episodio?" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 shrink-0">
        <StarRating value={rating} onChange={setRating} hideNumber />
        <button onClick={onSave} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">
          Salva
        </button>
      </div>
    </div>
  );
};
