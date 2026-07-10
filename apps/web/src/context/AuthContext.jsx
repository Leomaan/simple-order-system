import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.post('/auth/refresh');
        const { role, name, csrfToken } = res.data.data;
        setUser({ role, name });
        localStorage.setItem('role', role);
        localStorage.setItem('name', name);
        if (csrfToken) {
          localStorage.setItem('csrfToken', csrfToken);
        }
      } catch (err) {
        localStorage.removeItem('role');
        localStorage.removeItem('name');
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

  function login({ role, name, csrfToken }) {
    localStorage.setItem('role', role);
    localStorage.setItem('name', name);
    if (csrfToken) {
      localStorage.setItem('csrfToken', csrfToken);
    }
    setUser({ role, name });
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {});
    } catch {}
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('csrfToken');
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