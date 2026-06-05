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

  async function updateOrder(id, data) {
    const res = await api.put(`/order/${id}`, data);
    setOrders((prev) => prev.map((o) => (o.id === id ? res.data.data : o)));
    return res.data.data;
  }

  async function deleteOrder(id) {
    await api.delete(`/order/${id}`);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, fetchOrders, createOrder, updateOrder, deleteOrder };
}