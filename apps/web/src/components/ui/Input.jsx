import React from 'react';

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
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-neutral-600 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all duration-200 placeholder:text-neutral-400 disabled:opacity-50 disabled:bg-neutral-100 dark:disabled:bg-neutral-950/50 shadow-xs ${
            Icon ? 'pl-11' : ''
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}