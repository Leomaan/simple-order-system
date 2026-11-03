import axios from 'axios';

const SKIP_REFRESH_ROUTES = ['/auth/login', '/auth/refresh', '/auth/logout'];

// Função auxiliar para ler cookies no frontend (ex: cookie XSRF-TOKEN)
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'x-xsrf-token',
});

// Interceptor para injetar o token CSRF direto do cookie e o x-company-id ativo
api.interceptors.request.use(
  (config) => {
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      config.headers['x-company-id'] = companyId;
    }

    const method = config.method?.toLowerCase();
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      const csrfCookie = getCookie('XSRF-TOKEN');
      if (csrfCookie) {
        config.headers['X-XSRF-TOKEN'] = csrfCookie;
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
