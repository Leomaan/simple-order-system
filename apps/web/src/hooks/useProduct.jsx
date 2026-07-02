import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../config/api';

export function useProducts(initialCategory = '') {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [searchFilter, setSearchFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Busca do cardápio de produtos com cache de 5 minutos
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['products', { category: categoryFilter, search: searchFilter, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (searchFilter) params.append('search', searchFilter);
      params.append('page', String(page));
      params.append('limit', String(limit));
      const res = await api.get(`/product?${params}`);
      return res.data.data;
    },
  });

  const products = data?.products || (Array.isArray(data) ? data : []);
  const totalPages = data?.totalPages || 1;
  const totalProducts = data?.totalProducts || products.length;

  // Mutação para criação de produto
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/product', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Mutação para edição de produto
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/product/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Mutação para exclusão (soft delete) de produto
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/product/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products,
    loading,
    totalPages,
    currentPage: page,
    totalProducts,
    setPage,
    error: error ? 'Erro ao carregar produtos' : '',
    fetchProducts: (category, search) => {
      setCategoryFilter(category ?? '');
      setSearchFilter(search ?? '');
      setPage(1);
    },
    createProduct: (data) => createMutation.mutateAsync(data),
    updateProduct: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteProduct: (id) => deleteMutation.mutateAsync(id),
  };
}