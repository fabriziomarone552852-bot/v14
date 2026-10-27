import React from 'react';
import { LoadingIcon } from '@/components/shared/utils/Icons';

export interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  text?: string;
  loadingText?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  hasMore,
  isLoading,
  onLoadMore,
  text = 'Carica altri risultati',
  loadingText = 'Caricamento altri risultati...',
  className = '',
  size = 'md',
}) => {
  if (!hasMore) return null;

  const isSmall = size === 'sm';

  return (
    <div className={`flex justify-center w-full ${isSmall ? 'pt-4 pb-2' : 'pt-8 pb-4'} ${className}`}>
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isSmall
            ? 'px-4 py-2 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            : 'px-6 py-2.5 text-sm bg-blue-50/90 hover:bg-blue-100 text-blue-700 border border-blue-200/80 hover:shadow-sm'
        }`}
      >
        {isLoading ? (
          <>
            <LoadingIcon className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-spin text-blue-600`} />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <svg
              className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-blue-600 shrink-0`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;
