import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../config/api';

export function useOrders(initialStatus = '') {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Busca reativa de pedidos com cache de dados
  const { data: orders = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['orders', { status: statusFilter }],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/order${params}`);
      return res.data.data;
    },
  });

  // Mutação para criar pedido
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/order', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Mutação para editar pedido
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/order/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Mutação para remover pedido
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/order/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders,
    loading,
    error: error ? 'Erro ao carregar pedidos' : '',
    fetchOrders: (status) => {
      setStatusFilter(status ?? '');
      refetch();
    },
    createOrder: (data) => createMutation.mutateAsync(data),
    updateOrder: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteOrder: (id) => deleteMutation.mutateAsync(id),
  };
}