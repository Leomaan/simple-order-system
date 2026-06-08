import { useState } from 'react';
import api from '../config/api';

export function useOrderItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function addItem(orderId, productId, quantity) {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/order-item', { orderId, productId, quantity });
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao adicionar item');
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id) {
    await api.delete(`/order-item/${id}`);
  }

  async function changeQuantity(id, quantity) {
    const res = await api.patch(`/order-item/${id}`, { quantity });
    return res.data.data;
  }

  return { addItem, removeItem, changeQuantity, loading, error };
}