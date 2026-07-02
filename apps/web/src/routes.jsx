import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';

const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const Waiter = lazy(() => import('./pages/Waiter'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
    </div>
  );
}

function RouteErrorFallback() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center p-4 select-none">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mb-4 font-sans">
        ⚠️
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Ops! Algo deu errado</h1>
      <p className="text-neutral-400 max-w-sm mb-6 text-sm">
        Não conseguimos carregar os dados desta página. Isso pode ser uma falha de conexão temporária.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition duration-200 shadow-lg shadow-orange-500/10 text-sm"
      >
        Recarregar página
      </button>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <PrivateRoute role="ADMIN">
            <Admin />
          </PrivateRoute>
        ),
      },
      {
        path: '/waiter',
        element: (
          <PrivateRoute role="WAITER">
            <Waiter />
          </PrivateRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);
