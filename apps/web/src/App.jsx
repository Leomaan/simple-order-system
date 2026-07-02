import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OfflineStatusBanner from './components/ui/OfflineStatusBanner';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Waiter from './pages/Waiter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita requisições ao focar na janela
      staleTime: 1000 * 60 * 5,    // Dados consideram-se frescos por 5 minutos
      retry: 1,                    // Tenta refazer a requisição 1 vez se falhar
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineStatusBanner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <PrivateRoute role="ADMIN">
                  <Admin />
                </PrivateRoute>
              }
            />

            <Route
              path="/waiter"
              element={
                <PrivateRoute role="WAITER">
                  <Waiter />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}