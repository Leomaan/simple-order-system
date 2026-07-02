import axios from 'axios';

const SKIP_REFRESH_ROUTES = ['/auth/login', '/auth/refresh', '/auth/logout'];

// Função auxiliar para ler cookies no frontend
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Interceptor para injetar manualmente o token CSRF em requisições de escrita (CORS)
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isSkipped = SKIP_REFRESH_ROUTES.some((route) => original.url?.includes(route));

    if (error.response?.status === 401 && !original._retry && !isSkipped) {
      original._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(original);
      } catch {
        // Disparar evento customizado em vez de recarregar a página com window.location.href
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;