import { useState, useEffect } from 'react';
import api from '../config/api';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get('/user');
      setUsers(res.data.data);
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function createUser(data) {
    const res = await api.post('/user', data);
    setUsers((prev) => [...prev, res.data.data]);
    return res.data.data;
  }

  async function updateUser(id, data) {
    const res = await api.patch(`/user/${id}`, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? res.data.data : u)));
    return res.data.data;
  }

  async function deleteUser(id) {
    await api.delete(`/user/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, fetchUsers, createUser, updateUser, deleteUser };
}