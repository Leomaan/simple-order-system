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
          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300 shadow-sm'
          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
      } ${className}`}
      title={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
      aria-label="Alternar tema"
    >
      {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
    </button>
  );
}
