import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          <span>{label} {required && <span className="text-red-500 font-bold">*</span>}</span>
        </label>
      )}
      <div className="relative group/input">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary-500 transition-colors pointer-events-none z-10">
            <Icon className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full transition-all duration-300 border rounded-2xl px-5 py-3.5 text-sm font-medium
            outline-none focus:ring-4 disabled:bg-slate-50 disabled:cursor-not-allowed
            placeholder:text-slate-300 placeholder:font-medium
            ${Icon ? 'pl-12' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${error 
              ? 'border-red-200 bg-red-50/10 focus:ring-red-100 focus:border-red-400 text-red-900' 
              : 'border-slate-100 bg-slate-50/30 focus:ring-primary-100 focus:border-primary-400 hover:border-slate-200 text-slate-900'}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1 rounded-lg hover:bg-slate-100"
            tabIndex="-1"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Eye className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[11px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 px-1 flex items-center gap-1 mt-0.5">
          {error}
        </p>
      )}
      {!error && helperText && <p className="text-xs text-slate-400 font-medium px-1 mt-0.5">{helperText}</p>}
    </div>
  );
};

export default Input;
