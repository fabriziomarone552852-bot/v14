import React from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, className = '', children, ...props }) => (
  <div>
    {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>}
    <select
      className={`w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

export default FormSelect;
