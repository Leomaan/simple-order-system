import React, { useState } from 'react';
import { useLogin } from '../../hooks/useLogin';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, error, loading } = useLogin();

  function onSubmit(e) {
    e.preventDefault();
    handleLogin(email, password);
  }

  return (
    <div className="glass-panel rounded-2xl p-8 border border-neutral-800 shadow-xl w-full">
      <div className="mb-6">
        <h2 className="text-white font-bold text-xl tracking-tight">Login</h2>
        <p className="text-neutral-500 text-xs mt-1">Identifique-se para acessar o sistema</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoFocus
        />

        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <ErrorMessage message={error} />

        <Button
          children="Acessar painel"
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full mt-2"
        />
      </form>

      {/* Demo Credentials Section */}
      <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-col gap-3">
        <p className="text-center text-neutral-500 text-[10px] font-bold uppercase tracking-wider select-none">
          Acesso Rápido (Demonstração)
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleLogin('admin@restaurant.com', 'admin123')}
            disabled={loading}
            className="py-2.5 px-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-350 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center select-none active:scale-[0.97]"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => handleLogin('waiter@restaurant.com', 'waiter123')}
            disabled={loading}
            className="py-2.5 px-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-350 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center select-none active:scale-[0.97]"
          >
            Garçom Demo
          </button>
        </div>
      </div>
    </div>
  );
}