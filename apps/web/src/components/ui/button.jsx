export default function button({ children, loading, disabled, type = 'button', onClick, variant = 'primary' }) {
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-400 text-white',
    danger:  'bg-red-500 hover:bg-red-400 text-white',
    ghost:   'bg-transparent hover:bg-neutral-800 text-neutral-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg py-2.5 px-4 text-sm transition-colors`}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}