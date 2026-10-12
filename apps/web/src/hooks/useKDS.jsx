import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../config/api';
import { socket } from '../config/socket';

export function useKDS() {
  const queryClient = useQueryClient();
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Busca estações de produção ativas da empresa
  const { data: stations = [] } = useQuery({
    queryKey: ['kds-stations'],
    queryFn: async () => {
      const res = await api.get('/company/current/stations').catch(() => ({ data: { data: [] } }));
      return res.data.data;
    },
  });

  // Busca pedidos ativos com itens em produção
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['kds-active-orders'],
    queryFn: async () => {
      const res = await api.get('/order');
      return res.data.data.filter((o) => o.status === 'OPEN');
    },
    refetchInterval: 15000,
  });

  // Listener em tempo real com reprodução de alerta sonoro
  useEffect(() => {
    const handleNewItem = () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-orders'] });
      if (audioEnabled) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        } catch (_) {}
      }
    };

    socket.on('order_created', handleNewItem);
    socket.on('item_added', handleNewItem);
    socket.on('item_status_changed', handleNewItem);

    return () => {
      socket.off('order_created', handleNewItem);
      socket.off('item_added', handleNewItem);
      socket.off('item_status_changed', handleNewItem);
    };
  }, [queryClient, audioEnabled]);

  // Transição de status do item
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, itemId, status }) => {
      return await api.patch(`/order-item/${itemId}/status`, { status, orderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-orders'] });
    },
  });

  // Agrupamento e filtragem dos itens
  const activeItems = orders.flatMap((order) =>
    (order.OrderItems || []).map((item) => ({
      ...item,
      orderTable: order.table,
      orderCreatedAt: order.createdAt,
    }))
  ).filter((item) => item.status !== 'DELIVERED' && item.status !== 'CANCELLED');

  const filteredItems = selectedStation === 'ALL'
    ? activeItems
    : activeItems.filter((item) => String(item.stationId) === String(selectedStation));

  return {
    stations,
    isLoading,
    selectedStation,
    setSelectedStation,
    audioEnabled,
    setAudioEnabled,
    activeItems,
    filteredItems,
    updateItemStatus: (orderId, itemId, status) => updateStatusMutation.mutate({ orderId, itemId, status }),
  };
}
