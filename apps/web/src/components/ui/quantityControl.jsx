export default function QuantityControl({ quantity, onChange, disabled }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center rounded-md bg-neutral-700 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 text-sm font-bold transition-colors disabled:opacity-40"
      >
        −
      </button>
      <span className="text-white text-sm font-medium w-6 text-center">
        {disabled ? '…' : quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center rounded-md bg-neutral-700 hover:bg-green-500/20 hover:text-green-400 text-neutral-300 text-sm font-bold transition-colors disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}