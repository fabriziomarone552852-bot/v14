import React from 'react';
import { Link } from 'react-router-dom';

interface SubmenuItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isSidebarOpen: boolean;
}

export const SubmenuItem: React.FC<SubmenuItemProps> = ({
  to,
  label,
  icon,
  isActive,
  isSidebarOpen,
}) => {
  return (
    <Link
      to={to}
      title={!isSidebarOpen ? label : undefined}
      className={`flex items-center gap-3 rounded-lg transition-colors focus:outline-none ${
        isSidebarOpen ? 'py-1.5 px-3' : 'p-2 justify-center'
      } ${isActive ? 'bg-gray-700 text-white font-bold' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
    >
      <span className="w-4 h-4 shrink-0 flex items-center justify-center">{icon}</span>
      {isSidebarOpen && <span className="text-sm">{label}</span>}
    </Link>
  );
};
