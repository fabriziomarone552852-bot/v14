// frontend/src/components/weekmonth/review/BaseReviewModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { ReadOnlyTrackerChart } from './ReadOnlyTrackerChart';
import type { TrackerItem } from '@/types/monthlyentries';

export interface ReviewTabButton<T extends string = string> {
  id: T;
  emoji: string;
  title?: string;
}

interface BaseReviewModalProps<T extends string = string> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  activeTab: T | null;
  onSetTab: (tab: T | null) => void;
  tabButtons: ReviewTabButton<T>[];
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  onUpdateMood?: (id: string, newValue: number) => void;
  onUpdateSphere?: (id: string, newValue: number) => void;
  children: React.ReactNode;
  tagBar?: React.ReactNode;
}

export function BaseReviewModal<T extends string = string>({
  isOpen,
  onClose,
  title,
  activeTab,
  onSetTab,
  tabButtons,
  moodsUI,
  spheresUI,
  onUpdateMood,
  onUpdateSphere,
  children,
  tagBar,
}: BaseReviewModalProps<T>) {
  if (!isOpen) return null;

  const handleTabClick = (tab: T) => {
    onSetTab(activeTab === tab ? null : tab);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Shell */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1200px] h-[90vh] max-h-[900px] flex flex-col overflow-hidden animate-fadeIn z-10 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-gray-100 shrink-0">
          <h2 className="text-sm font-black text-gray-600 uppercase tracking-widest">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col">
              {children}
            </div>
          </div>

          {/* Right Sidebar — Tracker Charts & Tab Buttons */}
          <div className="w-[260px] xl:w-[300px] shrink-0 border-l border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden">
            {/* Mood Chart */}
            <div className="flex-1 min-h-0 p-2 flex flex-col">
              <ReadOnlyTrackerChart
                title="Come mi sento"
                items={moodsUI}
                uid="rv-base-mood"
                onUpdateValue={onUpdateMood}
              />
            </div>

            <div className="w-8/12 mx-auto h-px bg-gray-200 shrink-0" />

            {/* Spheres Chart */}
            <div className="flex-1 min-h-0 p-2 flex flex-col">
              <ReadOnlyTrackerChart
                title="Sfere di Influenza"
                items={spheresUI}
                uid="rv-base-sphere"
                onUpdateValue={onUpdateSphere}
              />
            </div>

            <div className="w-8/12 mx-auto h-px bg-gray-200 shrink-0 my-1" />

            {/* Tab Buttons */}
            {tabButtons.length > 0 && (
              <div className="flex gap-1.5 p-3 shrink-0 justify-center">
                {tabButtons.map(({ id, emoji, title: btnTitle }) => (
                  <button
                    key={id}
                    onClick={() => handleTabClick(id)}
                    title={btnTitle}
                    className={`w-12 h-12 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                      activeTab === id
                        ? 'bg-blue-600 text-white shadow-md scale-105'
                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tag Bar Footer (Optional) */}
        {tagBar && (
          <div className="border-t border-gray-200 px-6 py-2 bg-gray-50/80 shrink-0">
            {tagBar}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default BaseReviewModal;
