/**
 * Extrator e formatador amigável de mensagens de erro da API.
 * Converte erros do Axios/Network em mensagens claras em português.
 * @param {Error|any} error 
 * @param {string} defaultMessage 
 * @returns {string}
 */
export function getErrorMessage(error, defaultMessage = 'Ocorreu um erro ao processar a solicitação.') {
  if (!error) return defaultMessage;

  // Erro retornado pela API backend (ex: { success: false, message: "..." })
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Falha de rede / sem conexão com o servidor
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Servidor indisponível ou falha na conexão de rede. Verifique sua internet.';
  }

  // Timeout da requisição
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'O servidor demorou muito para responder. Tente novamente.';
  }

  // Mensagem direta do Error ou fallback
  return error.message || defaultMessage;
}
