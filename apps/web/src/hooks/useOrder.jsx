import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../config/api';
import { useSocket } from '../context/SocketContext';

export function useOrders(initialStatus = '') {
  const queryClient = useQueryClient();
  const { isConnected } = useSocket();
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Busca reativa de pedidos com cache de dados
  const { data, isLoading: loading, isFetching, error, refetch } = useQuery({
    queryKey: ['orders', { status: statusFilter, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', String(limit));
      const res = await api.get(`/order?${params}`);
      return res.data.data;
    },
    // Polling condicional: desativa requisições periódicas com socket conectado;
    // se o socket cair, ativa fallback de polling a cada 5s para manter as mesas sincronizadas
    refetchInterval: isConnected ? false : 5000,
    placeholderData: keepPreviousData,
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
    isFetching,
    totalPages,
    currentPage: page,
    totalOrders,
    setPage,
    statusFilter,
    setStatusFilter,
    error: error ? 'Erro ao carregar pedidos' : '',
    fetchOrders: (status) => {
      setStatusFilter(status ?? '');
      setPage(1);
    },
    createOrder: (data) => createMutation.mutateAsync(data),
    updateOrder: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteOrder: (id) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}