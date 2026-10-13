import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Login() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center px-4 relative overflow-hidden select-none transition-colors">
      
      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-400">
        <div className="mb-6 text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-black text-xl shadow-sm mb-3 select-none">
            S
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Simple Order
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-0.5">
            Gestão inteligente para restaurantes
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}