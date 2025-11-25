
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 bg-white text-slate-900 border rounded-md shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors placeholder-slate-400 ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600 flex items-center">{error}</p>}
    </div>
  );
};
