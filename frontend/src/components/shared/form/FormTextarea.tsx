import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const FormTextarea: React.FC<FormTextareaProps> = ({ label, className = '', ...props }) => (
  <div>
    {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>}
    <textarea
      className={`w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none ${className}`}
      {...props}
    />
  </div>
);

export default FormTextarea;
