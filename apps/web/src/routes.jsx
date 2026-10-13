import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';

const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const Waiter = lazy(() => import('./pages/Waiter'));
const Menu = lazy(() => import('./pages/menu'));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const KDS = lazy(() => import('./pages/KDS'));

import { LoadingSpinner } from './components/ui/LoadingSpinner';

function RouteErrorFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center text-center p-4 select-none">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mb-4 font-sans border border-red-500/20">
        ⚠️
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Ops! Algo deu errado</h1>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 text-sm">
        Não conseguimos carregar os dados desta página. Isso pode ser uma falha temporária.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 font-semibold rounded-xl transition duration-200 shadow-sm text-sm cursor-pointer"
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
        <ScrollRestoration />
        <Outlet />
      </Suspense>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: '/cardapio',
        element: <Menu />,
      },
      {
        path: '/cardapio/:slug',
        element: <Menu />,
      },
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
        path: '/superadmin',
        element: (
          <PrivateRoute requireSuperAdmin={true}>
            <SuperAdmin />
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
        path: '/kds',
        element: (
          <PrivateRoute role={['ADMIN', 'WAITER']}>
            <KDS />
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
