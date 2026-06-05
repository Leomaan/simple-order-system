import loginForm from '../components/auth/loginForm';

export default function login() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Simple Order
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Sistema de pedidos</p>
        </div>
        {loginForm({})}
      </div>
    </div>
  );
}