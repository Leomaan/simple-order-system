export const ACTION_LABEL = {
  LOGIN: 'Entrou no sistema',
  LOGOUT: 'Saiu do sistema',
  CREATE_PRODUCT: 'Criou produto',
  UPDATE_PRODUCT: 'Editou produto',
  DELETE_PRODUCT: 'Removeu produto',
  RESTORE_PRODUCT: 'Restaurou produto',
  PERMANENT_DELETE_PRODUCT: 'Deletou produto permanentemente',
  CREATE_ORDER: 'Abriu pedido',
  CLOSE_ORDER: 'Fechou pedido',
  DELETE_ORDER: 'Removeu pedido',
  UPDATE_ORDER: 'Editou pedido',
  RESTORE_ORDER: 'Restaurou pedido',
  PERMANENT_DELETE_ORDER: 'Deletou pedido permanentemente',
  CREATE_USER: 'Criou usuário',
  UPDATE_USER: 'Editou usuário',
  DELETE_USER: 'Removeu usuário',
  RESTORE_USER: 'Restaurou usuário',
  PERMANENT_DELETE_USER: 'Deletou usuário permanentemente',
  ADD_ORDER_ITEM: 'Adicionou item ao pedido',
  UPDATE_ORDER_ITEM: 'Alterou item do pedido',
  REMOVE_ORDER_ITEM: 'Removeu item do pedido',
  PAY_ORDER: 'Confirmou pagamento',
};

export const ENTITY_LABEL = {
  Product: 'Produto',
  Order: 'Pedido',
  User: 'Usuário',
  OrderItem: 'Item',
};

export const ICONS = {
  table: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
    </svg>
  ),
  tag: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  product: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8" />
    </svg>
  ),
  money: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  person: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  info: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function getActionStyle(action) {
  const defaults = {
    dot: 'bg-neutral-500',
    badge: 'bg-neutral-700/60 text-neutral-400 ring-1 ring-neutral-600/30',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };

  if (action === 'PAY_ORDER') {
    return {
      dot: 'bg-amber-500',
      badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    };
  }
  if (action.startsWith('CREATE') || action.startsWith('ADD') || action.startsWith('RESTORE')) {
    return {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
    };
  }
  if (action.startsWith('DELETE') || action.startsWith('REMOVE') || action.startsWith('PERMANENT')) {
    return {
      dot: 'bg-red-500',
      badge: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
    };
  }
  if (action.startsWith('UPDATE') || action === 'CLOSE_ORDER') {
    return {
      dot: 'bg-blue-500',
      badge: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
    };
  }
  return defaults;
}

export function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return { relative: 'agora', full: new Date(dateStr).toLocaleString('pt-BR') };
  if (mins < 60) return { relative: `${mins}m atrás`, full: new Date(dateStr).toLocaleString('pt-BR') };
  if (hours < 24) return { relative: `${hours}h atrás`, full: new Date(dateStr).toLocaleString('pt-BR') };
  return { relative: `${days}d atrás`, full: new Date(dateStr).toLocaleString('pt-BR') };
}