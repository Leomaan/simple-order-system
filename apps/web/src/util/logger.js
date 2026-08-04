const isDev = import.meta.env.DEV;

/**
 * Utilitário de logging estruturado e leve para o Frontend (React).
 * Responsabilidade Única: Formatar e gerenciar os logs no navegador sem poluir produção.
 */
export const logger = {
  info: (message, meta = null) => {
    if (isDev) {
      console.log(`%c[INFO] ${message}`, 'color: #3b82f6; font-weight: bold;', meta || '');
    }
  },

  warn: (message, meta = null) => {
    if (isDev) {
      console.warn(`%c[WARN] ${message}`, 'color: #f59e0b; font-weight: bold;', meta || '');
    }
  },

  error: (message, error = null) => {
    console.error(`%c[ERROR] ${message}`, 'color: #ef4444; font-weight: bold;', error || '');
    
    // Em produção, os erros críticos do React podem ser reportados para a API ou serviço de monitoramento
    if (!isDev && error) {
      try {
        // Exemplo: Envio silencioso em background do erro para o backend se necessário
      } catch (err) {
        // Ignora falhas no envio silencioso para não interromper a UI
      }
    }
  }
};

export default logger;
