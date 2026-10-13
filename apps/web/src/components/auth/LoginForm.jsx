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
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl w-full text-neutral-900 dark:text-neutral-100">
      <div className="mb-6">
        <h2 className="text-neutral-900 dark:text-white font-bold text-xl tracking-tight">Login</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">Identifique-se para acessar o sistema</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
      <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
        <p className="text-center text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider select-none">
          Acesso Rápido (Demonstração)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleLogin('admin@restaurant.com', 'admin123')}
            disabled={loading}
            className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-750 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-center select-none active:scale-[0.97]"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => handleLogin('waiter@restaurant.com', 'waiter123')}
            disabled={loading}
            className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-750 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-center select-none active:scale-[0.97]"
          >
            Garçom Demo
          </button>
        </div>
      </div>
    </div>
  );
}