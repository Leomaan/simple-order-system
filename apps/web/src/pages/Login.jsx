import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative overflow-hidden select-none">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-orange-600/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="mb-8 text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-650 text-white font-black text-2xl shadow-xl shadow-orange-500/10 mb-4 select-none">
            S
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Simple Order
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Gestão inteligente de pedidos</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}