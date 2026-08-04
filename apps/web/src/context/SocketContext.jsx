import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../config/socket.js';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const queryClient = useQueryClient();

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // Invalidação automática do React Query ao receber eventos em tempo real
    function handleOrderChange() {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Eventos de pedidos em tempo real
    socket.on('order:created', handleOrderChange);
    socket.on('order:updated', handleOrderChange);
    socket.on('order:closed', handleOrderChange);
    socket.on('order:deleted', handleOrderChange);
    socket.on('order:restored', handleOrderChange);

    // Eventos de itens de pedidos em tempo real
    socket.on('order_item:created', handleOrderChange);
    socket.on('order_item:updated', handleOrderChange);
    socket.on('order_item:deleted', handleOrderChange);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('order:created', handleOrderChange);
      socket.off('order:updated', handleOrderChange);
      socket.off('order:closed', handleOrderChange);
      socket.off('order:deleted', handleOrderChange);
      socket.off('order:restored', handleOrderChange);
      socket.off('order_item:created', handleOrderChange);
      socket.off('order_item:updated', handleOrderChange);
      socket.off('order_item:deleted', handleOrderChange);
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
