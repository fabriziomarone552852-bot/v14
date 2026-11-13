// src/mobile/components/trackers/diary/MobileTVDiarySectionPill.tsx
import React from 'react';

export interface MobileTVDiarySectionPillProps {
  title: string;
}

export const MobileTVDiarySectionPill: React.FC<MobileTVDiarySectionPillProps> = ({
  title,
}) => {
  return (
    <div className="flex items-center justify-center my-3.5 select-none">
      <span className="px-4 py-1 rounded-full text-[11px] font-black tracking-wide text-gray-700 bg-gray-200 border border-gray-300/70 shadow-2xs uppercase">
        {title}
      </span>
    </div>
  );
};

export default MobileTVDiarySectionPill;
