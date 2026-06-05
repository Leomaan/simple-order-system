import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');

    if (role && name) {
      setUser({ role, name });
    }
    setLoading(false);
  }, []);

  function login({ role, name }) {
    localStorage.setItem('role', role);
    localStorage.setItem('name', name);
    setUser({ role, name });
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {});
    } catch {}
    localStorage.removeItem('role');
    localStorage.removeItem('name');
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