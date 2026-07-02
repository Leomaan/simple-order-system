import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../config/api';

const ACTIONS = [
  'LOGIN', 'LOGOUT',
  'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'RESTORE_PRODUCT', 'PERMANENT_DELETE_PRODUCT',
  'CREATE_ORDER', 'CLOSE_ORDER', 'PAY_ORDER', 'DELETE_ORDER', 'UPDATE_ORDER', 'RESTORE_ORDER', 'PERMANENT_DELETE_ORDER',
  'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESTORE_USER', 'PERMANENT_DELETE_USER',
  'ADD_ORDER_ITEM', 'UPDATE_ORDER_ITEM', 'REMOVE_ORDER_ITEM',
];

const ENTITIES = ['Product', 'Order', 'User', 'OrderItem'];

export function useLogs(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  // Busca reativa de logs com polling automático e recarga rápida
  const { data: logs = [], isLoading: loading, error } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      const res = await api.get(`/audit?${params}`);
      return res.data.data;
    },
    staleTime: 0,              // Dados obsoletos na hora para forçar checagem
    refetchInterval: 10000,    // Atualiza logs de auditoria a cada 10 segundos
    refetchOnWindowFocus: true // Atualiza os logs assim que o admin volta para a janela/aba
  });

  return {
    logs,
    loading,
    error: error ? 'Erro ao carregar logs' : '',
    fetchLogs: (newFilters) => setFilters(newFilters ?? {}),
    ACTIONS,
    ENTITIES
  };
}