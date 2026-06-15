import { useState } from 'react';
import api from '../config/api';

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getSalesToday() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/report/today');
      return res.data.data;
    } catch (err) {
      setError('Erro ao carregar vendas do dia');
    } finally {
      setLoading(false);
    }
  }

  async function getRevenueByPeriod(from, to) {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/report/revenue?from=${from}&to=${to}`);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao carregar faturamento');
    } finally {
      setLoading(false);
    }
  }

  async function getOrdersByPeriod(from, to, status) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ from, to });
      if (status) params.append('status', status);
      const res = await api.get(`/report/orders?${params}`);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, getSalesToday, getRevenueByPeriod, getOrdersByPeriod };
}