import React from 'react';

export default function QuantityControl({ quantity, onChange, disabled }) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    } else {
      onChange(0);
    }
  };

  const handleIncrement = () => {
    onChange(quantity + 1);
  };

  return (
    <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 gap-1 select-none">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-red-500/10 hover:text-red-400 text-neutral-400 text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-40 active:scale-90"
      >
        −
      </button>
      <span className="text-white text-sm font-semibold w-7 text-center">
        {disabled ? (
          <span className="flex justify-center">
            <svg className="animate-spin h-3.5 w-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        ) : (
          quantity
        )}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-emerald-500/10 hover:text-emerald-400 text-neutral-400 text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-40 active:scale-90"
      >
        +
      </button>
    </div>
  );
}