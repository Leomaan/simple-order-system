import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { formatErrorMessage } from '../components/util/errorUtil';

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(email, password) {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { role, name, csrfToken } = res.data.data;
      login({ role, name, csrfToken }); 

      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/waiter');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return { handleLogin, error, loading };
}