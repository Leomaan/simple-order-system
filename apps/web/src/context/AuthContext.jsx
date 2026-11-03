import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api, { setCsrfToken } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.post('/auth/refresh');
        const { role, name, isSuperAdmin, companyId, impersonating, csrfToken } = res.data.data;
        if (csrfToken) {
          setCsrfToken(csrfToken);
        }
        setUser({ role, name, isSuperAdmin, companyId, impersonating: !!impersonating });

        // Garante limpeza de chaves residuais de autenticação legadas
        localStorage.removeItem('csrfToken');
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');

        if (companyId) {
          localStorage.setItem('companyId', String(companyId));
        } else {
          localStorage.removeItem('companyId');
        }
      } catch (err) {
        setCsrfToken(null);
        localStorage.removeItem('companyId');
        localStorage.removeItem('csrfToken');
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
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

  function login({ role, name, isSuperAdmin, companyId, impersonating, csrfToken }) {
    if (csrfToken) {
      setCsrfToken(csrfToken);
    }
    if (companyId) {
      localStorage.setItem('companyId', String(companyId));
    } else {
      localStorage.removeItem('companyId');
    }
    // Remove qualquer resquício legado de tokens no localStorage
    localStorage.removeItem('csrfToken');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');

    setUser({ role, name, isSuperAdmin, companyId, impersonating: !!impersonating });
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {});
    } catch {}
    setCsrfToken(null);
    localStorage.removeItem('companyId');
    localStorage.removeItem('csrfToken');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('isSuperAdmin');
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
