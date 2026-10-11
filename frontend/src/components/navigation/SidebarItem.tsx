import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isSidebarOpen: boolean;
  isDevMenu?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive, isSidebarOpen }) => {
  const base = 'flex items-center transition-all duration-200 rounded-xl focus:outline-none cursor-pointer';
  const layout = isSidebarOpen ? 'px-4 py-3 gap-4 mx-2 justify-start' : 'py-3 mx-3 justify-center';
  const colors = isActive
    ? 'bg-blue-600 text-white shadow-md'
    : 'text-gray-400 hover:bg-gray-700 hover:text-white';

  return (
    <Link to={to} className={`${base} ${layout} ${colors}`} title={!isSidebarOpen ? label : undefined}>
      <span className="w-6 h-6 shrink-0">{icon}</span>
      {isSidebarOpen && <span className="font-semibold tracking-wide text-sm">{label}</span>}
    </Link>
  );
};
