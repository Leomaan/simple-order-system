import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-[#121215] flex flex-col items-center justify-center px-4 relative overflow-hidden select-none transition-colors">
      {/* Decorative ambient warmth */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-orange-600/5 blur-[150px] pointer-events-none" />

      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-400">
        <div className="mb-6 text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-xl shadow-md shadow-orange-500/20 mb-3 select-none">
            S
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] dark:text-white tracking-tight">
            Simple Order
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
            Gestão inteligente para restaurantes
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}