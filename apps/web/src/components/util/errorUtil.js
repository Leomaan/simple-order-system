/**
 * Utilitário central de tratamento e tradução de mensagens de erro para o frontend.
 * Converte erros técnicos ou em inglês vindos da API em mensagens amigáveis em português.
 */
const ERROR_TRANSLATIONS = {
  // Erros de Pedido / Mesa
  'table already has an open order': 'A mesa informada já possui um pedido aberto em andamento.',
  'table already exists': 'A mesa informada já está aberta no sistema.',
  'table is required': 'Por favor, informe o número da mesa.',
  'order not found': 'Pedido não encontrado no sistema.',
  'order is not open': 'Este pedido já foi encerrado ou fechado.',
  'cannot delete order with items': 'Não é possível excluir uma mesa com consumo lançado. Cancele os itens ou feche a conta primeiro.',
  'order item not found': 'Item do pedido não encontrado.',

  // Erros de Produto
  'product already exists': 'Já existe um produto cadastrado com este nome.',
  'product not found': 'Produto não encontrado.',
  'invalid category': 'Categoria selecionada é inválida.',

  // Erros de Usuário / Autenticação
  'user already exists': 'Já existe um usuário cadastrado com este e-mail.',
  'user not found': 'Usuário não encontrado.',
  'invalid credentials': 'E-mail ou senha incorretos.',
  'user is not active': 'Sua conta de usuário foi desativada. Entre em contato com um Administrador.',
  'unauthorized': 'Sua sessão expirou. Por favor, faça login novamente.',
  'forbidden': 'Você não tem permissão para realizar esta ação.',
  'no data provided': 'Por favor, preencha os dados necessários para esta operação.',

  // Erros de Conexão / Rede
  'network error': 'Falha na conexão com o servidor. Verifique sua internet.',
  'failed to fetch': 'Não foi possível conectar ao servidor.',
  'request failed with status code 500': 'Erro interno no servidor. Tente novamente em alguns instantes.',
};

export function formatErrorMessage(err, fallback = 'Ocorreu um erro ao processar a requisição.') {
  if (!err) return fallback;

  // Extrai mensagem da resposta da API (Zod array ou mensagem string)
  const rawMsg = err.response?.data?.message || err.message || err;
  
  if (Array.isArray(rawMsg)) {
    return rawMsg
      .map((item) => {
        const text = typeof item === 'string' ? item : item.message || JSON.stringify(item);
        return translateSingleMessage(text);
      })
      .join(', ');
  }

  return translateSingleMessage(String(rawMsg || fallback));
}

function translateSingleMessage(msg) {
  if (!msg) return 'Ocorreu um erro inesperado.';
  
  const lower = msg.toLowerCase();

  for (const [pattern, translation] of Object.entries(ERROR_TRANSLATIONS)) {
    if (lower.includes(pattern)) {
      return translation;
    }
  }

  // Retorna a própria mensagem se já estiver traduzida ou não mapeada
  return msg;
}
