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
    <div className="bg-white dark:bg-[#1a1a20] rounded-2xl p-6 sm:p-8 border border-[#e4ded4] dark:border-[#2e2e38] shadow-xl w-full text-[#1c1917] dark:text-[#ececf0]">
      <div className="mb-6">
        <h2 className="text-[#1c1917] dark:text-white font-bold text-xl tracking-tight">Login</h2>
        <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">Identifique-se para acessar o sistema</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          name="email"
          filter="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoFocus
        />

        <Input
          label="Senha"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <ErrorMessage message={error} />

        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full mt-2"
        >
          Acessar painel
        </Button>
      </form>

      {/* Demo Credentials Section */}
      <div className="mt-6 pt-5 border-t border-[#e4ded4] dark:border-[#2e2e38] flex flex-col gap-2.5">
        <p className="text-center text-stone-500 dark:text-stone-400 text-[10px] font-bold uppercase tracking-wider select-none">
          Acesso Rápido (Demonstração)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleLogin('admin@restaurant.com', 'admin123')}
            disabled={loading}
            className="py-2 px-3 bg-[#ede8df] hover:bg-[#e4ded3] text-stone-800 dark:bg-[#26262e] dark:hover:bg-[#30303a] dark:text-stone-200 border border-[#d8d2c4] dark:border-[#3e3e4a] rounded-xl text-xs font-semibold transition cursor-pointer text-center select-none active:scale-[0.97]"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => handleLogin('waiter@restaurant.com', 'waiter123')}
            disabled={loading}
            className="py-2 px-3 bg-[#ede8df] hover:bg-[#e4ded3] text-stone-800 dark:bg-[#26262e] dark:hover:bg-[#30303a] dark:text-stone-200 border border-[#d8d2c4] dark:border-[#3e3e4a] rounded-xl text-xs font-semibold transition cursor-pointer text-center select-none active:scale-[0.97]"
          >
            Garçom Demo
          </button>
        </div>
      </div>
    </div>
  );
}