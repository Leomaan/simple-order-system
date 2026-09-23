import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPublicMenu } from '../services/publicMenuService.js';
import { publicSocket } from '../config/public/socketPublic.js';

export const PUBLIC_MENU_QUERY_KEY = ['public-menu'];

export function usePublicMenu(initialCategory = '') {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [searchFilter, setSearchFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce para busca fluida por nome
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilter.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchFilter]);

  // 1. Busca todos os produtos disponíveis do cardápio público
  const { data: allProducts = [], isLoading, isFetching, error, refetch } = useQuery({
    queryKey: PUBLIC_MENU_QUERY_KEY,
    queryFn: () => fetchPublicMenu(),
    staleTime: 1000 * 60 * 5, // 5 minutos de frescor em cache
    gcTime: 1000 * 60 * 15,   // 15 minutos até descarte
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // 2. Sincronização em tempo real via WebSocket público
  useEffect(() => {
    function handleMenuUpdated() {
      queryClient.invalidateQueries({ queryKey: PUBLIC_MENU_QUERY_KEY });
    }

    if (!publicSocket.connected) {
      publicSocket.connect();
    }

    publicSocket.on('menu:updated', handleMenuUpdated);

    return () => {
      publicSocket.off('menu:updated', handleMenuUpdated);
      publicSocket.disconnect();
    };
  }, [queryClient]);

  // 3. Filtro reativo em memória por categoria e busca textual (igual ao admin e garçom)
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];

    return allProducts.filter((product) => {
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      const matchesSearch = !debouncedSearch || 
        product.name?.toLowerCase().includes(debouncedSearch) ||
        product.description?.toLowerCase().includes(debouncedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, categoryFilter, debouncedSearch]);

  return {
    products: filteredProducts,
    allProducts,
    loading: isLoading,
    isFetching,
    error: error ? 'Erro ao carregar o cardápio' : '',
    category: categoryFilter,
    search: searchFilter,
    setCategory: setCategoryFilter,
    setSearch: setSearchFilter,
    refetch,
  };
}