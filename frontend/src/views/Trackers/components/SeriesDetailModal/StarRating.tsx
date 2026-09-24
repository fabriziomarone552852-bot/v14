import React, { useState, type MouseEvent } from 'react';

interface StarRatingProps {
  value: number; // 0.0 to 5.0
  onChange?: (val: number) => void;
  readonly?: boolean;
  hideNumber?: boolean;
  iconClassName?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readonly = false, hideNumber = false, iconClassName = "w-8 h-8" }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>, index: number) => {
    if (readonly || !onChange) return;
    // Calculate if cursor is on the left half or right half of the star
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverValue(index + (isHalf ? 0.5 : 1));
  };

  const handleMouseLeave = () => {
    if (readonly || !onChange) return;
    setHoverValue(null);
  };

  const handleClick = () => {
    if (readonly || !onChange || hoverValue === null) return;
    onChange(hoverValue);
  };

  return (
    <div 
      className="flex items-center gap-1"
      onMouseLeave={handleMouseLeave}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const starValue = index + 1;
        
        let fillClass = "text-gray-300"; // Empty
        let starIcon = (
          <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );

        if (displayValue >= starValue) {
          fillClass = "text-yellow-400"; // Full
          starIcon = (
            <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          );
        } else if (displayValue >= starValue - 0.5) {
          fillClass = "text-yellow-400"; // Half
          starIcon = (
            <svg className={iconClassName} viewBox="0 0 24 24">
              <defs>
                <linearGradient id={`halfGradient-${index}`} x1="0" x2="100%" y1="0" y2="0">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path fill={`url(#halfGradient-${index})`} stroke="currentColor" strokeWidth="1.5" className="text-gray-300" strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          );
        }

        return (
          <div
            key={index}
            className={`cursor-pointer transition-transform ${!readonly && 'hover:scale-110'} ${fillClass}`}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={handleClick}
          >
            {starIcon}
          </div>
        );
      })}
      {!hideNumber && (
        <span className="ml-2 font-mono font-bold text-gray-500 text-lg w-8">{displayValue.toFixed(1)}</span>
      )}
    </div>
  );
};
