import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../config/api';

export function useCompany() {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');

  // Busca lista de empresas (Superadmin)
  const { data: companies = [], isLoading, refetch } = useQuery({
    queryKey: ['superadmin-companies'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data.data;
    },
  });

  // Mutação para criar nova empresa
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/company', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
      setErrorMsg('');
    },
    onError: (err) => {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setErrorMsg(msg.join(' | '));
      } else {
        setErrorMsg(msg || 'Erro ao criar empresa');
      }
    },
  });

  // Mutação para alternar status (Suspender/Reativar)
  const toggleStatusMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/company/${id}/toggle-status`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
    },
  });

  // Acessar empresa como administrador (Modo Suporte)
  const impersonate = async (companyId) => {
    try {
      await api.post(`/company/${companyId}/impersonate`);
      queryClient.clear();
      localStorage.setItem('companyId', String(companyId));
      window.location.href = '/admin';
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao acessar empresa');
    }
  };

  return {
    companies,
    isLoading,
    errorMsg,
    setErrorMsg,
    refetch,
    createCompany: createMutation.mutate,
    isCreating: createMutation.isPending,
    toggleStatus: toggleStatusMutation.mutate,
    isToggling: toggleStatusMutation.isPending,
    impersonate,
    exitImpersonate: async () => {
      try {
        await api.post('/company/exit-impersonate');
      } catch {}
      queryClient.clear();
      localStorage.removeItem('companyId');
      window.location.href = '/superadmin';
    },
  };
}
