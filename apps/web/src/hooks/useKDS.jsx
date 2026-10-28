import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { socket } from '../config/socket';

// Mapeamento estritamente baseado no enum legado do sistema apenas para produtos antigos sem vínculo relacional (stationId = null)
const LEGACY_CATEGORY_SLUG_MAP = {
  FOOD: 'cozinha',
  SNACK: 'cozinha',
  SIDE: 'cozinha',
  DRINK: 'pronta-entrega',
  DESSERT: 'pronta-entrega',
};

/**
 * Verifica relacionalmente se o item pertence a uma estação de Pronta Entrega
 * (via stationSlug, stationId ou enum legado quando stationId ainda for nulo)
 */
export function isReadyDeliveryItem(itemOrProduct, stations = []) {
  if (!itemOrProduct) return false;

  if (itemOrProduct.isReadyDelivery !== undefined) {
    return Boolean(itemOrProduct.isReadyDelivery);
  }

  const product = itemOrProduct.Product || itemOrProduct.product || itemOrProduct;
  const stationId =
    itemOrProduct.stationId ??
    product?.stationId ??
    product?.Category?.stationId ??
    null;

  if (stationId && stations.length > 0) {
    const matched = stations.find((s) => String(s.id) === String(stationId));
    if (matched) {
      return matched.slug === 'pronta-entrega';
    }
  }

  if (itemOrProduct.stationSlug) {
    return itemOrProduct.stationSlug === 'pronta-entrega';
  }

  // Fallback exclusivo para o enum legado caso o produto antigo não tenha stationId vinculado
  if (!stationId) {
    const legacyCode = String(product?.category || '').toUpperCase();
    return LEGACY_CATEGORY_SLUG_MAP[legacyCode] === 'pronta-entrega';
  }

  return false;
}

/**
 * Reproduz alerta sonoro de cozinha usando /notification.mp3 com fallback em Web Audio API
 */
export function playKitchenBell() {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.85;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        playSynthesizedBell();
      });
    }
  } catch (_) {
    playSynthesizedBell();
  }
}

function playSynthesizedBell() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Primeiro toque (A5 - 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Segundo toque (D6 - 1174.66Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.2);
    gain2.gain.setValueAtTime(0.35, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.75);
  } catch (_) {}
}

export function useKDS() {
  const { user } = useAuth();
  const effectiveCompanyId =
    user?.companyId ||
    (localStorage.getItem('companyId') ? Number(localStorage.getItem('companyId')) : null);
  const queryClient = useQueryClient();
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [audioEnabled, setAudioEnabled] = useState(false);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      if (next) {
        playKitchenBell();
      }
      return next;
    });
  }, []);

  // Busca as estações de produção relacionais cadastradas para a empresa no banco
  const { data: stations = [] } = useQuery({
    queryKey: ['kds-stations', { companyId: effectiveCompanyId }],
    queryFn: async () => {
      const res = await api.get('/company/current/stations').catch(() => ({ data: { data: [] } }));
      return res.data.data || [];
    },
  });

  // Busca pedidos ativos com itens em produção
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['kds-active-orders', { companyId: effectiveCompanyId }],
    queryFn: async () => {
      const res = await api.get('/order');
      return (res.data.data || []).filter((o) => o.status === 'OPEN');
    },
    refetchInterval: 10000,
  });

  // Listener em tempo real com reprodução de alerta sonoro apenas para novos itens/pedidos
  useEffect(() => {
    const handleNewOrderEvent = () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-orders'] });
      if (audioEnabled) {
        playKitchenBell();
      }
    };

    const handleStatusSyncEvent = () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-orders'] });
    };

    const newItemEvents = [
      'order:created',
      'order_item:created',
      'order_created',
      'item_added',
    ];

    const statusSyncEvents = [
      'order_item:updated',
      'order_item:deleted',
      'item_status_changed',
      'order_item:status_changed',
      'delivery_claimed',
      'order:updated',
      'order:closed',
    ];

    newItemEvents.forEach((evt) => socket.on(evt, handleNewOrderEvent));
    statusSyncEvents.forEach((evt) => socket.on(evt, handleStatusSyncEvent));

    return () => {
      newItemEvents.forEach((evt) => socket.off(evt, handleNewOrderEvent));
      statusSyncEvents.forEach((evt) => socket.off(evt, handleStatusSyncEvent));
    };
  }, [queryClient, audioEnabled]);

  // Transição de status do item (Iniciar Preparo -> Pronto -> Entregue)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, itemId, status }) => {
      return await api.patch(`/order-item/${itemId}/status`, { status, orderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });

  // Assumir entrega do item (READY -> DELIVERING)
  const claimDeliveryMutation = useMutation({
    mutationFn: async ({ itemId }) => {
      return await api.patch(`/order-item/${itemId}/claim-delivery`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });

  // Resolução puramente relacional da estação do item (OrderItem.stationId -> Product.stationId -> Category.stationId)
  const resolveItemStation = useCallback(
    (item) => {
      const product = item.Product || item.product;
      const relationalStationId =
        item.stationId ??
        product?.stationId ??
        product?.Category?.stationId ??
        null;

      if (relationalStationId !== null && relationalStationId !== undefined) {
        const matched = stations.find((s) => String(s.id) === String(relationalStationId));
        if (matched) {
          return {
            effectiveStationId: String(matched.id),
            stationName: matched.name,
            stationSlug: matched.slug,
            isReadyDelivery: matched.slug === 'pronta-entrega',
          };
        }
      }

      // Fallback apenas para itens legados criados antes do vínculo de stationId
      const legacyCategory = String(product?.category || '').toUpperCase();
      const targetSlug = LEGACY_CATEGORY_SLUG_MAP[legacyCategory] || 'cozinha';
      const fallbackStation =
        stations.find((s) => s.slug === targetSlug) || stations[0] || null;

      return {
        effectiveStationId: fallbackStation ? String(fallbackStation.id) : null,
        stationName: fallbackStation?.name || 'Cozinha',
        stationSlug: fallbackStation?.slug || targetSlug,
        isReadyDelivery: (fallbackStation?.slug || targetSlug) === 'pronta-entrega',
      };
    },
    [stations]
  );

  // Agrupamento dos itens ativos
  const activeItems = useMemo(() => {
    return orders
      .flatMap((order) =>
        (order.OrderItems || order.items || []).map((item) => {
          const stationInfo = resolveItemStation(item);
          return {
            ...item,
            OrderId: item.OrderId || item.orderId || order.id,
            orderId: item.orderId || item.OrderId || order.id,
            status: item.status || 'QUEUED',
            orderTable: order.table,
            orderCreatedAt: order.createdAt,
            ...stationInfo,
          };
        })
      )
      .filter((item) => item.status !== 'DELIVERED' && item.status !== 'CANCELLED');
  }, [orders, resolveItemStation]);

  // Contagem de itens por estação para exibir nos filtros do KDSHeader
  const stationCounts = useMemo(() => {
    const counts = { ALL: activeItems.length };
    stations.forEach((st) => {
      counts[String(st.id)] = activeItems.filter(
        (item) => String(item.effectiveStationId) === String(st.id)
      ).length;
    });
    return counts;
  }, [activeItems, stations]);

  const filteredItems = useMemo(() => {
    if (selectedStation === 'ALL') return activeItems;
    return activeItems.filter(
      (item) => String(item.effectiveStationId) === String(selectedStation)
    );
  }, [activeItems, selectedStation]);

  return {
    stations,
    stationCounts,
    isLoading,
    selectedStation,
    setSelectedStation,
    audioEnabled,
    setAudioEnabled,
    toggleAudio,
    activeItems,
    filteredItems,
    updateItemStatus: (orderId, itemId, status) =>
      updateStatusMutation.mutate({ orderId, itemId, status }),
    claimItemDelivery: (itemId) =>
      claimDeliveryMutation.mutate({ itemId }),
    isMutating: updateStatusMutation.isPending || claimDeliveryMutation.isPending,
  };
}
