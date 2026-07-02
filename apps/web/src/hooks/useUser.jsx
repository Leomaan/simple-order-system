import { useState, useEffect } from 'react';
import api from '../config/api';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  async function fetchUsers(targetPage = page) {
    setLoading(true);
    try {
      const res = await api.get(`/user?page=${targetPage}&limit=${limit}`);
      const data = res.data.data;
      if (data && data.users) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalUsers);
        setPage(data.currentPage);
      } else {
        setUsers(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalUsers(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function createUser(data) {
    const res = await api.post('/user', data);
    fetchUsers(page);
    return res.data.data;
  }

  async function updateUser(id, data) {
    const res = await api.patch(`/user/${id}`, data);
    fetchUsers(page);
    return res.data.data;
  }

  async function deleteUser(id) {
    await api.delete(`/user/${id}`);
    fetchUsers(page);
  }

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  return { 
    users, 
    loading, 
    error, 
    fetchUsers: () => fetchUsers(1), 
    createUser, 
    updateUser, 
    deleteUser, 
    totalPages, 
    currentPage: page, 
    setPage, 
    totalUsers 
  };
}