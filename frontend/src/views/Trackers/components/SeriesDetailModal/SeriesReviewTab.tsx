import React, { useState } from 'react';
import type { TMDBSeries, UserSeriesTracking } from '@/types/trackers';
import { StarRating } from './StarRating';

interface SeriesReviewTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
}

export const SeriesReviewTab: React.FC<SeriesReviewTabProps> = ({ tmdbSeries, userTracking }) => {
  const [rating, setRating] = useState(userTracking?.rating || 0);
  const [review, setReview] = useState(userTracking?.notes || '');
  const [visibility, setVisibility] = useState(userTracking?.review_visibility || 'friends_only');

  const handleSave = () => {
    console.log("Saving review:", { rating, review, visibility });
    // TODO: Call API
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full">
      
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold text-gray-900">La tua Recensione</h2>
        <p className="text-gray-500">Cosa ne pensi di {tmdbSeries.title}?</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
        
        {/* Rating */}
        <div className="flex flex-col gap-3">
          <label className="font-bold text-gray-700">Voto Complessivo</label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-3">
          <label className="font-bold text-gray-700">Recensione / Note personali</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
            placeholder="Scrivi qui i tuoi pensieri su questa serie..."
          />
        </div>

        {/* Visibility & Save */}
        <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Chi può vederla:</span>
            <div className="relative group">
              <select 
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2 pl-10 pr-8 rounded-lg cursor-pointer transition-colors outline-none"
              >
                <option value="private">Solo io</option>
                <option value="friends_only">Amici</option>
                <option value="public">Pubblico</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                {visibility === 'private' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                )}
                {visibility === 'friends_only' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
                {visibility === 'public' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            Salva Recensione
          </button>
        </div>
      </div>
    </div>
  );
};
