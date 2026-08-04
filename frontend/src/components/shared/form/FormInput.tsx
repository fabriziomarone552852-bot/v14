import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, className = '', ...props }) => (
  <div>
    {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>}
    <input
      className={`w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors ${className}`}
      {...props}
    />
  </div>
);

export default FormInput;
