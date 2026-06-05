import { useAuth } from '../context/AuthContext';

export default function Waiter() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Painel Garçom</h1>
        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-sm">Olá, {user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
      <p className="text-neutral-500">Em construção...</p>
    </div>
  );
}