import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl transition-all duration-200 cursor-pointer border select-none ${
        isLight
          ? 'bg-[#ede8df] hover:bg-[#e2dcce] text-stone-800 border-[#d8d2c4] shadow-xs'
          : 'bg-[#26262e] hover:bg-[#30303a] text-amber-400 border-[#3e3e4a] shadow-xs'
      } ${className}`}
      title={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
      aria-label="Alternar tema"
    >
      {isLight ? (
        <Moon className="w-4 h-4 text-stone-700 hover:text-stone-900 transition-colors" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 transition-colors" />
      )}
    </button>
  );
}
