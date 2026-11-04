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
        const { role, name, isSuperAdmin, companyId, company, companyName, impersonating, csrfToken } = res.data.data;
        if (csrfToken) {
          setCsrfToken(csrfToken);
        }
        const effectiveCompany = company || (companyName ? { name: companyName, id: companyId } : null);
        setUser({ 
          role, 
          name, 
          isSuperAdmin, 
          companyId, 
          company: effectiveCompany,
          companyName: effectiveCompany?.name || companyName || null,
          impersonating: !!impersonating 
        });

        // Garante limpeza de chaves residuais de autenticação legadas
        localStorage.removeItem('csrfToken');
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');

        if (companyId) {
          localStorage.setItem('companyId', String(companyId));
        } else {
          localStorage.removeItem('companyId');
        }

        if (effectiveCompany?.name) {
          localStorage.setItem('companyName', effectiveCompany.name);
        } else {
          localStorage.removeItem('companyName');
        }
      } catch (err) {
        setCsrfToken(null);
        localStorage.removeItem('companyId');
        localStorage.removeItem('companyName');
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

  function login({ role, name, isSuperAdmin, companyId, company, companyName, impersonating, csrfToken }) {
    if (csrfToken) {
      setCsrfToken(csrfToken);
    }
    const effectiveCompany = company || (companyName ? { name: companyName, id: companyId } : null);
    if (companyId) {
      localStorage.setItem('companyId', String(companyId));
    } else {
      localStorage.removeItem('companyId');
    }
    if (effectiveCompany?.name) {
      localStorage.setItem('companyName', effectiveCompany.name);
    } else {
      localStorage.removeItem('companyName');
    }
    // Remove qualquer resquício legado de tokens no localStorage
    localStorage.removeItem('csrfToken');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');

    setUser({ 
      role, 
      name, 
      isSuperAdmin, 
      companyId, 
      company: effectiveCompany,
      companyName: effectiveCompany?.name || companyName || null,
      impersonating: !!impersonating 
    });
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {});
    } catch {}
    setCsrfToken(null);
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyName');
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
