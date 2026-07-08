import { useState, useEffect } from 'react';
import api from '../config/api';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function fetchSettings() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/settings');
      setSettings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }

  async function updateSettings(data) {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await api.put('/settings', data);
      setSettings(res.data.data);
      setSuccess(true);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar configurações');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    success,
    setSuccess,
    fetchSettings,
    updateSettings,
  };
}
