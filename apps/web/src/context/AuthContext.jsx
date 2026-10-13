import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.post('/auth/refresh');
        const { role, name, csrfToken, isSuperAdmin, companyId } = res.data.data;
        setUser({ role, name, isSuperAdmin, companyId });
        localStorage.setItem('role', role);
        localStorage.setItem('name', name);
        if (isSuperAdmin !== undefined) {
          localStorage.setItem('isSuperAdmin', String(isSuperAdmin));
        }
        if (companyId) {
          localStorage.setItem('companyId', String(companyId));
        }
        if (csrfToken) {
          localStorage.setItem('csrfToken', csrfToken);
        }
      } catch (err) {
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('isSuperAdmin');
        localStorage.removeItem('companyId');
        localStorage.removeItem('csrfToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      logout();
    }
    window.addEventListener('auth:expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:expired', handleSessionExpired);
    };
  }, []);

  function login({ role, name, csrfToken, isSuperAdmin, companyId }) {
    localStorage.setItem('role', role);
    localStorage.setItem('name', name);
    if (isSuperAdmin !== undefined) {
      localStorage.setItem('isSuperAdmin', String(isSuperAdmin));
    }
    if (companyId) {
      localStorage.setItem('companyId', String(companyId));
    }
    if (csrfToken) {
      localStorage.setItem('csrfToken', csrfToken);
    }
    setUser({ role, name, isSuperAdmin, companyId });
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {});
    } catch {}
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('isSuperAdmin');
    localStorage.removeItem('companyId');
    localStorage.removeItem('csrfToken');
    queryClient.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}