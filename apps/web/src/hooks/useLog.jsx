import { useState } from 'react';
import api from '../config/api';

const ACTIONS = [
  'LOGIN', 'LOGOUT',
  'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'RESTORE_PRODUCT', 'PERMANENT_DELETE_PRODUCT',
  'CREATE_ORDER', 'CLOSE_ORDER', 'DELETE_ORDER', 'UPDATE_ORDER', 'RESTORE_ORDER', 'PERMANENT_DELETE_ORDER',
  'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESTORE_USER', 'PERMANENT_DELETE_USER',
  'ADD_ORDER_ITEM', 'UPDATE_ORDER_ITEM', 'REMOVE_ORDER_ITEM',
];

const ENTITIES = ['Product', 'Order', 'User', 'OrderItem'];

export function useLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchLogs({ userId, action, entity, from, to } = {}) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);
      if (entity) params.append('entity', entity);
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await api.get(`/audit?${params}`);
      setLogs(res.data.data);
    } catch (err) {
      setError('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  }

  return { logs, loading, error, fetchLogs, ACTIONS, ENTITIES };
}