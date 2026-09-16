import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { formatErrorMessage } from '../components/util/errorUtil';

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(email, password) {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { role, name, csrfToken } = res.data.data;
      login({ role, name, csrfToken }); 

      const defaultPath = role === 'ADMIN' ? '/admin' : '/waiter';
      const from = location.state?.from?.pathname;

      const isValidDestination = from && (
        (role === 'ADMIN' && from.startsWith('/admin')) ||
        (role === 'WAITER' && from.startsWith('/waiter'))
      );

      navigate(isValidDestination ? from : defaultPath, { replace: true });
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return { handleLogin, error, loading };
}