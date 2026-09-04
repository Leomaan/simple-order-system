import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { useSocket } from '../context/SocketContext';

export function useOrderDetail(orderId) {
  const queryClient = useQueryClient();
  const { isConnected } = useSocket();

  // Consulta do pedido em tempo real via React Query
  const { data: orderDetails, isLoading: loadingDetails, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/order/${orderId}`);
      return res.data.data;
    },
    enabled: Boolean(orderId),
    refetchInterval: isConnected ? false : 5000,
  });

  // Mutação com Optimistic Update para Adicionar Item
  const addItemMutation = useMutation({
    mutationFn: async ({ product, quantity = 1 }) => {
      const res = await api.post('/order-item', {
        orderId,
        productId: product.id,
        quantity,
      });
      return res.data.data;
    },
    onMutate: async ({ product, quantity = 1 }) => {
      // Cancela refetches pendentes para não sobrescrever o estado otimista
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });

      // Salva snapshot do estado anterior para rollback
      const previousOrder = queryClient.getQueryData(['order', orderId]);

      // Atualiza o cache otimista imediatamente (0ms de latência)
      queryClient.setQueryData(['order', orderId], (old) => {
        if (!old) return old;
        const items = [...(old.OrderItems || [])];
        const existingIdx = items.findIndex(
          (i) => i.ProductId === product.id || i.Product?.id === product.id || i.Product?.name === product.name
        );

        if (existingIdx >= 0) {
          const existing = items[existingIdx];
          const newQty = existing.quantity + quantity;
          const unitPrice = Number(existing.unitPrice || product.price);
          items[existingIdx] = {
            ...existing,
            quantity: newQty,
            totalPrice: unitPrice * newQty,
          };
        } else {
          items.push({
            id: `temp-${Date.now()}`,
            ProductId: product.id,
            quantity,
            unitPrice: Number(product.price),
            totalPrice: Number(product.price) * quantity,
            Product: { id: product.id, name: product.name, price: product.price },
          });
        }

        const total = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        return { ...old, OrderItems: items, total };
      });

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      // Rollback se a API falhar
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', orderId], context.previousOrder);
      }
    },
    onSettled: () => {
      // Sincroniza em background com o servidor
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Mutação com Optimistic Update para Alterar Quantidade (+ ou -)
  const changeQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      if (quantity <= 0) {
        await api.delete(`/order-item/${itemId}`);
        return null;
      }
      const res = await api.patch(`/order-item/${itemId}`, { quantity });
      return res.data.data;
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      const previousOrder = queryClient.getQueryData(['order', orderId]);

      queryClient.setQueryData(['order', orderId], (old) => {
        if (!old) return old;
        let items = [...(old.OrderItems || [])];

        if (quantity <= 0) {
          items = items.filter((i) => i.id !== itemId);
        } else {
          const idx = items.findIndex((i) => i.id === itemId);
          if (idx >= 0) {
            const item = items[idx];
            const unitPrice = Number(item.unitPrice);
            items[idx] = {
              ...item,
              quantity,
              totalPrice: unitPrice * quantity,
            };
          }
        }

        const total = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        return { ...old, OrderItems: items, total };
      });

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', orderId], context.previousOrder);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Mutação com Optimistic Update para Remover Item
  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      await api.delete(`/order-item/${itemId}`);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      const previousOrder = queryClient.getQueryData(['order', orderId]);

      queryClient.setQueryData(['order', orderId], (old) => {
        if (!old) return old;
        const items = (old.OrderItems || []).filter((i) => i.id !== itemId);
        const total = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        return { ...old, OrderItems: items, total };
      });

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', orderId], context.previousOrder);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orderDetails,
    loadingDetails,
    error: error ? 'Erro ao carregar detalhes do pedido' : '',
    fetchDetails: refetch,
    addItem: (product, quantity = 1) => addItemMutation.mutateAsync({ product, quantity }),
    changeQuantity: (itemId, quantity) => changeQuantityMutation.mutateAsync({ itemId, quantity }),
    removeItem: (itemId) => removeItemMutation.mutateAsync(itemId),
    isMutating: addItemMutation.isPending || changeQuantityMutation.isPending || removeItemMutation.isPending,
  };
}
