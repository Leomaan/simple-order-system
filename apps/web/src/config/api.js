import axios from 'axios';

const SKIP_REFRESH_ROUTES = ['/auth/login', '/auth/refresh', '/auth/logout'];

// Armazenamento em memória do token CSRF ativo (com persistência em sessionStorage)
let activeCsrfToken = null;

export function setCsrfToken(token) {
  if (token) {
    activeCsrfToken = token;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('xsrf_token', token);
      } catch {}
    }
  } else {
    activeCsrfToken = null;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('xsrf_token');
      } catch {}
    }
  }
}

// Função auxiliar para ler cookies no frontend (fallback para same-origin)
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export function getCsrfToken() {
  if (activeCsrfToken) return activeCsrfToken;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('xsrf_token');
      if (stored) {
        activeCsrfToken = stored;
        return stored;
      }
    } catch {}
  }
  return getCookie('XSRF-TOKEN');
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'x-xsrf-token',
});

// Interceptor de requisição: injeta x-company-id e o token CSRF em métodos mutantes
api.interceptors.request.use(
  (config) => {
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      config.headers['x-company-id'] = companyId;
    }

    const method = config.method?.toLowerCase();
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      const csrf = getCsrfToken();
      if (csrf) {
        config.headers['X-XSRF-TOKEN'] = csrf;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta: captura tokens renovados e trata expiração de sessão
api.interceptors.response.use(
  (response) => {
    // Sincroniza token CSRF vindo no cabeçalho ou no payload de autenticação
    const newCsrf = response.data?.data?.csrfToken || response.headers?.['x-xsrf-token'];
    if (newCsrf) {
      setCsrfToken(newCsrf);
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    const isSkipped = SKIP_REFRESH_ROUTES.some((route) => original.url?.includes(route));

    if (error.response?.status === 401 && !original._retry && !isSkipped) {
      original._retry = true;
      try {
        const refreshRes = await api.post('/auth/refresh');
        const refreshedCsrf = refreshRes.data?.data?.csrfToken || refreshRes.headers?.['x-xsrf-token'];
        if (refreshedCsrf) {
          setCsrfToken(refreshedCsrf);
          if (['post', 'put', 'delete', 'patch'].includes(original.method?.toLowerCase())) {
            original.headers['X-XSRF-TOKEN'] = refreshedCsrf;
          }
        }
        return api(original);
      } catch {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
