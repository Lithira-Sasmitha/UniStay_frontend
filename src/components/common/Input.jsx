import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  id,
  error,
  required = false,
  className = '',
  helperText,
  icon: Icon,
  disabled = false,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 flex items-center justify-between">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full transition-all duration-200 border rounded-lg px-4 py-2.5 text-sm 
            outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 focus:ring-red-200 focus:border-red-600' 
              : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500 hover:border-gray-400'}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

export default Input;
