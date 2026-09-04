import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../config/api';

export function useProducts(initialCategory = '', options = {}) {
  const config = typeof initialCategory === 'object' && initialCategory !== null 
    ? initialCategory 
    : options;
  const initialCat = typeof initialCategory === 'string' ? initialCategory : (config.category || '');
  const paginate = config.paginate !== false;
  const limit = config.limit ?? 20;

  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState(initialCat);
  const [searchFilter, setSearchFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce para digitação suave: não dispara requisição a cada letra e evita piscadas na tela
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilter);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchFilter]);

  // Busca do cardápio de produtos com cache e transição suave (sem desmontar a lista)
  const { data, isLoading: loading, isFetching, error } = useQuery({
    queryKey: ['products', { category: categoryFilter, search: debouncedSearch, page: paginate ? page : undefined, limit: paginate ? limit : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (paginate && limit > 0) {
        params.append('page', String(page));
        params.append('limit', String(limit));
      }
      const res = await api.get(`/product?${params}`);
      return res.data.data;
    },
    placeholderData: keepPreviousData,
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
    isFetching,
    totalPages,
    currentPage: page,
    totalProducts,
    setPage,
    categoryFilter,
    searchFilter,
    category: categoryFilter,
    search: searchFilter,
    setCategory: (category) => {
      setCategoryFilter(category ?? '');
      setPage(1);
    },
    setSearch: (search) => {
      setSearchFilter(search ?? '');
      setPage(1);
    },
    error: error ? 'Erro ao carregar produtos' : '',
    fetchProducts: (category, search) => {
      setCategoryFilter(category ?? '');
      setSearchFilter(search ?? '');
      setPage(1);
    },
    createProduct: (data) => createMutation.mutateAsync(data),
    updateProduct: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteProduct: (id) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}