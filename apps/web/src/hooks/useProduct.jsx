import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';

export function useProducts() {
  const queryClient = useQueryClient();

  // Busca do cardápio de produtos com cache de 5 minutos
  const { data: products = [], isLoading: loading, error, refetch: fetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/product');
      return res.data.data;
    },
  });

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
    error: error ? 'Erro ao carregar produtos' : '',
    fetchProducts,
    createProduct: (data) => createMutation.mutateAsync(data),
    updateProduct: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteProduct: (id) => deleteMutation.mutateAsync(id),
  };
}