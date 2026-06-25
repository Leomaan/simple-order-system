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
    </div>
  );
}