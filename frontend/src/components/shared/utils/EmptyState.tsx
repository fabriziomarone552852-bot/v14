import React from 'react';

export const EmptyState: React.FC<{ message: string; icon?: React.ReactNode; className?: string }> = ({ message, icon, className = '' }) => (
  <div className={`p-4 flex flex-col items-center justify-center text-center text-sm text-gray-500 italic whitespace-normal w-full h-full ${className}`}>
    {icon && <div className="mb-2">{icon}</div>}
    <p className="mt-1">{message}</p>
  </div>
);