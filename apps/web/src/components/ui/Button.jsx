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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-sm shadow-orange-950/20 py-2.5 px-5',
    secondary: 'bg-[#ede8df] hover:bg-[#e4ded3] text-stone-800 border border-[#d8d2c4] dark:bg-[#26262e] dark:hover:bg-[#30303a] dark:text-[#ececf0] dark:border-[#3e3e4a] py-2.5 px-5 shadow-xs',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-sm py-2.5 px-5',
    ghost: 'bg-transparent hover:bg-stone-200/60 dark:hover:bg-[#26262e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 py-2 px-4',
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