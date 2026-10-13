import React from 'react';

export default function Button({
  children,
  loading,
  disabled,
  type = 'button',
  onClick,
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-neutral-400/50 dark:focus:ring-neutral-600/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-sm py-2.5 px-5',
    secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 dark:text-neutral-200 dark:border-neutral-700 py-2.5 px-5 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-sm py-2.5 px-5',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-600 dark:hover:bg-neutral-800 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-2 px-4',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Carregando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}