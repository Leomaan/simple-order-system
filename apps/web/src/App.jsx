import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OfflineStatusBanner from './components/ui/OfflineStatusBanner';
import { router } from './routes';

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
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}