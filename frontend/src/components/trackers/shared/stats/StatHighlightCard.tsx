import React from 'react';

export interface StatHighlightCardProps {
  label: string;
  value: React.ReactNode;
  subtitle: string;
  valueColorClass?: string;
  valueSizeClass?: string;
  className?: string;
}

export const StatHighlightCard: React.FC<StatHighlightCardProps> = ({
  label,
  value,
  subtitle,
  valueColorClass = 'text-slate-800',
  valueSizeClass = 'text-3xl',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center ${className}`}
    >
      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className={`${valueSizeClass} font-black mb-1 ${valueColorClass}`}>
        {value}
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {subtitle}
      </span>
    </div>
  );
};

export default StatHighlightCard;
