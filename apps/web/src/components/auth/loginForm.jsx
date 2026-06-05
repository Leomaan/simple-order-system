import { useState } from 'react';
import { useLogin } from '../../hooks/useLogin';
import input from '../ui/input';
import button from '../ui/button';
import errorMessage from '../ui/errorMessage';

export default function loginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, error, loading } = useLogin();

  function onSubmit(e) {
    e.preventDefault();
    handleLogin(email, password);
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
      <h2 className="text-white font-semibold text-lg mb-6">Entrar</h2>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {input({
          label: 'Email',
          type: 'email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: 'seu@email.com',
          required: true,
        })}

        {input({
          label: 'Senha',
          type: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: '••••••••',
          required: true,
        })}

        {errorMessage({ message: error })}

        {button({
          children: 'Entrar',
          type: 'submit',
          loading,
          variant: 'primary',
        })}
      </form>
    </div>
  );
}