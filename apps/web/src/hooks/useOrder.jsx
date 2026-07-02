import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../config/api';

export function useOrders(initialStatus = '') {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Busca reativa de pedidos com cache de dados
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['orders', { status: statusFilter, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', String(limit));
      const res = await api.get(`/order?${params}`);
      return res.data.data;
    },
  });

  const orders = data?.orders || (Array.isArray(data) ? data : []);
  const totalPages = data?.totalPages || 1;
  const totalOrders = data?.totalOrders || orders.length;

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
    totalPages,
    currentPage: page,
    totalOrders,
    setPage,
    error: error ? 'Erro ao carregar pedidos' : '',
    fetchOrders: (status) => {
      setStatusFilter(status ?? '');
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    createOrder: (data) => createMutation.mutateAsync(data),
    updateOrder: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteOrder: (id) => deleteMutation.mutateAsync(id),
  };
}