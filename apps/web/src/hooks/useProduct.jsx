import { useState, useEffect } from 'react';
import api from '../config/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchProducts(category) {
    setLoading(true);
    try {
      const params = category ? `?category=${category}` : '';
      const res = await api.get(`/product${params}`);
      setProducts(res.data.data);
    } catch (err) {
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(data) {
    const res = await api.post('/product', data);
    setProducts((prev) => [...prev, res.data.data]);
    return res.data.data;
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts, createProduct };
}