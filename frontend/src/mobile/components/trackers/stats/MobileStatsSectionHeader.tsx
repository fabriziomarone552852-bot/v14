// src/mobile/components/trackers/stats/MobileStatsSectionHeader.tsx
import React from 'react';

interface MobileStatsSectionHeaderProps {
  title: string;
  icon?: string;
  badge?: string | number;
}

export const MobileStatsSectionHeader: React.FC<MobileStatsSectionHeaderProps> = ({
  title,
  icon,
  badge,
}) => {
  return (
    <div className="border-b border-slate-200 pb-2 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg leading-none">{icon}</span>}
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {badge !== undefined && badge !== null && (
        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
};

export default MobileStatsSectionHeader;
