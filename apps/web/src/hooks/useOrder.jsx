import { useState, useEffect } from 'react';
import api from '../config/api';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchOrders(status) {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : '';
      const res = await api.get(`/order${params}`);
      setOrders(res.data.data);
    } catch (err) {
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }

  async function createOrder(data) {
    const res = await api.post('/order', data);
    setOrders((prev) => [...prev, res.data.data]);
    return res.data.data;
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, fetchOrders, createOrder };
}