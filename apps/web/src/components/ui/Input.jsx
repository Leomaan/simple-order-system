import React from 'react';
import { applyFilter, detectFilter } from '../../utils/inputFilters';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  disabled,
  className = '',
  icon: Icon,
  filter,
  name,
  id,
  helperText,
  error,
  ...props
}) {
  const activeFilter = detectFilter({ filter, name, type, id });

  const handleChange = (e) => {
    if (!onChange) return;
    if (activeFilter) {
      const originalValue = e.target.value;
      const filteredValue = applyFilter(activeFilter, originalValue);
      const customEvent = {
        ...e,
        target: {
          ...e.target,
          name: e.target.name || name,
          value: filteredValue,
          rawValue: originalValue.replace(/\D/g, ''),
        },
      };
      onChange(customEvent);
    } else {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label 
          htmlFor={id || name}
          className="text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-stone-400 dark:text-stone-400 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full bg-[#fdfdfc] dark:bg-[#26262e] border border-[#d8d2c4] dark:border-[#3e3e4a] text-[#1c1917] dark:text-[#ececf0] rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500/80 dark:focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/25 transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-400 disabled:opacity-50 disabled:bg-[#f2eee6] dark:disabled:bg-[#1a1a20] shadow-xs ${
            Icon ? 'pl-11' : ''
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[11px] text-red-500 font-medium">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-[11px] text-stone-500 dark:text-stone-400">{helperText}</span>
      )}
    </div>
  );
}