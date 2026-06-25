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
        <label className="text-neutral-450 text-xs font-bold uppercase tracking-wider select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-neutral-500 pointer-events-none">
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
          className={`w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 transition-all duration-200 placeholder:text-neutral-600 disabled:opacity-50 disabled:bg-neutral-950/50 ${
            Icon ? 'pl-11' : ''
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}